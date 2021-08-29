import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import { Buffer } from 'buffer';

import config from '../config.json';
import defaultLogin from './defaultLogin';

export default function apiRequest(endpoint: string, body: string): Promise<ApiResponse> {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem("@accesstoken").then(accesstoken => {
            let decoded = JSON.parse(String(Buffer.from(String(accesstoken).split('.')[1], 'base64')));
            if (parseInt(decoded.exp) <= Math.round(Date.now() / 1000.0) - 30) {
                defaultLogin().then(res => {
                    if (!res) {
                        return apiRequest(endpoint, body);
                    }
                    else {
                        Alert.alert('Error', `An app restart is required. App will close now.`, [{ text: 'Exit', onPress: () => RNExitApp.exitApp() }], { cancelable: false });
                    }
                }).catch(err => resolve(new ApiResponse(false, '', 'Error fetching refresh token')));
            }
            else {
                fetch(`${config.server}${endpoint}`, {
                    method: "GET",
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
        }).catch(err => resolve(new ApiResponse(false, '', 'Storage access error')));
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
