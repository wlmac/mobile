// Wrapper for the Metropolis API

import { AxiosRequestConfig } from 'axios';
import config from '../config.json';

import { TagData, OrganizationData, AnnouncementData, BlogPostData, CommentData, EventData, UserData, EventDataHandler } from './impl';
import { DateTimeString, LimitOffsetPagination, TimetableCourse, TokenPair, Weather } from './misc';
import { apiRequest, axiosInstance, refreshLogin, login } from './core';
import React from 'react';
import { Session, SessionContext } from '../util/session';

export type { TagData, OrganizationData, AnnouncementData, BlogPostData, CommentData, EventData, UserData };
export type { LimitOffsetPagination, TokenPair, Weather };
export type { DateTimeString, URLString, Base64String, TimezoneString, TermType, ID, Nullable, anyObject } from './misc';
export { TagDataHandler, OrganizationDataHandler, AnnouncementDataHandler, BlogPostDataHandler, CommentDataHandler, EventDataHandler, UserDataHandler } from './impl';
export { TagDescriptor, OrganizationDescriptor, CommentDescriptor, UserDescriptor } from './impl';
export { Handler, IDObject } from './obj';
export { apiRequest, refreshLogin, login };

// Misc API functions

export async function getWeather(): Promise<Weather>{
    // imho we should put the weather api onto the main domain
    const request = await axiosInstance.get(`${config.weatherserver}/weather`);
    const data = request.data.consolidated_weather[0];
    return {
        state: data.weather_state_abbr,
        temperature: Math.round(data.temperature),
    };
}

export async function getEventsOnDay(date: DateTimeString, session: Session, options?: AxiosRequestConfig<LimitOffsetPagination<EventData>>){
    return getEventsInRange(date, date, session, options);
}

export async function getEventsInRange(start: DateTimeString, end: DateTimeString, session: Session, options?: AxiosRequestConfig<LimitOffsetPagination<EventData>>){
    const events: EventData[] = [];
    for await (const event of EventDataHandler.list(session, 5000, 0, {
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
export async function getSchedule(noAuth: boolean, session: Session, date?: DateTimeString): Promise<TimetableCourse[] | string>{
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
        session,
        noAuth,
        {
            ...date && { params: { date } },
        });
    
    if (typeof res === "string") {
        if(res === "API error"){
            // The backend returns 404 when there's no current term (i.e. it's summer break) and apiRequest catches it as a generic error
            // so we assume that's what happened here

            return "No current term";
        }
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