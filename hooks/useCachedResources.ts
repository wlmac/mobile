import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import NetInfo from "@react-native-community/netinfo";
import { Alert } from 'react-native';
import RNRestart from 'react-native-restart';
import defaultLogin from '../lib/defaultLogin';
import cacheResources from '../lib/cacheResources';

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
          if(!res) {
            cacheResources();
          }
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
