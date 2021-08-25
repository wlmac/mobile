import * as React from 'react';
import { StyleSheet, TextInput, Button, Linking, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import config from '../config.json';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import { RootStackParamList } from '../types';

let state = {
  username: "",
  password: ""
}

export default function LoginScreen({ route, navigation }: { route: RouteProp<RootStackParamList, 'Login'>, navigation: StackNavigationProp<RootStackParamList, 'Login'> }) {
  const colorScheme = useColorScheme();
  const { loginNeeded } = route.params;
  let loginPress = () => {
    login().then(val => {
      if (val) {
        navigation.replace('Root');
      }
    }).catch(err => console.log(err));
  }
  if (!loginNeeded) {
    navigation.replace('Root');
  }
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
        <Button onPress={loginPress} title="Login"></Button>
      </View>
      <View style={styles.helpContainer}>
        <TouchableOpacity onPress={handleRegisterPress} style={styles.helpLink}>
          <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
            Register Here
          </Text>
        </TouchableOpacity>
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
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  helpLink: {
    paddingVertical: 15,
  },
  helpLinkText: {
    textAlign: 'center',
  },
});

function handleRegisterPress() {
  Linking.openURL(`${config.server}/accounts/signup/?next=/`).catch(err => console.error("Couldn't load page", err));
}

function login() {
  return new Promise((resolve, reject) => {
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
              resolve(true);
              //App();
            }).catch(err => {
              console.log(err);
              resolve(false);
            });
          }).catch(err => {
            console.log(err);
            resolve(false);
          });
        }
        else {
          //edit text to add "Wrong username or password" here
          console.log('Not nice :((');
          resolve(false);
        }
      }).catch(err => {
        console.log(err);
        resolve(false);
      });
  })
}
