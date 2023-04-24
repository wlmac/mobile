import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

import config from '../config.json';
import defaultLogin from './defaultLogin';
import axios from 'axios';

async function apiRequest<T>(endpoint: string, body: string | undefined, method: string, noAuth?: boolean): Promise<ApiResponse<T>> {
    if (noAuth) {
        try{
            let response = await axiosInstance<T>(endpoint, { method, data: body });
            console.log(response);
            return ApiResponse.success(response.data);
        }catch(err){
            console.error(err);
            return ApiResponse.error('API error');
        }
    }
    else {
        //TODO investigate the types of the errors and see if we can avoid nested try/catches
        try{
            let accesstoken = await AsyncStorage.getItem("@accesstoken");
            let decoded = JSON.parse(String(Buffer.from(String(accesstoken).split('.')[1], 'base64')));
            if (parseInt(decoded.exp) <= Math.round(Date.now() / 1000) - 30) {
                // is this try/catch unnecessary?
                if(await defaultLogin()){
                    return ApiResponse.error('An unknown error occurred');
                }else{
                    return apiRequest(endpoint, body, method);
                }
            } else {
                try{
                    let response = await axiosInstance<T>(endpoint, {
                        method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accesstoken}`
                        }
                    });
                    return ApiResponse.success(response.data);
                }catch(err){
                    console.error(err);
                    return ApiResponse.error('Error fetching refresh token');
                }
            }
        }catch(err){
            console.error(err);
            return ApiResponse.error('Storage access error');
        }
    }
}

class ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    private constructor(success: boolean, data?: T, error?: string) {
        this.success = success;
        this.data = data;
        this.error = error;
    }
    static success<T>(data: T){
        return new ApiResponse<T>(true, data, undefined);
    }
    static error<T>(msg: string){
        return new ApiResponse<T>(false, undefined, msg);
    }
}
