import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

import config from '../config.json';

// btw: this returns false if success and true if fail for some reason
async function defaultLogin(): Promise<boolean> {
    try{
        const refreshtoken = AsyncStorage.getItem("@refreshtoken");
        if (!refreshtoken) {
            return true;
        }
        const state = await NetInfo.fetch();
        if (!state.isConnected) { //assumes logged in if a refresh token exists and there is no connection so the user may view cached resources
            return false;
        }
        const response = await fetch(`${config.server}/api/auth/token/refresh`, { //refresh token endpoint
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh: refreshtoken
            })
        });
        const json = await response.json();

        if (!(json.access && json.refresh)) {
            return true;
        }
        await AsyncStorage.setItem('@accesstoken', json.access);
        await AsyncStorage.setItem('@refreshtoken', json.refresh);
        return false;
    }catch(err){
        return true;
    }
}
