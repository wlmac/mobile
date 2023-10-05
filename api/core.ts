import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import config from '../config.json';
import NetInfo from "@react-native-community/netinfo";
import { Buffer } from "buffer";
import { TokenPair, anyObject } from './misc';
import { Session } from '../util/session';

export const axiosInstance = axios.create({
    baseURL: config.server,
    // baseURL: require('./testserver.json').server,
    withCredentials: false,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin' : '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS', 
    },
});

/**
 * @returns the data if success, otherwise the error message.
 */
export async function apiRequest<T>(endpoint: string, body: string | anyObject | undefined, method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" /* | etc... */,  session: Session, noAuth = false, options?: AxiosRequestConfig<T>): Promise<T | string> {
    if(/^\/?api\//.test(endpoint)){
        console.warn("The base URL for apiRequest already includes /api/, try removing it from the endpoint");
    }

    let result;
    if(noAuth){
        result = await _apiRequest<T>(endpoint, body, method, options);
    }else{
        // Log in
        let accessToken = session.get<string>("@accesstoken"), tokenData;
        if(accessToken === undefined){
            console.warn("No access token while noAuth is set, this is probably a mistake");
            return await _apiRequest<T>(endpoint, body, method, options);
        }
        try{
            tokenData = JSON.parse(String(Buffer.from(accessToken.split('.')[1], 'base64')));
        }catch(err){
            console.error(err);
            return 'Storage access error';
        }

        // token expired or doesn't exist
        if (Math.round(Date.now() / 1000) - 30 >= parseInt(tokenData.exp) ||
                Number.isNaN(parseInt(tokenData.exp))) { // Just in case the token is corrupted in some way
            if(!await refreshLogin(session)){
                return 'An unknown error occurred';
            }
            
            accessToken = session.get<string>("@accesstoken");
        }

        result = await _apiRequest<T>(endpoint, body, method, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
    }
    return result;
}
async function _apiRequest<T>(endpoint: string, body: string | anyObject | undefined, method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" /* | etc... */, options?: AxiosRequestConfig<T>): Promise<T | string> {
    try{
        let response = await axiosInstance<T>(endpoint, { method, data: body, ...options });
        return response.data;
    }catch(err){
        console.error(err);
        return 'API error';
    }
}

/**
 * Refreshes the login of the user.
 * @returns true if success, false otherwise
 */
export async function refreshLogin(session: Session): Promise<boolean> {
    try{
        const refreshToken = session.get("@refreshtoken");
        if (!refreshToken) {
            console.warn("No refresh token")
            return false;
        }
        const state = await NetInfo.fetch();
        if (!state.isConnected) { //assumes logged in if a refresh token exists and there is no connection so the user may view cached resources
            return false;
        }
        const response = await axiosInstance.post<TokenPair>('auth/token/refresh', { //refresh token endpoint
            refresh: refreshToken
        });
        const tokens = response.data;

        if (!(tokens.refresh && tokens.access)) {
            return false;
        }
        session.setAll({
            "@accesstoken": tokens.access,
            "@refreshtoken": tokens.refresh,
        });
        return true;
    }catch(err: unknown){
        if(err instanceof AxiosError && err.response && err.response.data.code == "token_not_valid"){
            console.error("invalid/expired token");
            session.remove("@accesstoken");
            session.remove("@refreshtoken");
            return false;
        }
        console.error(err);
        return false;
    }
}

/**
 * @returns `undefined` if success, otherwise the error message.
 */
export async function login(username: string, password: string, session: Session): Promise<string | undefined>{
    try{
        const response = await axiosInstance.post("auth/token", {
            username,
            password,
        });
        const tokens = response.data;
        if (tokens.access && tokens.refresh) {
            console.log("setting state:", tokens);
            session.setAll({
                "@accesstoken": tokens.access,
                "@refreshtoken": tokens.refresh,
            });
            return;
        }else if(tokens.detail){
            return "Username or password incorrect";
        }else{
            return "Something went wrong. Please try again later."
        }
    }catch(err){
        console.error(err);
        return "Network error. Please try again later.";
    }
}
