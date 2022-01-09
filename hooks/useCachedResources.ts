import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import * as React from 'react';
import NetInfo from "@react-native-community/netinfo";
import { useState } from 'react';
import { Alert } from 'react-native';
import RNRestart from 'react-native-restart';
import apiRequest from '../lib/apiRequest';
import defaultLogin from '../lib/defaultLogin';
import AsyncStorageLib from '@react-native-async-storage/async-storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
          storeAnnouncements();
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

export async function storeAnnouncements() {
  var announcements:Object[] = [];
  var myAnnouncements:Object[] = [];
  var orgName: {[id: number]: string} = {};
  var orgIcon: {[id: number]: string} = {};
  var myOrgs:Object[] = [];


  // organizations
  await apiRequest('/api/organizations?format=json', '', 'GET').then((res) => {
    if(res.success){
      JSON.parse(res.response).forEach((org:any) => {
        orgName[org.id] = org.name;
        orgIcon[org.id] = org.icon;
      });
      AsyncStorage.setItem("@orgName", JSON.stringify(orgName));
      AsyncStorage.setItem("@orgIcon", JSON.stringify(orgIcon));
      console.log('organization cache done');
    } else {
      console.log("organization cache failed");
    }
  });

  // my organizations
  await apiRequest('/api/me?format=json', '', 'GET').then((res) => {
    if(res.success){
      AsyncStorage.setItem("@myOrgs", JSON.stringify(res.response));
      myOrgs = JSON.parse(res.response).organizations;
      console.log("my orgs cache done");
    } else {
      console.log("my orgs cache failed");
    }
  });

  // announcements
  await apiRequest('/api/announcements?format=json', '', 'GET').then((res) => {
    if(res.success){
      announcements = JSON.parse(res.response);
      console.log('announcement cache done');
    } else {
      console.log("announcement cache failed");
    }
  });

  // my announcements
  announcements.forEach((item:any) => {
    let orgId = item.organization.id; // gets the organization id
    item.icon = orgIcon[orgId];
    item.name = orgName[orgId];
    if (myOrgs.includes(orgName[orgId])) { // checks against the user's organization list
      myAnnouncements.push(item);
    }
  });

  AsyncStorage.setItem("@announcements", JSON.stringify(announcements));
  AsyncStorage.setItem("@myann", JSON.stringify(myAnnouncements));
}
