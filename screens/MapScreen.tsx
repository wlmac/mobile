import * as React from "react";
import { useState, useEffect } from "react";
import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import MapView, { Marker, Overlay, PROVIDER_DEFAULT } from "react-native-maps";
import { Text, View } from "../components/Themed";
import * as Location from "expo-location";
import { Switch } from "react-native";
import { TextInput } from "react-native";
import filter from "lodash.filter";
import {ThemeContext} from "../hooks/useColorScheme";
import { data }  from "../constants/map";

const floorOne = require("../assets/images/FloorOne.png");
const floorTwo = require("../assets/images/FloorTwo.png");

export default function MapScreen() {
  const LATITUDE_DELTA = 0.00122;
  const LONGITUDE_DELTA = 0.00061;
  const latitude = 43.75376776088882;
  const longitude = -79.46106695372214;

  const [location, setAlti] = useState<{ altitude: null | number }>({
    altitude: null,
  });
  var altitude: number | null = null;
  const [errorMsg, setErrorMsg] = useState("");

  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled((isEnabled) => !isEnabled);
  const [selectRoom, setSelectRoom] = useState({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [0, 0],
      },
      properties: {
        title: "",
        floor: 0,
      },
    },);

  useEffect(() => {
    (async () => {

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      } else {
        let location = await Location.getCurrentPositionAsync();
        altitude = location.coords.altitude;
        if (location.coords.altitude != null && location.coords.altitude > 147)
          setIsEnabled(true);
        else setIsEnabled(false);
      }
    })();
  }, []);

  // --------------------------------------------------------

  const [text, setText] = useState("");
  const [changed, setChanged] = useState(false);
  // const [data, setData] = useState([{id: '', room: "", floor: 0, latitude: 0, longitude: 0}]
  
  const [state, setState] = useState({
    query: "",
    fullData: data,
  });

  const handleSearch = (text: string) => {
    setChanged(!changed);
    setText(text);
    var formattedQuery = text.toLowerCase();
    var nextData = filter(data, (search: any) => {
      return contains(search, formattedQuery);
    });
    setState({ fullData: nextData, query: text });
  };

  const contains = ({ type,geometry,properties }: any, query: any) => {
    if (properties.title.includes(query)) {
      return true;
    }
    return false;
  };

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

  const reset = (room: any) => {
    setText("");
    setState({ fullData: [], query: "" });
    setSelectRoom(room);
    if(room.properties.floor==1)setIsEnabled(false); 
    else if(room.properties.floor==2) setIsEnabled(true); 
  };


  // -------------------------------------------

  const colorScheme = React.useContext(ThemeContext);

  return (
    <View style={styles.container}>
      {/* ---- SEARCH BAR --- */}
      <TextInput
        style={[
          styles.searchBar,
          { backgroundColor: colorScheme.scheme === "dark" ? "#1c1c1c" : "#e0e0e0",
            color: colorScheme.scheme === "dark" ? "#e0e0e0" : "#1c1c1c" },
        ]}
        placeholderTextColor={colorScheme.scheme === "light" ? "#1c1c1c" : "#e0e0e0"}
        placeholder="Search"
        onChangeText={(text) => handleSearch(text)}
        defaultValue={text}
      />

      <View
        style={{
          width: "86%",
          backgroundColor: 'transparent',
        }}
      />

        <View style={[styles.row2, {backgroundColor: colorScheme.scheme === "dark"? "#252525" : "#e6e6e6"}]}>
        
        <FlatList
          style={{
            backgroundColor: colorScheme.scheme === "dark" ? "#252525" : "#e6e6e6",
            height:
              state.query.length > 0
                ? state.fullData.length * 40 > 150
                  ? 150
                  : state.fullData.length * 40
                : 0,
          }}
          data={state.fullData}
          keyExtractor={(item) => item.properties.title}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => reset(item)}>
              <View
                style={{
                  width: '100%',
                  backgroundColor: colorScheme.scheme === "dark" ? "#252525" : "#e6e6e6",
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    justifyContent: "center",
                    paddingLeft: 20,
                    padding: 10,
                  }}
                >
                  {`${item.properties.title}`}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          extraData={changed}
        />
      </View>
      <View
        style={{
          height: 3.5,
          width: "100%",
          backgroundColor: colorScheme.scheme === "dark" ? "#252525" : "#d4d4d4",
        }}
      />
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        region={{
          latitude: latitude,
          longitude: longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        provider={PROVIDER_DEFAULT}
        mapType="standard"
        zoomEnabled={true}
        pitchEnabled={true}
        showsUserLocation={true}
        // followsUserLocation={true}
        showsCompass={true}
        showsBuildings={true}
        showsTraffic={true}
        showsIndoors={true}
      >
        {/* <Marker
          coordinate={{ latitude, longitude }}
          draggable
          onDragEnd={(e: { nativeEvent: { coordinate: any } }) => {
            console.log(
              "latitude: " +
                e.nativeEvent.coordinate.latitude +
                ", longitude: " +
                e.nativeEvent.coordinate.longitude
            );
          }}
        ></Marker> */}

        {roomIdentifier(selectRoom.geometry.coordinates[1], selectRoom.geometry.coordinates[0])}
        {mapOverlay(location.altitude, isEnabled)}
      </MapView>
      <View
        style={{
          height: 3.5,
          width: "100%",
          backgroundColor: colorScheme.scheme === "dark" ? "#252525" : "#d4d4d4",
        }}
      />
      <View style={[styles.row, {backgroundColor: colorScheme.scheme === "dark" ? "#1c1c1c" : "#e0e0e0"}]}>
        <Text
          style={{
            color: isEnabled ? (colorScheme.scheme === "dark" ? "#434343" : "#a8a8a8") : (colorScheme.scheme === "light" ? "#434343" : "#a8a8a8"),
            fontFamily: "poppins",
            paddingHorizontal: 8,
            paddingVertical: Platform.OS === 'ios' ? 0 : 10
          }}
        >
          Floor One
        </Text>
        <Switch
          trackColor={{ false: "#555555", true: "#828282" }}
          thumbColor={isEnabled ? "#444444" : "#444444"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text
          style={{
            color: !isEnabled ? (colorScheme.scheme === "dark" ? "#434343" : "#a8a8a8") : (colorScheme.scheme === "light" ? "#434343" : "#a8a8a8"),
            fontFamily: "poppins",
            paddingHorizontal: 8,
            paddingVertical: Platform.OS === 'ios' ? 0 : 10
          }}
        >
          Floor Two
        </Text>
      </View>
    </View>
  );
}

function readFloor(floor: any){
  if (floor==1)return false; 
  else if(floor==2) return true; 
}

function mapOverlay(altitude: any, isEnabled: boolean) {
  if (isEnabled ) {//|| altitude > 147
    return (
      <Overlay
        image={floorTwo}
        bounds={[
          [43.752834542813886, -79.4626054388977],
          [43.7540593854649, -79.46087161319494],
          
        ]}
      />
    );
  } else if ( !isEnabled) {
    return (
      <Overlay
        image={floorOne}
        bounds={[
          [43.752824542813886, -79.4626394388977],
          [43.7540893854649, -79.46088161319494],
        ]}
      />
    );
  }
}

function roomIdentifier(latitude: any, longitude: any, ) {
  if (latitude == null || longitude == null) return;
  return <Marker coordinate={{ latitude, longitude }}></Marker>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    width: "100%",
    height: 50,
    textAlign: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: "80%",
  },
  map: {
    flex: 1,
    height: "100%",
    width: "100%",
    borderTopColor: "#073763",
  },
  row: {
    flexDirection: "row",
    justifyContent: "center",
    // flexWrap: "wrap",
    width: '100%',
    paddingVertical: 15,
  },
  row2: {
    flexDirection: "row",
    // flexWrap: "wrap",
    paddingHorizontal: 8,
  },
  switch: {
    paddingHorizontal: 8,
  },
  text: {
    paddingHorizontal: 8,
    fontFamily: "poppins",
  },
});
