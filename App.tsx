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
  const colorScheme = useColorScheme();

  Device.getDeviceTypeAsync().then(type => {
    if(type == 2) {
      /*According to Expo docs,
      0 is unknown, 1 is phone, 2 is tablet, 3 is desktop, 4 is tv*/
      ScreenOrientation.unlockAsync().catch(err => {});
    }
  }).catch(err => {});
  
  if (!startupHook.isLoadingComplete) {
    return null;
  } else {
    return (
      <SafeAreaProvider>
        <Navigation colorScheme={colorScheme} loginNeeded={startupHook.loginNeeded} />
        <StatusBar />
      </SafeAreaProvider>
    );
  }
}