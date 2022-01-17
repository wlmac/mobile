/**
 * Learn more about createBottomTabNavigator:
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */

import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import HomeScreen from '../screens/HomeScreen';
import AnnouncementScreen from '../screens/AnnouncementScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MapScreen from '../screens/MapScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { BottomTabParamList, HomeParamList, AnnouncementParamList, CalendarParamList, MapParamList, SettingsParamList } from '../types';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();

export default function BottomTabNavigator() {
  const colorScheme = useColorScheme();
  let [notifs, updateDisplayNotifs] = useState(0);

  function updateNotifs(num: number) {
    updateDisplayNotifs(num);
    AsyncStorage.setItem('@notifscount', num.toString()).catch();
  }

  useEffect(() => {
    AsyncStorage.getItem('@notifscount').then(count => {
      if(count) {
        updateNotifs(parseInt(count));
      }
    });
    try {
      const unsubscribe = messaging().onMessage(async remoteMessage => {
        updateNotifs(notifs + 1);
      });
      return unsubscribe;
    } catch{}
  }, [])

  return (
    <BottomTab.Navigator
      initialRouteName="Home"
      screenOptions={{ tabBarActiveTintColor: Colors[colorScheme].tint, tabBarStyle: { display: "flex" } }}>
      <BottomTab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          headerTitle: "Home",
        }}
      />
      <BottomTab.Screen
        name="Announcements"
        children={() => AnnouncementNavigator(notifs, updateNotifs)}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="megaphone" color={color} />,
          tabBarBadge: (notifs > 0) ? notifs : undefined,
        }}
      />
      <BottomTab.Screen
        name="Calendar"
        component={CalendarNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
          headerTitle: "Calendar",
        }}
      />
      <BottomTab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          headerTitle: "School Map",
        }}
      />
      <BottomTab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="settings" color={color} />,
          headerTitle: "Settings",
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: React.ComponentProps<typeof Ionicons>['name']; color: string }) {
  return <Ionicons size={30} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const HomeStack = createStackNavigator<HomeParamList>();

function HomeNavigator() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ headerTitle: () => { return null; }, headerShown: false }}
      />
    </HomeStack.Navigator>
  );
}

const AnnouncementStack = createStackNavigator<AnnouncementParamList>();

function AnnouncementNavigator(notifs: number, updateNotifs: Function) {
  return (
    <AnnouncementStack.Navigator>
      <AnnouncementStack.Screen
        name="AnnouncementScreen"
        children={() => AnnouncementScreen(notifs, updateNotifs)}
        options={{ headerTitle: () => { return null; }, headerShown: false }}
      />
    </AnnouncementStack.Navigator>
  );
}

const CalendarStack = createStackNavigator<CalendarParamList>();

function CalendarNavigator() {
  return (
    <CalendarStack.Navigator>
      <CalendarStack.Screen
        name="CalendarScreen"
        component={CalendarScreen}
        options={{ headerTitle: () => { return null; }, headerShown: false }}
      />
    </CalendarStack.Navigator>
  );
}

const MapStack = createStackNavigator<MapParamList>();

function MapNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{ headerTitle: () => { return null; }, headerShown: false }}
      />
    </MapStack.Navigator>
  );
}


const SettingsStack = createStackNavigator<SettingsParamList>();

function SettingsNavigator() {
  return (
    <SettingsStack.Navigator>
      <SettingsStack.Screen
        name="SettingsScreen"
        component={SettingsScreen}
        options={{ headerTitle: () => { return null; }, headerShown: false }}
      />
    </SettingsStack.Navigator>
  );
}
