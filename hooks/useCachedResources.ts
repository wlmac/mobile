import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config.json';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [loginNeeded, setDefaultLoginDone] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        await defaultLogin().then(res => {
          setDefaultLoginDone(res);
        })
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.warn(e);
      } finally {
        setLoadingComplete(true);
        SplashScreen.hideAsync();
      }
    }

    loadResourcesAndDataAsync();
  }, []);

  return { isLoadingComplete, loginNeeded };
}

function defaultLogin(): Promise<boolean> {
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
          if (json.accessToken) {
            AsyncStorage.setItem('@accesstoken', json.accesstoken).then(() => {
              resolve(true);
            }).catch(err => resolve(false));
          }
          else {
            resolve(false);
          }
        }).catch(err => resolve(false));
    }).catch(err => resolve(false));
  })
}
