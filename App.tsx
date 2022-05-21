import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import * as ScreenOrientation from 'expo-screen-orientation';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as Device from 'expo-device';
import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const startupHook = useCachedResources();

  Device.getDeviceTypeAsync().then(type => {
    /*According to Expo docs,
      0 is unknown, 1 is phone, 2 is tablet, 3 is desktop, 4 is tv*/
    if (type != 2) {
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  }).catch(err => { });

  if (!startupHook.isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation loginNeeded={startupHook.loginNeeded} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}