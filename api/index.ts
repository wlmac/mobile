// Wrapper for the Metropolis API

import { AxiosRequestConfig } from 'axios';
import config from '../config.json';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { TagData, OrganizationData, AnnouncementData, BlogPostData, CommentData, EventData, UserData, EventDataHandler } from './impl';
import { DateTimeString, LimitOffsetPagination, TimetableCourse, TokenPair, Weather } from './misc';
import { apiRequest, axiosInstance, refreshLogin } from './core';
export type { TagData, OrganizationData, AnnouncementData, BlogPostData, CommentData, EventData, UserData };
export type { LimitOffsetPagination, TokenPair, Weather };
export type { DateTimeString, URLString, Base64String, TimezoneString, TermType, ID, Nullable, anyObject } from './misc';
export { TagDataHandler, OrganizationDataHandler, AnnouncementDataHandler, BlogPostDataHandler, CommentDataHandler, EventDataHandler, UserDataHandler } from './impl';
export { apiRequest, refreshLogin };

// Login-related functions

/**
 * @returns `undefined` if success, otherwise the error message.
 */
export async function login(username: string, password: string): Promise<string | undefined>{
    console.trace();
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


// Misc API functions

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
    for await (const event of EventDataHandler.list(5000, 0, {
        params: {
            start,
            end,
        },
    })){
        events.push(event);
    }
    return events;
}

/**
 * @returns the data if success, otherwise the error message.
 */
export async function getSchedule(noAuth: boolean, date?: DateTimeString): Promise<TimetableCourse[] | string>{
    function parseTime(time: string){
        return ((Date.parse(time) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000;
    }

    const res = await apiRequest<{
        course: string,
        cycle: string,
        description: {
            time: string,
            course: string,
        },
        position: number[], // TODO: what is this?
        time: {
            start: DateTimeString,
            end: DateTimeString,
        },
    }[]>(
        noAuth ? "term/current/schedule" : "me/schedule",
        undefined,
        "GET",
        noAuth,
        {
            ...date && { params: { date } },
        });
    
    if (typeof res === "string") {
        return res;
    }

    // TODO fix this
    const schedule: any[] = [];
    for(const segment of res){
        const { time, ...rest } = segment;
        schedule.push({
            start: parseTime(time.start),
            end: parseTime(time.end),
            ...rest,
        });
    }

    return schedule;
}