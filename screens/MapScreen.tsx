import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet } from 'react-native';

import MapView, { Overlay, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, View } from '../components/Themed';
import * as Location from 'expo-location';
import { Switch } from 'react-native';


export default function MapScreen() {

  const LATITUDE_DELTA = 0.00422; 
    const LONGITUDE_DELTA = 0.00091;
    const latitude = 43.75376776088882;
    const longitude = -79.46106695372214;
    
    // const mapRef = useRef(); 
    const [location, setAlti] = useState<{altitude: null | number, }>({ altitude: null });
    var level = 1; 
    var altitude: number | null = null; 
    const [errorMsg, setErrorMsg] = useState("");

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(isEnabled => !isEnabled);

    useEffect(() => {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }else{
          let location = await Location.getCurrentPositionAsync();
          altitude = location.coords.altitude;
          if(location.coords.altitude!=null && location.coords.altitude >147)setIsEnabled(true)
          else setIsEnabled(false)
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
            showsIndoors={true}
            >
            {mapOverlay(location.altitude, isEnabled)}
          </MapView>
          <View style={styles.row}>
            <Text style={{color: isEnabled ?"#b7b7b7ff" : "#434343ff", fontFamily: 'poppins', paddingHorizontal:8 }}>Floor One</Text>
            <Switch
              trackColor={{ false: "#b7b7b7ff", true: "#b7b7b7ff" }}
              thumbColor={isEnabled ? "#434343ff" : "#434343ff"}
              onValueChange={toggleSwitch}
              value={isEnabled}
            />
            <Text style={{color: isEnabled ?"#434343ff" : "#b7b7b7ff", fontFamily: 'poppins', paddingHorizontal:8 }}>Floor Two</Text>
          </View>
          
      </View>
    )
  
}



function mapOverlay( altitude: any, isEnabled: boolean) {
  if((isEnabled||altitude>147)){
    return (<Overlay 
      image={require('../assets/images/Level2WLMACMAP.png')}
      bounds={[
        [43.75279562211260, -79.46283144388977],
        [43.7540913854649, -79.46043910295570]
      ]}
    /> )
  }else if(altitude<147||!isEnabled){
    return (<Overlay 
      image={require('../assets/images/Level1WLMACMAP.png')}
      bounds={[
        [43.75279562211260, -79.46283144388977],
        [43.7540913854649, -79.46043910295570]
      ]}
    /> )
  }
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
  }, 
  row: {
    flexDirection:"row", 
    flexWrap: "wrap",
    paddingHorizontal:8, 
    paddingVertical:20,
  },
  switch: {
    paddingHorizontal:8,
  },
  text: {
    paddingHorizontal:8,
    fontFamily: 'poppins',
  }
});



