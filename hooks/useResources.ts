import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { refreshLogin } from '../api';
import { SessionContext } from '../util/session';

export default function loadResources() {
  const colorScheme = useColorScheme();

  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [defaultLoggedIn, setDefaultLoginDone] = React.useState(false);

  const sessionContext = React.useContext(SessionContext);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    if(!sessionContext.loaded)
      return;
    
    async function loadResourcesAndDataAsync() {
      try {
        let res = await refreshLogin();
        if(res){
          setDefaultLoginDone(true);
        }
        
        const scheme = sessionContext.get("@scheme");
        if(!scheme){
          sessionContext.set("@scheme", colorScheme as string);
        }

        // Load fonts
        await Font.loadAsync({
          ...Ionicons.font,
          'space-mono': require('../assets/fonts/SpaceMono-Regular.ttf'),
          'poppins': require('../assets/fonts/Poppins/Poppins-Bold.ttf')
        });
      } catch (e) {
        // We might want to provide this error information to an error reporting service
        console.error(e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, [sessionContext.loaded]);

  return { isLoadingComplete, defaultLoggedIn };
}
