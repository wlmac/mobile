import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

import config from '../config.json';
import defaultLogin from './defaultLogin';

export default async function apiRequest(endpoint: string, body: string, method: string, noAuth?: boolean): Promise<ApiResponse> {
    if (noAuth) {
        try{
            let response = await fetch(`${config.server}${endpoint}`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body
            });
            return new ApiResponse(true, await response.text(), '');
        }catch(err){
            console.error(err);
            return new ApiResponse(false, '', 'API error');
        }
    }
    else {
        //TODO investigate the types of the errors and see if we can avoid nested try/catches
        try{
            let accesstoken = await AsyncStorage.getItem("@accesstoken");
            let decoded = JSON.parse(String(Buffer.from(String(accesstoken).split('.')[1], 'base64')));
            if (parseInt(decoded.exp) <= Math.round(Date.now() / 1000.0) - 30) {
                // is this try/catch unnecessary?
                try{
                    if(await defaultLogin()){
                        return new ApiResponse(false, '', 'An unknown error occurred');
                    }else{
                        return apiRequest(endpoint, body, method);
                    }
                }catch(err){
                    console.error(err);
                    return new ApiResponse(false, '', 'Error fetching refresh token');
                }
            } else {
                try{
                    let response = await fetch(`${config.server}${endpoint}`, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accesstoken}`
                        },
                        body
                    });
                    return new ApiResponse(true, await response.text(), '');
                }catch(err){
                    console.error(err);
                    return new ApiResponse(false, '', 'Error fetching refresh token');
                }
            }
        }catch(err){
            console.error(err);
            return new ApiResponse(false, '', 'Storage access error');
        }
    }
}

class ApiResponse {
    success: boolean;
    response: string;
    error: string;
    constructor(success: boolean, response: string, error: string) {
        this.success = success;
        this.response = response;
        this.error = error;
    }
}
