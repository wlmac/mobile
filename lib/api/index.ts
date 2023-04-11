// Wrapper for the Metropolis API

import axios, { AxiosRequestConfig } from 'axios';
import config from '../../config.json';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { EventData, ObjectType, StringToListType } from './proxy';

export type { TagData, OrganizationData, AnnouncementData, BlogPostData, CommentData, EventData, UserData } from './proxy';

// Basic types

export type DateTimeString = string;
export type URLString = string;
export type Base64String = string;
export type TimezoneString = string;
export type TermType = number;
export type ID<T> = number;

export type Nullable<T> = T | null;


type LimitOffsetPagination<T> = {
    count: number,
    next: Nullable<URLString>,
    previous: Nullable<URLString>,
    results: T[],
};

type ApiErrorResponse = {
    errors: {
        for: string,
        description: string,
    }[];
};


export const axiosInstance = axios.create({
    // baseURL: config.server,
    baseURL: "http://127.0.0.1:8000/api",
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
    },
});

// If you're confused on how to use this:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of
async function* objectListRequest<objType extends ObjectType, T = StringToListType<objType>>(type: objType, options?: AxiosRequestConfig<LimitOffsetPagination<T>>, limit=50, offset=0): AsyncIterableIterator<T>{
    let url: URLString | null = `v3/obj/${type}?limit=${limit}&offset=${offset}`;
    do{
        let response: LimitOffsetPagination<T> = (await axiosInstance.get<LimitOffsetPagination<T>>(url, options)).data;
        for(const data of response.results)
            yield data;
        url = response.next;
    }while(url !== null);
}


// Login-related functions

/**
 * @returns `undefined` if success, otherwise the error message.
 */
async function login(username: string, password: string): Promise<string | undefined>{
    try{
        const response = await axiosInstance.post("auth/token", {
            username,
            password,
        });
        const json = response.data;
        if (json.access && json.refresh) {
            await AsyncStorage.setItem('@accesstoken', json.access);
            await AsyncStorage.setItem('@refreshtoken', json.refresh);
            return;
        }else if(json.detail){
            return "Username or password incorrect";
        }else{
            return "Something went wrong. Please try again later."
        }
    }catch(err){
        console.error(err);
        return "Network error. Please try again later.";
    }
}

/**
 * Refreshes the login state of the user.
 * @returns `true` if success, `false` otherwise
 */
export async function refreshLogin(){
    try{
        const refreshtoken = AsyncStorage.getItem("@refreshtoken");
        if (!refreshtoken) {
            return false;
        }
        const state = await NetInfo.fetch();
        if (!state.isConnected) { //assumes logged in if a refresh token exists and there is no connection so the user may view cached resources
            return true;
        }
        const response = await axiosInstance.post(`auth/token/refresh`, {
            refresh: refreshtoken,
        });
        const json = response.data;

        if (json.access && json.refresh) {
            await AsyncStorage.setItem('@accesstoken', json.access);
            await AsyncStorage.setItem('@refreshtoken', json.refresh);
            return true;
        }
        return false;
    }catch(err){
        console.error(err);
        return false;
    }
}

/**
 * @returns the data if success, otherwise the error message.
 */
async function apiRequest<T>(endpoint: string, body: string | undefined, method: string, noAuth?: boolean): Promise<T | string> {
    if (noAuth) {
        try{
            let response = await axiosInstance<T>(endpoint, { method, data: body });
            return response.data;
        }catch(err){
            console.error(err);
            return 'API error';
        }
    }else{
        let accessToken, tokenData;
        try{
            accessToken = await AsyncStorage.getItem("@accesstoken");
            tokenData = JSON.parse(String(Buffer.from(String(accessToken).split('.')[1], 'base64')));
        }catch(err){
            console.error(err);
            return 'Storage access error';
        }

        if (Math.round(Date.now() / 1000) - 30 >= parseInt(tokenData.exp)) {
            if(await refreshLogin()){
                return apiRequest(endpoint, body, method);
            }
            return 'An unknown error occurred';
        } else {
            try{
                let response = await axiosInstance<T>(endpoint, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    }
                });
                return response.data;
            }catch(err){
                console.error(err);
                return 'Error fetching refresh token';
            }
        }
    }
}


// Misc API functions

export interface Weather{
    state: "c" | "lc" | "hc" | "s" | "hr" | "t" | "sn" | "hc";
    temperature: number;
}

export async function getWeather(): Promise<Weather>{
    // imho we should put the weather api onto the main domain
    const data = (await axiosInstance.get(`${config.weatherserver}/weather`)).data.consolidated_weather[0];
    return {
        state: data.weather_state_abbr,
        temperature: Math.round(data.temperature),
    };
}

export async function getEventsOnDay(date: DateTimeString, options?: AxiosRequestConfig<LimitOffsetPagination<EventData>>){
    return getEventsInRange(date, date, options);
}

export async function getEventsInRange(start: DateTimeString, end: DateTimeString, options?: AxiosRequestConfig<LimitOffsetPagination<EventData>>){
    const events: EventData[] = [];
    for await (const event of objectListRequest("event", { ...options, 
        params: {
            start,
            end,
        }
    })){
        events.push(event);
    }
    return events;
}

// helper function for getSchedule
function parseTime(time: string){
    return ((Date.parse(time) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000;
}

/**
 * @returns the data if success, otherwise the error message.
 */
export async function getSchedule(noAuth: boolean, date?: DateTimeString){
    const res = await apiRequest<any>((noAuth ? "/api/term/current/schedule" : "/api/me/schedule") + (date ? "?date=" + date : ""), undefined, "GET", noAuth);
    if (typeof res === "string") {
        return res;
    }

    // TODO fix this
    const schedule: any[] = [];
    for(const segment of res){
        schedule.push({
            time: segment.time,
            course: segment.course,
            start: parseTime(segment.time.start),
            end: parseTime(segment.time.end),
        });
    }

    return schedule;
}