import * as React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';

import { Text, View } from '../components/Themed';
import { RootStackParamList } from '../types';
import Changelog from '../components/Changelog';

export default function SettingsScreen({ navigation }: { navigation: StackNavigationProp<RootStackParamList, 'Root'> }) {
  const [changeLogOn, setChangeLogOn] = React.useState(false);

  const btnBgColor = useColorScheme() === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";

  function toggleChangelog(val : boolean) {
    setChangeLogOn(val);
  }
  let logout = () => {
    AsyncStorage.clear().then(() => {
      Alert.alert('Success', `Logged out successfully`, [{ text: 'Ok', onPress: () => navigation.replace('Login', { loginNeeded: true }) }], { cancelable: false });
    });
  }
  return (
    <View style={styles.container}>
      <ScrollView style={changeLogOn ? {marginHorizontal: 0} : { display: "none" }}>
        <Changelog back={toggleChangelog}></Changelog>
      </ScrollView>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <TouchableOpacity style={!changeLogOn ? [styles.button, { backgroundColor: btnBgColor }] : {display: "none"}} onPress={() => {toggleChangelog(true)}}>
        <Text> View Changelog </Text>
      </TouchableOpacity>
      <TouchableOpacity style={!changeLogOn ? styles.logoutButton : {display: "none"}} onPress={logout}>
        <Text> Logout </Text>
      </TouchableOpacity>
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
  logoutButton: {
    width: "100%",
    backgroundColor: "rgb(58, 106, 150)",
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginTop: 20
  },
  button: {
    width: "100%",
    borderRadius: 5,
    alignItems: 'center',
    padding: 10,
    marginBottom: 20
  }
});
