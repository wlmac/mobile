import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, StyleProp } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text, View } from '../components/Themed';
import { RootStackParamList } from '../types';
import Changelog from '../components/Changelog';
import About from '../components/About';
import Profile from '../components/Profile';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../hooks/useColorScheme';
import { GuestModeContext } from '../hooks/useGuestMode';
import * as Notifications from 'expo-notifications';


import { Logs } from 'expo'
import { UserData, apiRequest } from '../api';
import { SessionContext } from '../util/session';


Logs.enableExpoCliLogging()

export default function SettingsScreen({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'Root'> }) {
  const session = React.useContext(SessionContext);

  const [curView, setView] = React.useState(-1);
  const userinfo: UserData = session.get("@userinfo");

  /*
  curView:
  -1 = Nothing viewed. Buttons visible
  1 = Changelog
  2 = About
  */
  const scheme = React.useContext(ThemeContext);
  const guestMode = React.useContext(GuestModeContext);


  //this took me an hour to figure out ffs
  const schemeStyle = scheme.scheme == 'light' ? lightStyle : darkStyle;
  let styles: {[key: string]: object | StyleProp<object>} = {};
  for(const [k, v] of Object.entries(baseStyle))
    styles[k] = v;
  for(const [k, v] of Object.entries(schemeStyle)){
    if(k in styles)
      styles[k] = StyleSheet.compose(styles[k], v);
    else
      styles[k] = v;
  }


  // scroll to top
  const topChangeLog = React.useRef<ScrollView>(null);
  const topAbout = React.useRef<ScrollView>(null);
  const topUserProfile = React.useRef<ScrollView>(null);

  async function deletePushToken() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    let expoPushToken: string | undefined = undefined;
    try {
      expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (error) {
      console.log('Error fetching Expo token:', error, "\nFor developers, ensure you are logged in with your Expo account in order for notif testing to work.");
    }

    // if the existingStatus is denied, the token was not sent to server; assume no token was deleted
    if (!expoPushToken || existingStatus !== 'granted') {
      Alert.alert('Success', 'Logged out successfully (no server-side notification settings deleted)', [{ text: 'Ok', onPress: () => undefined }], { cancelable: false });
      return;
    }

    expoPushToken = expoPushToken.slice(18, -1);
    let res = await apiRequest("/api/v3/notif/token", { "expo_push_token": expoPushToken }, "DELETE", session);
    if (typeof res === 'string') {
      Alert.alert('Error', 'Failed to log out (clearing server-side notification settings failed)', [{ text: 'Ok', onPress: () => undefined }], { cancelable: false });
    }
    Alert.alert('Success', 'Logged out successfully', [{ text: 'Ok', onPress: () => undefined }], { cancelable: false });
  }
  
  function logout() {
    if (guestMode.guest) {
      AsyncStorage.clear().then(() => {
        scheme.updateScheme(scheme.scheme);
        guestMode.updateGuest(false);
        navigation.replace('Login', { loginNeeded: true });
      }).catch(() => {
        Alert.alert('Error', 'Failed to log out (clearing local data failed)', [{ text: 'Ok' }], { cancelable: false });
      });
    } else {
      deletePushToken().then(() => {
        AsyncStorage.clear().then(() => {
          scheme.updateScheme(scheme.scheme);
          guestMode.updateGuest(false);
          navigation.replace('Login', { loginNeeded: true });
        }).catch(() => {
          Alert.alert('Error', 'Failed to log out (clearing local data failed)', [{ text: 'Ok' }], { cancelable: false });
        });
      }).catch(() => {
        console.error("error when deleting server-side notification settings");
      });
    }
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setView(-1);
    });
    return unsubscribe;
  }, [navigation]);


  return (
    <View style={styles.container}>
      {curView == 1 ? <ScrollView ref={topChangeLog} style={{ flex: 1, width: "100%" }}>
        <Changelog back={setView}></Changelog>
      </ScrollView> : curView == 2 ?
      <ScrollView ref={topAbout} style={{ flex: 1, width: "100%" }}>
        <About back={setView}></About>
      </ScrollView> :
      <ScrollView ref={topUserProfile} style={{ flex: 1, width: "100%" }}>
        <Profile back={setView} userinfo={userinfo}></Profile>
      </ScrollView> }
     
      <TouchableOpacity style={curView == -1 ? [styles.userProfile] : { display: "none" }}
        onPress={() => { 
          if (!guestMode.guest) {topUserProfile?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(3) }
        }}
        >
          <Text style={{ color: "#b8b8b8", fontSize: 12 }}> {guestMode.guest ? 'Not Logged In' : 'Logged In As'} </Text>
          {(userinfo || guestMode.guest) && <Text style={{ color: "white", fontSize: 26 }}> {guestMode.guest ? 'Guest' : userinfo.username}</Text>}
      </TouchableOpacity>
     
      <TouchableOpacity
        style={curView == -1 ? [styles.button] : { display: "none" }}
        onPress={() => {
          if (scheme.scheme === 'dark') scheme.updateScheme('light');
          else scheme.updateScheme('dark');
        }}>
        <Text> Appearance: {scheme.scheme} </Text>
        <Ionicons name="color-palette-outline" size={18} style={styles.icon} />
      </TouchableOpacity>


      { curView === -1 && <>
        <TouchableOpacity style={styles.button} onPress={() => { topAbout?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(2) }}>
          <Text> About </Text>
          <Ionicons name="information-circle-outline" size={18} style={styles.icon} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { topChangeLog?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(1) }}>
          <Text> View Changelog </Text>
          <Ionicons name="cog-outline" size={18} style={styles.icon} />
        </TouchableOpacity>
        <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Text style={{ color: "white" }}> Log {guestMode.guest ? 'In' : 'Out'} </Text>
          <Ionicons name="exit-outline" size={18} style={styles.logoutIcon} />
        </TouchableOpacity>
      </> }
    </View>
  );
}


const baseStyle = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  button: {
    width: "80%",
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userProfile: {
    width: "80%",
    borderRadius: 5,
    alignItems: 'flex-start',
    height: "15%",
    padding: "4%",
    marginBottom: "10%",
    flexDirection: 'column',
    justifyContent: 'space-between',
    backgroundColor: '#073763',
    fontWeight: "500",
    textAlign: "left",
    color: '#e2e2e2'
  },
  logoutButton: {
    width: "80%",
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',


    //there was a commented out section: scheme.scheme === "light" ? "rgb(17, 111, 207)" : "rgb(58, 106, 150)";
    //if anybody decides to bring back different colors for different schemes make an entry in lightStyles and darkStyles
    backgroundColor: '#073763'
  },
  logoutIcon: {
    color: '#e2e2e2'
  }
});


const lightStyle = StyleSheet.create({
  container: {
    backgroundColor: '#e0e0e0'
  },
  button: {
    backgroundColor: '#bdbdbd'
  },
  icon: {
    color: '#404040'
  }
});


const darkStyle = StyleSheet.create({
  container: {
    backgroundColor: '#252525'
  },
  button: {
    backgroundColor: '#404040'
  },
  icon: {
    color: '#bdbdbd'
  }
});

