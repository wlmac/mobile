import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import NetInfo from "@react-native-community/netinfo";
import { Alert } from 'react-native';
import RNExitApp from 'react-native-exit-app';

import defaultLogin from '../components/defaultLogin';

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
            Alert.alert('Error', `No internet connection found`, [{ text: 'Exit', onPress: () => RNExitApp.exitApp() }], { cancelable: false });
          }
        })
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
