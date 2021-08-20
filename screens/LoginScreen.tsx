import * as React from 'react';
import { StyleSheet, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config.json';
import { Text, View } from '../components/Themed';

let state = {
  username: "",
  password: ""
}

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
      <View>
        <TextInput
          style={styles.textInput}
          placeholder="Username"
          onChangeText={(value) => state.username = value} />
        <TextInput
          style={styles.textInput}
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
  },
  textInput: {
    color: 'white'
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
          }).catch(err => console.log(err));
        }).catch(err => console.log(err));
      }
      else {
        console.log('Not nice :((');
      }
    }).catch(err => console.log(err));
}
