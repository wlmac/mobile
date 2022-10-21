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

export default function MapScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, 'Map'> }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Map</Text>
    </View>
  );
}