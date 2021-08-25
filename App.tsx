import 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import useCachedResources from './hooks/useCachedResources';
import useColorScheme from './hooks/useColorScheme';
import Navigation from './navigation';

export default function App() {
  const startupHook = useCachedResources();
  const colorScheme = useColorScheme();

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