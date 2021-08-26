import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config.json';

export default function defaultLogin(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        AsyncStorage.getItem("@refreshtoken").then(refreshtoken => {
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
                    if (json.access) {
                        AsyncStorage.setItem('@accesstoken', json.access).then(() => {
                            resolve(false);
                        }).catch(err => resolve(true));
                    }
                    else {
                        resolve(true);
                    }
                }).catch(err => resolve(true));
        }).catch(err => resolve(true));
    })
}
