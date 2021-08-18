import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

import config from './config.json';

export default function App() {
  const isLoadingComplete = useCachedResources();
  const colorScheme = useColorScheme();

  defaultLogin().then(res => {
    if (!isLoadingComplete) {
      return null;
    } else {
      return (
        <SafeAreaProvider>
          <Navigation colorScheme={colorScheme} loginNeeded={!res} />
          <StatusBar />
        </SafeAreaProvider>
      );
    }
  })
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
