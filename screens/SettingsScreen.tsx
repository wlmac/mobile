import * as React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text, View } from '../components/Themed';
import { RootStackParamList } from '../types';
import Changelog from '../components/Changelog';
import About from '../components/About';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'Root'> }) {
  const [curView, setCurView] = React.useState(-1);
  /*
  curView: 
  -1 = Nothing viewed. Buttons visible
  1 = Changelog
  2 = About
  */

  const btnBgColor = useColorScheme() === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
  const iconColor = useColorScheme() === "light" ? "rgb(64, 64, 64)" : "rgb(189, 189, 189)";
  const logoutBtnBgColor = useColorScheme() === "light" ? "rgb(17, 111, 207)" : "rgb(58, 106, 150)"; 

  function setView(val: number) {
    setCurView(val);
  }
  let logout = () => {
    AsyncStorage.clear().then(() => {
      Alert.alert('Success', `Logged out successfully`, [{ text: 'Ok', onPress: () => navigation.replace('Login', { loginNeeded: true }) }], { cancelable: false });
    });
  }
  return (
    <View style={styles.container}>
      <ScrollView style={curView == 2 ? {marginHorizontal: 0} : { display: "none" }}>
        <About back={setView}></About>
      </ScrollView>
      <ScrollView style={curView == 1 ? {marginHorizontal: 0} : { display: "none" }}>
        <Changelog back={setView}></Changelog>
      </ScrollView>
      <TouchableOpacity style={curView == -1 ? [styles.button, { backgroundColor: btnBgColor }] : {display: "none"}} onPress={() => {setView(2)}}>
        <Text> About </Text>
        <Ionicons name="information-circle-outline" size={18} color={iconColor} />
      </TouchableOpacity>
      <TouchableOpacity style={curView == -1 ? [styles.button, { backgroundColor: btnBgColor }] : {display: "none"}} onPress={() => {setView(1)}}>
        <Text> View Changelog </Text>
        <Ionicons name="cog-outline" size={18} color={iconColor} />
      </TouchableOpacity>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <TouchableOpacity style={curView == -1 ? [styles.logoutButton, { backgroundColor: logoutBtnBgColor }] : {display: "none"}} onPress={logout}>
        <Text > Log Out </Text>
        <Ionicons name="exit-outline" size={18} color={iconColor} />
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
