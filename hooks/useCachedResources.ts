import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import defaultLogin from '../lib/defaultLogin';
import cacheResources from '../lib/cacheResources';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export default function useCachedResources() {
  const colorScheme = useColorScheme();

  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [loginNeeded, setDefaultLoginDone] = React.useState(false);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    async function loadResourcesAndDataAsync() {
      try {
        SplashScreen.preventAutoHideAsync();
        await defaultLogin().then(res => {
          setDefaultLoginDone(res);
          if(!res) {
            cacheResources();
          }
        })

        await AsyncStorage.getItem("@scheme").then((scheme: any) => {
          
          if (!scheme) {
            console.log("Scheme is being set");
            AsyncStorage.setItem("@scheme", colorScheme as string);
          } else console.log("Scheme: " + scheme);
        });

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
