import * as React from 'react';
import { Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNExitApp from 'react-native-exit-app';

import { Text, View } from '../components/Themed';

export default function SettingsScreen() {
  let logout = () => {
    AsyncStorage.clear().then(() => {
      Alert.alert('Success', `Logged out successfully`, [{ text: 'Exit', onPress: () => RNExitApp.exitApp() }], { cancelable: false });
    });
  }
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Button onPress={logout} title="Logout"></Button>
    </View>
  );
}

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
});
