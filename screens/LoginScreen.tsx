import * as React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, Image, Platform, Keyboard, useWindowDimensions, DimensionValue} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import {ThemeContext} from '../hooks/useColorScheme';
import { GuestModeContext } from '../hooks/useGuestMode';

import config from '../config.json';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors';
import { RootStackParamList } from '../types';
import { anyObject, apiRequest, login } from '../api';
import { SessionContext } from '../util/session';


export default function LoginScreen({ route, navigation }: { route: RouteProp<RootStackParamList, 'Login'>, navigation: StackNavigationProp<RootStackParamList, 'Login'> }) {
  
  const session = React.useContext(SessionContext);
  const colorScheme = React.useContext(ThemeContext);
  const guestMode = React.useContext(GuestModeContext);

  const state = React.useRef({
    username: "",
    password: ""
  }).current;
  
  const [loginResText, updateLoginResText] = React.useState("");
  const [keyboardUp, updateKeyboardUp] = React.useState(false);

  const [hasPressedLogin, setHasPressedLogin] = React.useState(false);
  const [loggedIn, setLoggedIn] = React.useState(false);

  async function storeUserinfo(): Promise<void> {
    if(guestMode.guest){
      return;
    }
    const userInfo = await apiRequest<anyObject>("/me", undefined, "GET", session, false);
    if (typeof userInfo !== "string") {
      session.set("@userinfo", userInfo);
    }

    navigation.replace('Root');
  }
  
  const loginPress = async () => {
    if(state.username === "" || state.password === ""){
      return;
    }
    if(!hasPressedLogin){
      setHasPressedLogin(true);
      updateLoginResText("Logging in... Please wait");
      try{
        let val = await login(state.username, state.password, session);
        if (val === undefined) {
          updateLoginResText("Success! Preparing app...");
          setLoggedIn(true);
          return;
        }
        else {
          updateLoginResText(String(val));
        }
      }catch(err){
        console.error(err);
      }
      setHasPressedLogin(false);
    }
  }

  const guestLoginPress = async () => {
    if(!hasPressedLogin){
      updateLoginResText("Please wait...");
      guestMode.updateGuest(true);
      setHasPressedLogin(true);
      navigation.replace('Root');
    }
  }

  const sessionContext = React.useContext(SessionContext);

  React.useEffect(() => {
    if(!(route.params && route.params.loginNeeded)){
      storeUserinfo();
    }
  }, [sessionContext]);

  React.useEffect(() => {
    if(loggedIn){
      storeUserinfo();
    }
  }, [loggedIn]);

  //Keyboard animation code
  const keyboardShown = () => {
    updateKeyboardUp(true);
  }

  const keyboardHidden = () => {
    updateKeyboardUp(false);
  }

  React.useEffect (()=>{
    const sub1 = Keyboard.addListener(Platform.OS === `android` ? `keyboardDidShow` : `keyboardWillShow`, keyboardShown);
    const sub2 = Keyboard.addListener(Platform.OS === `android` ? `keyboardDidHide` : `keyboardWillHide`, keyboardHidden);

    return () => {
      sub1.remove();
      sub2.remove();
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
          source={colorScheme.scheme === "light" ? require('../assets/images/LogInGraphics_LightMode.png') : require('../assets/images/LogInGraphics_DarkMode.png')}/>

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
          autoCorrect={false}
          autoComplete="username"
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
            <TouchableOpacity style={styles.logInButton}
              disabled={hasPressedLogin}
              onPress={loginPress}
            >
              <Text style={{color: "white"}}> Login </Text>
            </TouchableOpacity>
          </View>

        
        <View style={styles.helpContainer}>
          <TouchableOpacity onPress={handleRegisterPress} style={styles.helpLink}>
            <Text style={[styles.helpLinkText, {color: colorScheme.scheme == 'light' ? Colors.light.text : Colors.dark.text}]} lightColor={Colors.light.tint} darkColor={Colors.dark.tint}>
              Register
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleForgotPasswordPress} style={styles.helpLink}>
            <Text style={[styles.helpLinkText, {color: colorScheme.scheme == 'light' ? Colors.light.text : Colors.dark.text}]} lightColor={Colors.light.tint} darkColor={Colors.dark.tint}>
              Forgot Password
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.helpContainer}>
        <TouchableOpacity style={styles.helpLink} onPress={guestLoginPress} disabled={hasPressedLogin}>
            <Text style={[styles.helpLinkText, {color: colorScheme.scheme == 'light' ? Colors.light.text : Colors.dark.text}]} lightColor={Colors.light.tint} darkColor={Colors.dark.tint}>
              Continue in Guest Mode
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

let elementWidth: DimensionValue = "60%";
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
  WebBrowser.openBrowserAsync(`${config.site}/accounts/signup/?next=/`).catch(err => console.error("Couldn't load page", err));
}

function handleForgotPasswordPress() {
  WebBrowser.openBrowserAsync(`${config.site}/accounts/password/reset/`).catch(err => console.error("Couldn't load page", err));
}
