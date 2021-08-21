import * as React from 'react';
import { StyleSheet, TextInput, Button, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import config from '../config.json';
import { Text, View } from '../components/Themed';
import Navigation from '../navigation';
import App from '../App';

let state = {
  username: "",
  password: "",
  colorScheme: ""
}

export default function LoginScreen(colorScheme: string) {
  state.colorScheme = colorScheme;
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View>
        <TextInput
          style={{ color: (colorScheme == "dark") ? "white" : "black" }}
          placeholder="Username"
          onChangeText={(value) => state.username = value} />
        <TextInput
          style={{ color: (colorScheme == "dark") ? "white" : "black" }}
          secureTextEntry={true}
          placeholder="Password"
          onChangeText={(value) => state.password = value}
        />
        <Button onPress={login} title="Login"></Button>
      </View>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
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
  }
});

function login() {
  fetch(`${config.server}/api/auth/token`, { //refresh token endpoint
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: state.username,
      password: state.password
    })
  }).then((response) => response.json())
    .then((json) => {
      if (json.access && json.refresh) {
        AsyncStorage.setItem('@accesstoken', json.access).then(() => {
          AsyncStorage.setItem('@refreshtoken', json.refresh).then(() => {
            //redirect to home page ig
            console.log('very nice!');
            //App();
          }).catch(err => console.log(err));
        }).catch(err => console.log(err));
      }
      else {
        //edit text to add "Wrong username or password" here
        console.log('Not nice :((');
      }
    }).catch(err => console.log(err));
}
