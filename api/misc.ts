/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Basic types

export type DateTimeString = string;
export type URLString = string;
export type Base64String = string;
export type TimezoneString = string;
export type TermType = number;
export type ID<T> = number;

export type Nullable<T> = T | null;

export type anyObject = Record<string, any>;

// Miscellaneous types

export interface LimitOffsetPagination<T> {
    count: number,
    next: Nullable<URLString>,
    previous: Nullable<URLString>,
    results: T[],
}

// Not sure where this would be needed but I'll leave it here for now
interface ApiErrorResponse {
    errors: {
        for: string,
        description: string,
    }[];
}

export interface TokenPair {
    refresh: string,
    access: string,
}

export interface TimetableCourse {
    course: string,
    cycle: string,
    description: {
        time: string,
        course: string,
    },
    position: number[],
    start: number,
    end: number
}

export interface Weather {
    state: "c" | "lc" | "hc" | "s" | "hr" | "t" | "sn" | "hc";
    temperature: number;
}
