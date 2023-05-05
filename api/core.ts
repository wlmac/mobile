import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import config from '../config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { Buffer } from "buffer";
import { TokenPair, anyObject } from './misc';

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
export async function apiRequest<T>(endpoint: string, body: string | anyObject | undefined, method: "GET" | "POST" /* | etc... */, noAuth: boolean = false, options?: AxiosRequestConfig<T>): Promise<T | string> {
    let result;
    if(noAuth){
        result = await _apiRequest<T>(endpoint, body, method, options);
    }else{
        // Log in
        let accessToken, tokenData;
        try{ 
            accessToken = await AsyncStorage.getItem("@accesstoken");
            tokenData = JSON.parse(String(Buffer.from(String(accessToken).split('.')[1], 'base64')));
        }catch(err){
            console.error(err);
            return 'Storage access error';
        }

        // token expired
        if (Math.round(Date.now() / 1000) - 30 >= parseInt(tokenData.exp) ||
                Number.isNaN(parseInt(tokenData.exp))) { // Just in case the token is corrupted in some way
            if(!await refreshLogin()){
                return 'An unknown error occurred';
            }
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
async function _apiRequest<T>(endpoint: string, body: string | anyObject | undefined, method: "GET" | "POST" /* | etc... */, options?: AxiosRequestConfig<T>): Promise<T | string> {
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
export async function refreshLogin(): Promise<boolean> {
    try{
        const refreshToken = await AsyncStorage.getItem("@refreshtoken");
        if (!refreshToken) {
            return true;
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
        await AsyncStorage.setItem('@accesstoken', tokens.access);
        await AsyncStorage.setItem('@refreshtoken', tokens.refresh);
        return true;
    }catch(err){
        console.error(err);
        return false;
    }
}
