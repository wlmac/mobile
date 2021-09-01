import * as React from 'react';
import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import MapView, { Marker, Overlay, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, View } from '../components/Themed';
import * as Location from 'expo-location';
import { Switch } from 'react-native';
import { TextInput } from 'react-native';
import filter from 'lodash.filter';

export default function MapScreen() {

  const LATITUDE_DELTA = 0.00422; 
    const LONGITUDE_DELTA = 0.00091;
    const latitude = 43.75376776088882;
    const longitude = -79.46106695372214;
    
    const [location, setAlti] = useState<{altitude: null | number, }>({ altitude: null });
    var altitude: number | null = null; 
    const [errorMsg, setErrorMsg] = useState("");

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(isEnabled => !isEnabled);
    const [selectRoom, setSelectRoom] = useState({id: '', room: "", latitude: null, longitude: null});


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

// --------------------------------------------------------

const [text, setText] = useState("");
  const [changed, setChanged] = useState(false); 
  const data = [
    {id: '127', room: "gym", latitude: 43.75376776088882, longitude: -79.46106695372214},
    {id: '128', room: "library", latitude: 43.75340776088882, longitude: -79.46106695372214}
  ];
  const [state, setState] = useState({
    query: '',
    fullData: data
  })

  const handleSearch = (text: string) => {
    setChanged(!changed)
    setText(text)
    var formattedQuery = text.toLowerCase()
    var nextData = filter(data, (search: any) => {
      return contains(search, formattedQuery)
    });
    setState({ fullData:nextData , query: text })
  }

  const contains = ({ id, room, long, lat }: any, query: any) => {
    if (id.includes(query) || room.includes(query)) {
      return true
    }
    return false
  }

  const renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '86%',
          backgroundColor: '#CED0CE',
          marginLeft: '5%'
        }}
      />
    )
  }

  const reset =(room:any)=>{
    setText("")
    setState({ fullData:[] , query: "" })
    setSelectRoom(room)
  }

  // -------------------------------------------


    return (
      <View style={styles.container}>
        
        <View style={styles.row}>
        <FlatList
          data={state.fullData}
          keyExtractor={item=>item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => reset(item)}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center'
                }}>
                <Text
                  style={{
                    color: '#000'
                  }}>
                    {`${item.room}`}
                  </Text>
              </View>
            </TouchableOpacity>
          )}
          extraData={changed}
          ItemSeparatorComponent={renderSeparator}
          ListHeaderComponent={
            <View
              style={{
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TextInput
                  style={{height: 20}}
                  placeholder="Search"
                  onChangeText={text => handleSearch(text)}
                  defaultValue={text}
                />
            </View>
          }
          />
        </View>
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
          {roomIdentifier(selectRoom.latitude,selectRoom.longitude )}
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
    return (
    <Overlay 
      image={require('../assets/images/FloorTwo.png')}
      bounds={[
        [43.75282562211260, -79.4627744388977],
        [43.7540713854649, -79.46033910295570]
      ]}
    /> )
  }else if(altitude<147||!isEnabled){
    return (
    <Overlay 
      image={require('../assets/images/FloorOne.png')}
      bounds={[
        [43.75281562211260, -79.46284144388977],
        [43.7541113854649, -79.46045910295570]
      ]}
    /> 
    )
  }
}

function roomIdentifier(latitude: any, longitude: any){
  if(latitude==null||longitude==null)return;
  return(
    <Marker 
      coordinate={{latitude,longitude}}
      >
    </Marker>
  );
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



