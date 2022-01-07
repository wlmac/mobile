import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import NetInfo from "@react-native-community/netinfo";
import { Alert } from 'react-native';
import RNRestart from 'react-native-restart';

import AsyncStorageLib from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

import apiRequest from '../lib/apiRequest';
import defaultLogin from '../lib/defaultLogin';

export default function useCachedResources() {
  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [loginNeeded, setDefaultLoginDone] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        await NetInfo.fetch().then(state => {
          if (!state.isConnected) {
            Alert.alert('Error', `No internet connection found`, [{ text: 'Retry', onPress: () => {
              RNRestart.Restart();
            } }], { cancelable: false });
          }
        })
        await defaultLogin().then(res => {
          setDefaultLoginDone(res);
          // store events
          cacheEvents();
        })
        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
        });
        await Font.loadAsync({
          'poppins': require('../assets/fonts/Poppins/Poppins-Bold.ttf'),
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

async function cacheEvents() {
  // request
  await apiRequest(`/api/events?start=2021-09-20`, '', 'GET').then(res => {
    if (res.success) {
      AsyncStorage.setItem("@events", res.response);
    } else {
      console.log("API request error: " + res.response);
    }
  })
}