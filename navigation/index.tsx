/**
 * If you are not familiar with React Navigation, check out the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import NotFoundScreen from '../screens/NotFoundScreen';
import LoginScreen from '../screens/LoginScreen';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';

import useColorScheme, { ThemeContext } from '../hooks/useColorScheme';
import useGuestMode, { GuestModeContext } from '../hooks/useGuestMode';
import { SessionContext } from '../util/session';

const LightTheme = {
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    card: '#073763',
    text: '#f2f2f2',
  },
};

const CustomDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    card: '#161616',
  },
};

export default function Navigation() {
  const scheme = useColorScheme();
  const guest = useGuestMode();

  console.log(scheme.schemeLoaded)
  if (!scheme.schemeLoaded) {
    return null;
  }
  else {
    return (
      <ThemeContext.Provider value={scheme}>
        <GuestModeContext.Provider value={guest}>
          <NavigationContainer
            theme={scheme.scheme === 'dark' ? CustomDarkTheme : LightTheme}>
            <RootNavigator />
          </NavigationContainer>
        </GuestModeContext.Provider>
      </ThemeContext.Provider>
    );
  }
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  const guestMode = React.useContext(GuestModeContext);
  const { loginNeeded } = React.useContext(SessionContext);
  const [toLogin, setToLogin] = React.useState(loginNeeded && !guestMode.guest);
  React.useEffect(() => {
    setToLogin(loginNeeded && !guestMode.guest);
  }, [guestMode.guest]);
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {toLogin ? [
        <Stack.Screen name="Login" component={LoginScreen} key="loginstackscreen" />,
        <Stack.Screen name="Root" component={BottomTabNavigator} key="rootstackscreen" />
      ] : [
        <Stack.Screen name="Root" component={BottomTabNavigator} key="rootstackscreen" />,
        <Stack.Screen name="Login" component={LoginScreen} key="loginstackscreen" />
      ]}
      <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
    </Stack.Navigator>
  );
}
