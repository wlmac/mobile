import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const startupHook = useCachedResources();
  const colorScheme = useColorScheme();

  try {
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      AsyncStorage.getItem('@notifscount').then(count => {
        if (count) {
          AsyncStorage.setItem('@notifscount', (parseInt(count) + 1).toString()).catch();
        } else {
          AsyncStorage.setItem('@notifscount', '1').catch();
        }
      })
    });
  }
  catch { }

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