import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as React from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { refreshLogin } from '../api';
import { Session, SessionContext } from '../util/session';

export default function loadResources(session: Session) {
  const colorScheme = useColorScheme();

  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [loginNeeded, setDefaultLoginDone] = React.useState(true);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    if(session._data == undefined || isLoadingComplete)
      return;
    
    async function loadResourcesAndDataAsync() {
      try {
        let res = await refreshLogin(session);
        console.log({ res });
        if(res){
          setDefaultLoginDone(false);
        }
        
        const scheme = session.get("@scheme");
        if(!scheme){
          session.set("@scheme", colorScheme as string);
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
  }, [session._data]);

  return { isLoadingComplete, loginNeeded };
}
