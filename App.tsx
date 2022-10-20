import 'react-native-gesture-handler';

import * as React from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';
import * as Device from 'expo-device';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';

export default function App() {
  const startupHook = useCachedResources();

  Device.getDeviceTypeAsync().then((type: number) => {
    if(type == 2) {
      /*According to Expo docs,
      0 is unknown, 1 is phone, 2 is tablet, 3 is desktop, 4 is tv*/
      ScreenOrientation.unlockAsync().catch((err: any) => {});
    }
  }).catch((err: any) => {});
  
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