import * as React from 'react';
import { StyleSheet, TextInput, Button, Linking, TouchableOpacity, Image, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import config from '../config.json';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../types';

let state = {
  username: "",
  password: ""
}


export default function LoginScreen({ route, navigation }: { route: RouteProp<RootStackParamList, 'Login'>, navigation: StackNavigationProp<RootStackParamList, 'Login'> }) {
  let [loginResText, updateLoginResText] = React.useState("");
  const { loginNeeded } = route.params;
  let loginPress = () => {
    updateLoginResText("Logging in... Please wait");
    login().then(val => {
      if (val == "success") {
        navigation.replace('Root');
      }
      else {
        updateLoginResText(String(val));
      }
    }).catch(err => console.log(err));
  }
  if (!loginNeeded) {
    navigation.replace('Root');
  }

  return (
    <View style={styles.container}>

      {/* ---- PICTURE CONTAINER -----*/}
      <View style={styles.pictureContainer}>
      
        <Image style={{width:"100%", height: "100%"}} 
          source={useColorScheme()==="light"? require('../assets/images/LogInGraphics_LightMode.png'): require('../assets/images/LogInGraphics_DarkMode.png')}/>

      {/* ---- PICTURE CONTAINER -----*/}
      </View>

      {/* ---- BOTTOM CONTAINER -----*/}
      <View style={styles.bottomContainer}>

        {/* ----LOG IN-----*/}
        <Text style={styles.logIn}>Log In</Text>

        {/* ----LOG IN UNDERLINE-----*/}
        <View style={styles.logInUnderline}/>

        {/* ---- INPUT FIELD-----*/}
        <TextInput
          style={styles.inputField}
          placeholder="Username"
          placeholderTextColor="gray"
          onChangeText={(value) => state.username = value} />

        {/* ---- INPUT FIELD-----*/}
        <TextInput
          style={styles.inputField}
          secureTextEntry={true}
          placeholder="Password"
          placeholderTextColor="gray"
          onChangeText={(value) => state.password = value}/>

        {/* Remember Me Container */}
        <View style={styles.loginStatusContainer}>

          {/*Remember Me Text*/}
          <Text style={styles.loginStatusText}>{loginResText}</Text>

        {/* Remember Me Container */}
        </View>

        {/*WHAT WE NEED TO ADDRESS:

          - WE NEED TO INCLUDE A PICTURE FOR THE TOP PART OF THE LOGIN PAGE
          - A REMEMBER ME CHECKBOX WHICH WILL REMEMBER THE STUDEENT'S USER AND PASSWORD (BACKEND)
          - WE NEED TO FIGURE OUT WHAT EXCATLY THE CODE BLELOW DOES
        */}

          {/*<Text>{loginResText}</Text>*/}

          <View style={styles.logInButton}>
            <Button color="white" onPress={loginPress} title="Login"></Button>
          </View>

        
        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={handleRegisterPress} style={styles.helpLink}>
            <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
              Register Here
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />

      {/*--- BOTTOM CONTAINER ---*/} 
      </View> 

    {/*--- CONTAINER ---*/} 
    </View> 
  );
}

let elementWidth = "60%"
const styles = StyleSheet.create({

  /* ---- MAIN CONTAINER -----*/
  container: {
    width: "100%",
    height: "100%",


    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
  },

  /* ---- PICTURE CONTAINER -----*/
  pictureContainer:{
    flexBasis: "33%",
    width: "100%",
    backgroundColor: "rgb(58, 106, 150)",
    alignItems: 'center',
    justifyContent: 'center', 
  },


  /* ---- BOTTOM CONTAINER  ------*/
  bottomContainer: {
    flexBasis:"67%",
    width: "100%",
    
    // borderColor: "white",
    // borderTopWidth: 5,

    justifyContent: "center",
    alignItems: "center",
  },


  /* --- LOG IN  --- */
  logIn: {
    fontSize: 30,
    fontFamily: "poppins",
    marginBottom: 5
  },

  /* --- LINE UNDER LOGIN --- */
  logInUnderline: {
    width: elementWidth,
    height: 2,

    backgroundColor: "rgb(58, 106, 150)",
  },

  /* --- INPUT FIELDS --- */
  inputField: {
    width: elementWidth,

    marginTop: 20,
    paddingVertical:10,
    paddingLeft:10,

    backgroundColor: "lightgray",
    borderRadius: 5,

    textAlign: "left",
    fontSize: 20,
    color: "black"
  },


  /* --- REMEMBER ME CONTAINER ---  */
  loginStatusContainer: {
    width: elementWidth,

    paddingVertical: 10,

    flexDirection: "row",
    alignItems: "center",
  },

  /* --- REMEMBER ME TEXT --- */
  loginStatusText:{
    fontSize: 17,
  },

  /* --- LOG IN BUTTON  --- */
  logInButton: {
    width: elementWidth,

    backgroundColor:"rgb(58, 106, 150)",
    borderRadius: 5,
  },

  






  /* --- CODE THAT MIGHT CHANGE --- */
  separator: {
    marginTop: 20,
    height: 1,
    width: '60%',
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
  /* --- CODE THAT MIGHT CHANGE --- */
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
              resolve("success");
            }).catch(err => {
              console.log(err);
              resolve("Error occurred. Was storage permission denied?");
            });
          }).catch(err => {
            console.log(err);
            resolve("Error occurred. Was storage permission denied?");
          });
        }
        else if (json.detail) {
          resolve("Username or password incorrect");
        }
        else {
          resolve("Something went wrong. Please try again later.");
        }
      }).catch(err => {
        console.log(err);
        resolve("Network error. Please try again later.");
      });
  })
}
