import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

import config from '../config.json';

export default function defaultLogin(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem("@refreshtoken").then(refreshtoken => {
            if (!refreshtoken) {
                resolve(true);
            }
            else {
                NetInfo.fetch().then(state => {
                    if (!state.isConnected) { //assumes logged in if a refresh token exists and there is no connection so the user may view cached resources
                        resolve(false);
                    }
                    else {
                        fetch(`${config.server}/api/auth/token/refresh`, { //refresh token endpoint
                            method: "POST",
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                refresh: refreshtoken
                            })
                        }).then((response) => response.json())
                            .then((json) => {
                                if (json.access && json.refresh) {
                                    AsyncStorage.setItem('@accesstoken', json.access).then(() => {
                                        AsyncStorage.setItem('@refreshtoken', json.refresh).then(() => {
                                            resolve(false);
                                        }).catch(err => resolve(true));
                                    }).catch(err => resolve(true));
                                }
                                else {
                                    resolve(true);
                                }
                            }).catch(err => resolve(true));
                    }
                })
            }
        }).catch(err => resolve(true));
    })
}
