import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text, View } from '../components/Themed';
import { RootStackParamList } from '../types';
import Changelog from '../components/Changelog';
import About from '../components/About';
import { Ionicons } from '@expo/vector-icons';
import { ThemeContext } from '../hooks/useColorScheme';
import { GuestModeContext } from '../hooks/useGuestMode';

export default function SettingsScreen({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'Root'> }) {
  const [curView, setCurView] = React.useState(-1);

  /*
  curView: 
  -1 = Nothing viewed. Buttons visible
  1 = Changelog
  2 = About
  */
  const scheme = React.useContext(ThemeContext);
  const guestMode = React.useContext(GuestModeContext);

  const btnBgColor = scheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
  const iconColor = scheme.scheme === "light" ? "rgb(64, 64, 64)" : "rgb(189, 189, 189)";
  const logoutBtnBgColor = '#073763'; //scheme.scheme === "light" ? "rgb(17, 111, 207)" : "rgb(58, 106, 150)"; 

  // scroll to top
  const topChangeLog = React.useRef<ScrollView>(null);
  const topAbout = React.useRef<ScrollView>(null);

  function setView(val: number) {
    setCurView(val);
  }
  let logout = () => {
    AsyncStorage.clear().then(() => {
      if (guestMode.guest) {
        scheme.updateScheme(scheme.scheme);
        guestMode.updateGuest(false);
        navigation.replace('Login', { loginNeeded: true });
      }
      else {
        Alert.alert('Success', `Logged out successfully`, [{ text: 'Ok', onPress: () => navigation.replace('Login', { loginNeeded: true }) }], { cancelable: false });
      }
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setView(-1);
    });
    return unsubscribe;
  }, [navigation])

  return (
    <View style={[styles.container, { backgroundColor: scheme.scheme === 'light' ? '#e0e0e0' : '#252525' }]}>
      <ScrollView ref={topAbout} style={curView == 2 ? { flex: 1, width: "100%" } : { display: "none" }}>
        <About back={setView}></About>
      </ScrollView>
      <ScrollView ref={topChangeLog} style={curView == 1 ? { flex: 1, width: "100%" } : { display: "none" }}>
        <Changelog back={setView}></Changelog>
      </ScrollView>

      <TouchableOpacity
        style={curView == -1 ? [styles.button, { backgroundColor: btnBgColor }] : { display: "none" }}
        onPress={() => {
          if (scheme.scheme === 'dark') scheme.updateScheme('light');
          else scheme.updateScheme('dark');
        }}>
        <Text> Appearance: {scheme.scheme} </Text>
        <Ionicons name="color-palette-outline" size={18} color={iconColor} />
      </TouchableOpacity>

      <TouchableOpacity style={curView == -1 ? [styles.button, { backgroundColor: btnBgColor }] : { display: "none" }} onPress={() => { topAbout?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(2) }}>
        <Text> About </Text>
        <Ionicons name="information-circle-outline" size={18} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={curView == -1 ? [styles.button, { backgroundColor: btnBgColor }] : { display: "none" }} onPress={() => { topChangeLog?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(1) }}>
        <Text> View Changelog </Text>
        <Ionicons name="cog-outline" size={18} color={iconColor} />
      </TouchableOpacity>
      <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
      <TouchableOpacity style={curView == -1 ? [styles.logoutButton, { backgroundColor: logoutBtnBgColor }] : { display: "none" }} onPress={logout}>
        <Text style={{ color: "white" }}> Log {guestMode.guest ? 'In' : 'Out'} </Text>
        <Ionicons name="exit-outline" size={18} color={'#e2e2e2'} />
      </TouchableOpacity>
    </View>
  );
}
//chevron-forward
const styles = StyleSheet.create({
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
  logoutButton: {
    width: "80%",
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    width: "80%",
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
