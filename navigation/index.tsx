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

export default function Navigation({ loginNeeded }: { loginNeeded: boolean }) {
  const scheme = useColorScheme();

  if (!scheme.schemeLoaded) {
    return null;
  }
  else {
    return (
      <ThemeContext.Provider value={scheme}>
        <NavigationContainer
          theme={scheme.scheme === 'dark' ? CustomDarkTheme : LightTheme}>
          <RootNavigator loginNeeded={loginNeeded} />
        </NavigationContainer>
      </ThemeContext.Provider>
    );
  }
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator({ loginNeeded }: { loginNeeded: boolean }) {
  if (loginNeeded) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} initialParams={{ loginNeeded: loginNeeded }} />
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      </Stack.Navigator>
    );
  }
  else {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Root" component={BottomTabNavigator} />
        <Stack.Screen name="Login" component={LoginScreen} initialParams={{ loginNeeded: loginNeeded }} />
        <Stack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      </Stack.Navigator>
    );
  }
}
