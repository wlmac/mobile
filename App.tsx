import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import loadResources from './hooks/useResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';
import { SessionProvider } from './util/session';

import { Text, View } from './components/Themed';
import { axiosInstance } from './api/core';
export default function App() {
  React.useEffect(() => {
    Device.getDeviceTypeAsync().then(type => {
      /*According to Expo docs,
        0 is unknown, 1 is phone, 2 is tablet, 3 is desktop, 4 is tv*/
      if (type != 2) {
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
      }
    }).catch(err => { });
    
    // // debug axios
    // axiosInstance.interceptors.request.use(request => {
    //   console.log(`Starting Request to ${request.url} with params`, request.params, ":", request);
    //   return request;
    // });
    
  }, []);

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <Navigation />
        <StatusBar />
      </SessionProvider>
    </SafeAreaProvider>
    // <Text style={
    //   {
    //     color: "black"
    //   }
    // }>
    //   AAAAAA
    // </Text>
  );
}