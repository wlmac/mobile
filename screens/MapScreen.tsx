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

  const LATITUDE_DELTA = 0.00122; 
    const LONGITUDE_DELTA = 0.00061;
    const latitude = 43.75376776088882;
    const longitude = -79.46106695372214;
    
    const [location, setAlti] = useState<{altitude: null | number, }>({ altitude: null });
    var altitude: number | null = null; 
    const [errorMsg, setErrorMsg] = useState("");

    const [isEnabled, setIsEnabled] = useState(false);
    const toggleSwitch = () => setIsEnabled(isEnabled => !isEnabled);
    const [selectRoom, setSelectRoom] = useState({id: '', room: "", floor: 0, latitude: null, longitude: null});


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
  // const [data, setData] = useState([{id: '', room: "", floor: 0, latitude: 0, longitude: 0}]
  const data = [
    {id: '127', room: "large gym", floor: 1, latitude: 43.753628645506545, longitude: -79.46176003664733},
    {id: '124', room: "small gym", floor: 1, latitude: 43.753628887683234, longitude: -79.46221198886633},
    {id: 'girls change room', room: "girls change room", floor: 1, latitude: 43.75369500188763, longitude: -79.46201786398888},
    {id: 'boys change room', room: "boys change room", floor: 1, latitude: 43.753544367952976, longitude: -79.46196589618921},
    {id: 'team change room', room: "team change room", floor: 1, latitude: 43.75365915976391, longitude: -79.46210503578186},
    {id: '124c', room: "fitness centre", floor: 1, latitude: 43.75347171479428, longitude: -79.46209900081158},
    {id: '127A', room: "gym office A", floor: 1, latitude: 43.75376776088882, longitude: -79.46106695372214},
    {id: '127E', room: "gym office E", floor: 1, latitude: 43.75376776088882, longitude: -79.46106695372214},
    {id: '134', room: "library", latitude: 43.753364914490895, longitude: -79.4610619917512},
    {id: '135', room: "cafeteria", floor: 1, latitude: 43.75377927922907, longitude: -79.46122158318758},
    {id: 'student services', room: "student services", floor: 1, latitude: 43.75351118968812, longitude: -79.4611944258213},
    {id: 'sac room', room: "sac room", floor: 1, latitude: 43.75326005142254, longitude: -79.46105394512415},
    {id: 'cyw', room: "cyw", floor: 1, latitude: 43.75327046508419, longitude: -79.46099828928709},
    {id: 'library office', room: "library office", floor: 1, latitude: 43.75327046508419, longitude: -79.46099828928709},
    {id: '108', room: "sepecial ed resource", floor: 1, latitude: 43.75329008151169, longitude: -79.46124169975518},
    {id: '116', room: "main office", floor: 1, latitude: 43.75355163326401, longitude: -79.46133021265268},
    {id: 'dance room', room: "dance room", floor: 1, latitude: 43.75398343333141, longitude: -79.4614740461111},
    {id: '101', room: "101", floor: 1, latitude: 43.75292947726766, longitude: -79.46136139333248},
    {id: '102', room: "102", floor: 1, latitude: 43.75293674265332, longitude: -79.46121588349342},
    {id: '103', room: "103", floor: 1, latitude: 43.753060254074676, longitude: -79.46139559149742},
    {id: '104', room: "104", floor: 1, latitude: 43.75306848816038, longitude: -79.4612480700016},
    {id: '105', room: "science office", floor: 1, latitude: 43.753142352702, longitude: -79.4614153727889},
    {id: '106', room: "106", floor: 1, latitude: 43.75318449177667, longitude: -79.4612842798233},
    {id: '107', room: "107", floor: 1, latitude: 43.753270222906025, longitude: -79.46144588291645},
    {id: '109', room: "109", floor: 1, latitude: 43.75342836503427, longitude: -79.46147873997688},
    {id: '111', room: "111", floor: 1, latitude: 43.753447254877685, longitude: -79.46165274828672},
    {id: '113', room: "113", floor: 1, latitude: 43.75343369293942, longitude: -79.4617922231555},
    {id: '115', room: "business office", floor: 1, latitude: 43.753418920110306, longitude: -79.46187872439623},
    {id: '117', room: "117", floor: 1, latitude: 43.75340535816562, longitude: -79.46199540048838},
    {id: '119', room: "119", floor: 1, latitude: 43.753376539022945, longitude: -79.46234039962292},
    {id: '121', room: "121", floor: 1, latitude: 43.75347558963164, longitude: -79.46236722171308},
    {id: '123', room: "123", floor: 1, latitude: 43.75356858565292, longitude: -79.46238800883293},
    {id: '125', room: "125", floor: 1, latitude: 43.753660854999985, longitude: -79.46241114288567},
    {id: '114', room: "114", floor: 1, latitude: 43.75385483812394, longitude: -79.46182776242493},
    {id: '118', room: "118", floor: 1, latitude: 43.75383376882629, longitude: -79.46212381124496},
    //floor2: 


  ];
  const [state, setState] = useState({
    query: "" ,
    fullData: data ,
  })

  const handleSearch = (text: string) => {
    setChanged(!changed)
    setText(text)
    var formattedQuery = text.toLowerCase()
    var nextData = filter(data, (search: any) => {
      return contains(search, formattedQuery)
    });
    setState({ fullData: nextData , query: text })
  }

  const contains = ({ id, room, long, lat }: any, query: any) => {
    if (id.includes(query) || room.includes(query)) {
      return true
    }
    return false
  }

  // const renderSeparator = () => {
  //   return (
  //     <View
  //       style={{
  //         height: 1,
  //         width: '86%',
  //         backgroundColor: '#CED0CE',
  //         marginLeft: '5%'
  //       }}
  //     />
  //   )
  // }

  const reset =(room:any)=>{
    setText("")
    setState({ fullData:[] , query: "" })
    setSelectRoom(room)
  }

  // -------------------------------------------

    return (
      <View style={styles.container}>
        <View
              style={{
                backgroundColor: '#fff',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 10,
                paddingTop:20
              }}>
                <TextInput
                  style={{height: 20, width:'100%'}}
                  placeholder="Search"
                  onChangeText={text => handleSearch(text)}
                  defaultValue={text}
                />
                
            </View>
            <View
              style={{
                height: 1,
                width: '86%',
                backgroundColor: '#efefef',
                marginBottom: (state.query.length > 0) ? 5 : -1
              }}
            />
        <View style={styles.row2}>
        
        <FlatList
          style={{
            height: (state.query.length > 0) ? (state.fullData.length*40>150 ? 150: state.fullData.length*40) : 0, 
          }}
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
                    color: '#000',
                    justifyContent: 'center',
                    paddingLeft:20,
                    padding:10 
                  }}>
                    {`${item.room}`}
                  </Text>
              </View>
            </TouchableOpacity>
          )}
          extraData={changed}
          // ItemSeparatorComponent={renderSeparator}
          // ListHeaderComponent={
            
          // }
          />
        </View>
        <View
          style={{
            height: 3.5,
            width: '100%',
            backgroundColor: '#efefef',
          }}
        />
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
          <Marker 
            coordinate={{latitude,longitude}}
            draggable
            onDragEnd={(e: { nativeEvent: { coordinate: any; }; }) => {console.log('dragEnd', e.nativeEvent.coordinate)}}
            >
          </Marker>

          {roomIdentifier(selectRoom.latitude,selectRoom.longitude)}
          {mapOverlay(location.altitude, isEnabled)}
        </MapView>
        <View
          style={{
            height: 3.5,
            width: '100%',
            backgroundColor: '#efefef',
          }}
        />
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
        [43.75275062211260, -79.4625844388977],
        [43.7540903854649, -79.4606710295570]
      ]}
    /> )
  }else if(altitude<147||!isEnabled){
    return (
    <Overlay 
      image={require('../assets/images/FloorOne.png')}
      bounds={[
        [43.75271562211260, -79.4627594388977],
        [43.7541593854649, -79.46079110295570]
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
    flexDirection: "column",
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
    borderTopColor:'#073763', 

  }, 
  row: {
    flexDirection:"row", 
    // flexWrap: "wrap",
    paddingHorizontal:8, 
    paddingVertical:20,
  },
  row2: {
    flexDirection:"row", 
    // flexWrap: "wrap",
    paddingHorizontal:8, 
  },
  switch: {
    paddingHorizontal:8,
  },
  text: {
    paddingHorizontal:8,
    fontFamily: 'poppins',
  }
});



