import * as React from 'react';
import { useState, useEffect } from 'react';
import { FlatList, StyleSheet, TouchableOpacity } from 'react-native';

import MapView, { Marker, Overlay, PROVIDER_GOOGLE } from 'react-native-maps';
import { Text, View } from '../components/Themed';
import * as Location from 'expo-location';
import { Switch } from 'react-native';
import { TextInput } from 'react-native';
import filter from 'lodash.filter';
// import { SearchBar} from '../components/SearchBar';

export default function MapScreen() {

  const LATITUDE_DELTA = 0.00422; 
    const LONGITUDE_DELTA = 0.00091;
    const latitude = 43.75376776088882;
    const longitude = -79.46106695372214;

    
    // const mapRef = useRef(); 
    const [location, setAlti] = useState<{altitude: null | number, }>({ altitude: null });
    var altitude: number | null = null; 
    const [errorMsg, setErrorMsg] = useState("");

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(isEnabled => !isEnabled);
    const [searchText, setText] = useState('');


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
        
        <View style={styles.row}>
          <SearchBar />
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


const SearchBar = () => {
  const [text, setText] = useState(" ");
  const [changed, setChanged] = useState(false); 
  const data = [
    {id: '127', room: "gym", latitude: 43.75376776088882, longitude: -79.46106695372214},
    {id: '128', room: "library", latitude: 43.75376776088882, longitude: -79.46106695372214}
  ];
  console.log("data init "+data)
  const [state, setState] = useState({
    query: '',
    fullData: data
  })

  const handleSearch = (text: string) => {
    setChanged(!changed)
    var formattedQuery = text.toLowerCase()
    console.log("changed1 "+changed); 
    var nextData = filter(data, (search: any) => {
      console.log("changed2 "+changed); 
      return contains(search, formattedQuery)
    });
    setState({ fullData:nextData , query: text })
    console.log("nextData: "+nextData); 
  }

  const contains = ({ id, room, long, lat }: any, query: any) => {
    console.log("room "+room)
    if (id.includes(query) || room.includes(query)) {
      return true
    }
    return false
  }

  const renderSeparator = () => {
    console.log("changed3: "+changed);
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

  return (
      <FlatList
          data={state.fullData}
          keyExtractor={item=>item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => setChanged(!changed)}>
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
  );
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

function roomIdentifier(){
  const room = ""
  const latitude = 43.75376776088882;
  const longitude = -79.46106695372214;
  if(room=="")return;
  return(
    <Marker 
      coordinate={{latitude,longitude}}
      title={room}
      >
    </Marker>
  );
}

function updateSearch(val = ""):void {
  return ;
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



