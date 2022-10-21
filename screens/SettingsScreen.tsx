import * as React from "react";
import { Text, View } from '../components/Themed';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types';

import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

export default function SettingsScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, 'Settings'> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Settings</Text>
    </View>
  );
}