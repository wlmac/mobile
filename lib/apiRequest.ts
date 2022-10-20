import AsyncStorage from '@react-native-async-storage/async-storage';
import { Buffer } from 'buffer';

import config from '../config.json';
import defaultLogin from './defaultLogin';

export default function apiRequest(endpoint: string, body: string, method: string, noAuth?: boolean): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
        if (noAuth) {
            fetch(`${config.server}${endpoint}`, {
                method: method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            }).then((response) => response.text())
                .then((text) => {
                    resolve(new ApiResponse(true, text, ''));
                }).catch(err => resolve(new ApiResponse(false, '', 'API error')));
        }
        else {
            AsyncStorage.getItem("@accesstoken").then((accesstoken: any) => {
                let decoded = JSON.parse(String(Buffer.from(String(accesstoken).split('.')[1], 'base64')));
                if (parseInt(decoded.exp) <= Math.round(Date.now() / 1000.0) - 30) {
                    defaultLogin().then(res => {
                        if (!res) {
                            return apiRequest(endpoint, body, method);
                        }
                        else {
                            resolve(new ApiResponse(false, '', 'An unknown error occurred'));
                        }
                    }).catch(err => resolve(new ApiResponse(false, '', 'Error fetching refresh token')));
                }
                else {
                    fetch(`${config.server}${endpoint}`, {
                        method: method,
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accesstoken}`
                        },
                        body: body
                    }).then((response) => response.text())
                        .then((text) => {
                            resolve(new ApiResponse(true, text, ''));
                        }).catch(err => resolve(new ApiResponse(false, '', 'API error')));
                }
            }).catch((err: any) => resolve(new ApiResponse(false, '', 'Storage access error')));
        }
    })
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
