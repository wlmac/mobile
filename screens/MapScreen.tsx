import * as React from "react";
import { Text, View } from "../components/Themed";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { BottomTabParamList } from "../types";

import {
  FlatList,
  Platform,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import { useState, useEffect } from "react";
import MapView, {
  Marker,
  Overlay,
  PROVIDER_DEFAULT,
  Region,
} from "react-native-maps";
import * as Location from "expo-location";
import { Switch } from "react-native";
import { TextInput } from "react-native";
import filter from "lodash.filter";
import { ThemeContext } from "../hooks/useColorScheme";
import maplocations from "../constants/maplocations.json";

const floorOne = require("../assets/images/FloorOne.png");
const floorTwo = require("../assets/images/FloorTwo.png");

export default function MapScreen({
  navigation,
}: {
  navigation: BottomTabNavigationProp<BottomTabParamList, "Map">;
}) {
  const initialRegion: Region = {
    latitude: 43.75376776088882,
    longitude: -79.46106695372214,
    latitudeDelta: 0.00122,
    longitudeDelta: 0.00061,
  };
  const currRegion = React.useRef<Region>(initialRegion);

  const [location, setAlti] = useState<{ altitude: null | number }>({
    altitude: null,
  });
  var altitude: number | null = null;
  const [errorMsg, setErrorMsg] = useState("");

  const [isFloorTwo, setIsFloorTwo] = useState(false);
  const toggleSwitch = () => setIsFloorTwo((isEnabled) => !isEnabled);
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
  });

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
          setIsFloorTwo(true);
        else setIsFloorTwo(false);
      }
    })();
  }, []);

  // --------------------------------------------------------

  const [text, setText] = useState("");
  const [changed, setChanged] = useState(false);
  // const [data, setData] = useState([{id: '', room: "", floor: 0, latitude: 0, longitude: 0}]
  const data = maplocations.locations;
  const [state, setState] = useState({
    query: "",
    fullData: data,
  });

  const handleSearch = (text: string) => {
    setChanged(!changed);
    setText(text);
    var formattedQuery = text.toLowerCase();
    var nextData = filter(data, (search) =>
      search.properties.title.includes(formattedQuery)
    );
    setState({ fullData: nextData, query: text });
  };

  const reset = (room: typeof maplocations.locations[0]) => {
    setText("");
    setState({ fullData: [], query: "" });
    setSelectRoom(room);
    if (room.properties.floor == 1) setIsFloorTwo(false);
    else if (room.properties.floor == 2) setIsFloorTwo(true);
  };

  // -------------------------------------------

  const colorScheme = React.useContext(ThemeContext);

  return (
    <View style={styles.container}>
      {/* ---- SEARCH BAR --- */}
      <TextInput
        style={[
          styles.searchBar,
          {
            backgroundColor:
              colorScheme.scheme === "dark" ? "#1c1c1c" : "#e0e0e0",
            color: colorScheme.scheme === "dark" ? "#e0e0e0" : "#1c1c1c",
          },
        ]}
        keyboardAppearance={colorScheme.scheme === "dark" ? "dark" : "light"}
        placeholderTextColor={
          colorScheme.scheme === "light" ? "#1c1c1c" : "#e0e0e0"
        }
        placeholder="Search"
        onChangeText={handleSearch}
        defaultValue={text}
      />

      <View
        style={{
          width: "86%",
          backgroundColor: "transparent",
        }}
      />
      <MapView
        userInterfaceStyle={colorScheme.scheme === "dark" ? "dark" : "light"}
        style={{
          position: "absolute",
          top: 53.5,
          bottom: 64.5,
          flex: 1,
          width: "100%",
          borderTopColor: "#073763",
        }}
        initialRegion={initialRegion}
        region={currRegion.current}
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
        onRegionChange={(e) => (currRegion.current = e)}
      >
        {selectRoom.geometry.coordinates[1] &&
        selectRoom.geometry.coordinates[0] &&
        selectRoom.properties.floor == Number(isFloorTwo) + 1 ? (
          <Marker
            coordinate={{
              latitude: selectRoom.geometry.coordinates[1],
              longitude: selectRoom.geometry.coordinates[0],
            }}
          ></Marker>
        ) : undefined}
        <Overlay
          image={isFloorTwo ? floorTwo : floorOne}
          bounds={[
            [43.752834542813886, -79.4626054388977],
            [43.7540593854649, -79.46087161319494],
          ]}
        />
      </MapView>
      <View
        style={[
          styles.row2,
          {
            backgroundColor:
              colorScheme.scheme === "dark" ? "#252525" : "#e6e6e6",
          },
        ]}
      >
        <FlatList
          style={{
            backgroundColor:
              colorScheme.scheme === "dark" ? "#252525" : "#e6e6e6",
            height:
              state.query.length > 0
                ? state.fullData.length * 40 > 150
                  ? 150
                  : state.fullData.length * 40
                : 0,
            position: "absolute",
            top: 50,
            width: "100%",
            paddingHorizontal: 8,
          }}
          data={state.fullData}
          keyExtractor={(item) => item.properties.title}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => reset(item)}>
              <View
                style={{
                  width: "100%",
                  backgroundColor:
                    colorScheme.scheme === "dark" ? "#252525" : "#e6e6e6",
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
          position: "absolute",
          top:
            50 +
            (state.query.length > 0
              ? state.fullData.length * 40 > 150
                ? 150
                : state.fullData.length * 40
              : 0),
          height: 3.5,
          width: "100%",
          backgroundColor:
            colorScheme.scheme === "dark" ? "#252525" : "#d4d4d4",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: 61,
          height: 3.5,
          width: "100%",
          backgroundColor:
            colorScheme.scheme === "dark" ? "#252525" : "#d4d4d4",
        }}
      />
      <View
        style={[
          styles.row,
          {
            backgroundColor:
              colorScheme.scheme === "dark" ? "#1c1c1c" : "#e0e0e0",
          },
        ]}
      >
        <Text
          style={{
            color: isFloorTwo
              ? colorScheme.scheme === "dark"
                ? "#434343"
                : "#a8a8a8"
              : colorScheme.scheme === "light"
              ? "#434343"
              : "#a8a8a8",
            fontFamily: "poppins",
            paddingHorizontal: 8,
            paddingVertical: Platform.OS === "ios" ? 5 : 10,
          }}
        >
          Floor One
        </Text>
        <Switch
          trackColor={{ false: "#555555", true: "#828282" }}
          thumbColor={colorScheme.scheme === "dark" ? "#e0e0e0" : "#444444"}
          onValueChange={toggleSwitch}
          value={isFloorTwo}
        />
        <Text
          style={{
            color: !isFloorTwo
              ? colorScheme.scheme === "dark"
                ? "#434343"
                : "#a8a8a8"
              : colorScheme.scheme === "light"
              ? "#434343"
              : "#a8a8a8",
            fontFamily: "poppins",
            paddingHorizontal: 8,
            paddingVertical: Platform.OS === "ios" ? 5 : 10,
          }}
        >
          Floor Two
        </Text>
      </View>
    </View>
  );
}

function readFloor(floor: any) {
  if (floor == 1) return false;
  else if (floor == 2) return true;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    position: "absolute",
    top: 0,
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
  row: {
    flexDirection: "row",
    justifyContent: "center",
    // flexWrap: "wrap",
    width: "100%",
    paddingVertical: 15,
    position: "absolute",
    bottom: 0,
  },
  row2: {
    flexDirection: "row",
    // flexWrap: "wrap",
    //paddingHorizontal: 8,
    position: "absolute",
    top: 0,
    width: "100%",
  },
  switch: {
    paddingHorizontal: 8,
  },
  text: {
    paddingHorizontal: 8,
    fontFamily: "poppins",
  },
});
