import * as React from 'react';
import { StyleSheet } from 'react-native';

import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, View } from '../components/Themed';
import * as Permission from 'expo-permissions'

import * as Location from 'expo-location';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';

export default function MapScreen() {
  const LATITUDE_DELTA = 0.00422; 
    const LONGITUDE_DELTA = 0.00091;
    const latitude = 43.75376776088882;
    const longitude = -79.46106695372214;
    // const mapRef = useRef(); 

    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          // setErrorMsg('Permission to access location was denied');
          return;
        }

      })();
    }, []);
    

    return (
      <View style={styles.container}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: latitude, 
              longitude: longitude,
              latitudeDelta:LATITUDE_DELTA, 
              longitudeDelta:LONGITUDE_DELTA
            }}
            provider = {PROVIDER_GOOGLE}
            mapType="standard"
            zoomEnabled={true}
            pitchEnabled={true}
            showsUserLocation={true}
            followsUserLocation={true}
            showsCompass={true}
            showsBuildings={true}
            showsTraffic={true}
            showsIndoors={true}>
          </MapView>
      </View>
    )
 
    
    // <View style={styles.container}>
    //   <Text style={styles.title}>Map</Text>
    //   <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
    //   <EditScreenInfo path="/screens/MapScreen.tsx" />
    // </View>
  
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
  map: {
    flex: 1,
    height: "100%",
    width: '100%',
  }
});
