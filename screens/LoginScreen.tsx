import * as React from 'react';
import { StyleSheet, TextInput, Button, Linking, TouchableOpacity, Image, useColorScheme, Platform, Keyboard, useWindowDimensions} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

import config from '../config.json';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../types';
import cacheResources from '../lib/cacheResources';

let state = {
  username: "",
  password: ""
}


export default function LoginScreen({ route, navigation }: { route: RouteProp<RootStackParamList, 'Login'>, navigation: StackNavigationProp<RootStackParamList, 'Login'> }) {
  let [loginResText, updateLoginResText] = React.useState("");
  let [keyboardUp, updateKeyboardUp] = React.useState(false);

  const { loginNeeded } = route.params;
  let loginPress = () => {
    updateLoginResText("Logging in... Please wait");
    login().then(val => {
      if (val == "success") {
        updateLoginResText("Success! Preparing app...");
        cacheResources().then(() => {
          navigation.replace('Root');
        })
      }
      else {
        updateLoginResText(String(val));
      }
    }).catch(err => console.log(err));
  }
  if (!loginNeeded) {
    React.useEffect(() => {
      navigation.replace('Root');
    }, []);
  }

  //Keyboard animation code
  const keyboardShown = () => {
    updateKeyboardUp(true);
  }

  const keyboardHidden = () => {
    updateKeyboardUp(false);
  }

  React.useEffect (()=>{
    Keyboard.addListener(Platform.OS === `android`? `keyboardDidShow`: `keyboardWillShow`, keyboardShown);
    Keyboard.addListener(Platform.OS === `android`? `keyboardDidHide`: `keyboardWillHide`, keyboardHidden);

    return () => {
      Keyboard.removeListener(Platform.OS === `android`? `keyboardDidShow`: `keyboardWillShow`, keyboardShown);
      Keyboard.removeListener(Platform.OS === `android`? `keyboardDidHide`: `keyboardWillHide`, keyboardHidden);
    }
  },[]);

  //Aspect Ratio code
  const determineAspectRatio = () => {
    return useWindowDimensions().width/useWindowDimensions().height;
  }

  return (
    <View style={[styles.container,{flexDirection: determineAspectRatio() < 1? "column" : "column-reverse"}]}>

      {/* ---- PICTURE CONTAINER -----*/}
      <View style={styles.pictureContainer}>
      
        <Image style={{width:"100%", height: "100%"}} 
          source={useColorScheme()==="light"? require('../assets/images/LogInGraphics_LightMode.png'): require('../assets/images/LogInGraphics_DarkMode.png')}/>

      {/* ---- PICTURE CONTAINER -----*/}
      </View>

      {/* ---- BOTTOM CONTAINER -----*/}
      <View style={[styles.bottomContainer, {justifyContent: (determineAspectRatio() < 1 && keyboardUp)? "flex-start": "center" }]}>

        {/* ----LOG IN-----*/}
        <Text style={styles.logIn}>Welcome!</Text>

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

          {/*<Text>{loginResText}</Text>*/}

          <View style={styles.logInButton}>
            <TouchableOpacity style={styles.logInButton} onPress={loginPress}>
              <Text> Login </Text>
            </TouchableOpacity>
          </View>

        
        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={handleRegisterPress} style={styles.helpLink}>
            <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
              Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPasswordPress} style={styles.helpLink}>
            <Text style={styles.helpLinkText} lightColor={Colors.light.tint}>
              Forgot Password
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
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center', 
  },

  /* ---- PICTURE CONTAINER -----*/
  pictureContainer:{
    flex: 1,
    width: "100%",
    backgroundColor: "rgb(58, 106, 150)",
    alignItems: 'center',
    justifyContent: 'flex-start', 
  },


  /* ---- BOTTOM CONTAINER  ------*/
  bottomContainer: {
    flex: 2,
    width: "100%",

    alignItems: "center",
    paddingTop: 10,
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
    alignItems: 'center',
    padding: 10
  },

  






  /* --- CODE THAT MIGHT CHANGE --- */
  separator: {
    marginTop: 20,
    height: 1,
    width: '60%',
  },


  helpContainer: {
    width:elementWidth,
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:"space-around",
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

function handleForgotPasswordPress() {
  Linking.openURL(`${config.server}/accounts/password/reset/`).catch(err => console.error("Couldn't load page", err));
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
