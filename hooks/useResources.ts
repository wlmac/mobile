import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as React from 'react';

import { useColorScheme } from 'react-native';
import { refreshLogin } from '../api';
import { Session } from '../util/session';

export default function loadResources(session: Session) {
  const colorScheme = useColorScheme();

  const [isLoadingComplete, setLoadingComplete] = React.useState(false);
  const [loginNeeded, setLoginNeeded] = React.useState(true);

  // Load any resources or data that we need prior to rendering the app
  React.useEffect(() => {
    if(session._data == undefined || isLoadingComplete)
      return;
    
    async function loadResourcesAndDataAsync() {
      try {
        let res = await refreshLogin(session);

        if(res){
          setLoginNeeded(false);
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
        console.error(e);
      } finally {
        setLoadingComplete(true);
      }
    }

    loadResourcesAndDataAsync();
  }, [session._data]);

  return { isLoadingComplete, loginNeeded };
}
