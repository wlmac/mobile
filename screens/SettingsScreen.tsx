/*
import * as React from "react";
import { Text, View } from '../components/Themed';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types';

import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function SettingsScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, 'Settings'> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Settings</Text>
    </View>
  );
}
*/

import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme, StyleProp } from 'react-native';
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
  const [curView, setView] = React.useState(-1);

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

  //helper function
  function styleIf(view: number, style: any){
    return curView == view ? style : { display: "none" };
  }

  function logout(){
    AsyncStorage.clear().then(() => {
      if (guestMode.guest) {
        scheme.updateScheme(scheme.scheme);
        guestMode.updateGuest(false);
        navigation.replace('Login', { loginNeeded: true });
      }
      else {
        Alert.alert('Success', 'Logged out successfully', [{ text: 'Ok', onPress: () => navigation.replace('Login', { loginNeeded: true }) }], { cancelable: false });
      }
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      setView(-1);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.container}>
      <ScrollView ref={topAbout} style={styleIf(2, { flex: 1, width: "100%" })}>
        <About back={setView}></About>
      </ScrollView>
      <ScrollView ref={topChangeLog} style={styleIf(1, { flex: 1, width: "100%" })}>
        <Changelog back={setView}></Changelog>
      </ScrollView>

      <TouchableOpacity
        style={curView == -1 ? [styles.button] : { display: "none" }}
        onPress={() => {
          if (scheme.scheme === 'dark') scheme.updateScheme('light');
          else scheme.updateScheme('dark');
        }}>
        <Text> Appearance: {scheme.scheme} </Text>
        <Ionicons name="color-palette-outline" size={18} style={styles.icon} />
      </TouchableOpacity>

      <TouchableOpacity style={styleIf(-1, styles.button)} onPress={() => { topAbout?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(2) }}>
        <Text> About </Text>
        <Ionicons name="information-circle-outline" size={18} style={styles.icon} />
      </TouchableOpacity>
      <TouchableOpacity style={styleIf(-1, styles.button)} onPress={() => { topChangeLog?.current?.scrollTo({ x: 0, y: 0, animated: false }); setView(1) }}>
        <Text> View Changelog </Text>
        <Ionicons name="cog-outline" size={18} style={styles.icon} />
      </TouchableOpacity>
      <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
      <TouchableOpacity style={styleIf(-1, styles.logoutButton)} onPress={logout}>
        <Text style={{ color: "white" }}> Log {guestMode.guest ? 'In' : 'Out'} </Text>
        <Ionicons name="exit-outline" size={18} style={styles.logoutIcon} />
      </TouchableOpacity>
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