import * as React from "react";
import { useState, useEffect } from "react";
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
} from "react-native";

import MapView, { Marker, Overlay, PROVIDER_GOOGLE } from "react-native-maps";
import { Text, View } from "../components/Themed";
import * as Location from "expo-location";
import { Switch } from "react-native";
import { TextInput } from "react-native";
import filter from "lodash.filter";

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
    id: "",
    room: "",
    floor: 0,
    latitude: null,
    longitude: null,
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
          setIsEnabled(true);
        else setIsEnabled(false);
      }
    })();
  }, []);

  // --------------------------------------------------------

  const [text, setText] = useState("");
  const [changed, setChanged] = useState(false);
  // const [data, setData] = useState([{id: '', room: "", floor: 0, latitude: 0, longitude: 0}]
  const data = [
    //floor one
    {
      id: "127",
      room: "large gym",
      floor: 1,
      latitude: 43.753628645506545,
      longitude: -79.46176003664733,
    },
    {
      id: "124",
      room: "small gym",
      floor: 1,
      latitude: 43.753628887683234,
      longitude: -79.46221198886633,
    },
    {
      id: "girls change room",
      room: "girls change room",
      floor: 1,
      latitude: 43.75369500188763,
      longitude: -79.46201786398888,
    },
    {
      id: "boys change room",
      room: "boys change room",
      floor: 1,
      latitude: 43.753544367952976,
      longitude: -79.46196589618921,
    },
    {
      id: "team change room",
      room: "team change room",
      floor: 1,
      latitude: 43.75365915976391,
      longitude: -79.46210503578186,
    },
    {
      id: "124c",
      room: "fitness centre",
      floor: 1,
      latitude: 43.75347171479428,
      longitude: -79.46209900081158,
    },
    {
      id: "127A",
      room: "gym office A",
      floor: 1,
      latitude: 43.75376776088882,
      longitude: -79.46106695372214,
    },
    {
      id: "127E",
      room: "gym office E",
      floor: 1,
      latitude: 43.75376776088882,
      longitude: -79.46106695372214,
    },
    {
      id: "134",
      room: "library",
      latitude: 43.753364914490895,
      longitude: -79.4610619917512,
    },
    {
      id: "135",
      room: "cafeteria",
      floor: 1,
      latitude: 43.75377927922907,
      longitude: -79.46122158318758,
    },
    {
      id: "student services",
      room: "student services",
      floor: 1,
      latitude: 43.75351118968812,
      longitude: -79.4611944258213,
    },
    {
      id: "sac room",
      room: "sac room",
      floor: 1,
      latitude: 43.75326005142254,
      longitude: -79.46105394512415,
    },
    {
      id: "cyw",
      room: "cyw",
      floor: 1,
      latitude: 43.75327046508419,
      longitude: -79.46099828928709,
    },
    {
      id: "library office",
      room: "library office",
      floor: 1,
      latitude: 43.75327046508419,
      longitude: -79.46099828928709,
    },
    {
      id: "108",
      room: "sepecial ed resource",
      floor: 1,
      latitude: 43.75329008151169,
      longitude: -79.46124169975518,
    },
    {
      id: "116",
      room: "main office",
      floor: 1,
      latitude: 43.75355163326401,
      longitude: -79.46133021265268,
    },
    {
      id: "dance room",
      room: "dance room",
      floor: 1,
      latitude: 43.75398343333141,
      longitude: -79.4614740461111,
    },
    {
      id: "101",
      room: "101",
      floor: 1,
      latitude: 43.75292947726766,
      longitude: -79.46136139333248,
    },
    {
      id: "102",
      room: "102",
      floor: 1,
      latitude: 43.75293674265332,
      longitude: -79.46121588349342,
    },
    {
      id: "103",
      room: "103",
      floor: 1,
      latitude: 43.753060254074676,
      longitude: -79.46139559149742,
    },
    {
      id: "104",
      room: "104",
      floor: 1,
      latitude: 43.75306848816038,
      longitude: -79.4612480700016,
    },
    {
      id: "105",
      room: "science office",
      floor: 1,
      latitude: 43.753142352702,
      longitude: -79.4614153727889,
    },
    {
      id: "106",
      room: "106",
      floor: 1,
      latitude: 43.75318449177667,
      longitude: -79.4612842798233,
    },
    {
      id: "107",
      room: "107",
      floor: 1,
      latitude: 43.753270222906025,
      longitude: -79.46144588291645,
    },
    {
      id: "109",
      room: "109",
      floor: 1,
      latitude: 43.75342836503427,
      longitude: -79.46147873997688,
    },
    {
      id: "111",
      room: "111",
      floor: 1,
      latitude: 43.753447254877685,
      longitude: -79.46165274828672,
    },
    {
      id: "113",
      room: "113",
      floor: 1,
      latitude: 43.75343369293942,
      longitude: -79.4617922231555,
    },
    {
      id: "115",
      room: "business office",
      floor: 1,
      latitude: 43.753418920110306,
      longitude: -79.46187872439623,
    },
    {
      id: "117",
      room: "117",
      floor: 1,
      latitude: 43.75340535816562,
      longitude: -79.46199540048838,
    },
    {
      id: "119",
      room: "119",
      floor: 1,
      latitude: 43.753376539022945,
      longitude: -79.46234039962292,
    },
    {
      id: "121",
      room: "121",
      floor: 1,
      latitude: 43.75347558963164,
      longitude: -79.46236722171308,
    },
    {
      id: "123",
      room: "123",
      floor: 1,
      latitude: 43.75356858565292,
      longitude: -79.46238800883293,
    },
    {
      id: "125",
      room: "125",
      floor: 1,
      latitude: 43.753660854999985,
      longitude: -79.46241114288567,
    },
    {
      id: "114",
      room: "114",
      floor: 1,
      latitude: 43.75385483812394,
      longitude: -79.46182776242493,
    },
    {
      id: "118",
      room: "118",
      floor: 1,
      latitude: 43.75383376882629,
      longitude: -79.46212381124496,
    },
    //floor2:
    {
      id: "231",
      room: "231",
      floor: 2,
      latitude: 43.75365116793612,
      longitude: -79.46240242570639,
    },
    {
      id: "229",
      room: "229",
      floor: 2,
      latitude: 43.753565195175526,
      longitude: -79.46239538490772,
    },
    {
      id: "227",
      room: "227",
      floor: 2,
      latitude: 43.75347970664606,
      longitude: -79.46237158030272,
    },
    {
      id: "226",
      room: "co-op office",
      floor: 2,
      latitude: 43.75340390509994,
      longitude: -79.46234744042158,
    },
    {
      id: "225",
      room: "225",
      floor: 2,
      latitude: 43.75336055529078,
      longitude: -79.46233838796616,
    },
    {
      id: "223",
      room: "223",
      floor: 2,
      latitude: 43.75337629684523,
      longitude: -79.46219958364964,
    },
    {
      id: "233",
      room: "computer science office",
      floor: 2,
      latitude: 43.753481886241815,
      longitude: -79.46212079375984,
    },
    {
      id: "222",
      room: "222",
      floor: 2,
      latitude: 43.753405600343235,
      longitude: -79.46199808269739,
    },
    {
      id: "221",
      room: "221",
      floor: 2,
      latitude: 43.753421341885826,
      longitude: -79.46187168359755,
    },
    {
      id: "220",
      room: "220",
      floor: 2,
      latitude: 43.753432724229434,
      longitude: -79.46175031363964,
    },
    {
      id: "219",
      room: "219",
      floor: 2,
      latitude: 43.75344701270023,
      longitude: -79.46162827312946,
    },
    {
      id: "213",
      room: "213",
      floor: 2,
      latitude: 43.75342884938928,
      longitude: -79.46147739887238,
    },
    {
      id: "214",
      room: "214",
      floor: 2,
      latitude: 43.75344677052279,
      longitude: -79.46133323013783,
    },
    {
      id: "211",
      room: "211",
      floor: 2,
      latitude: 43.75333948581914,
      longitude: -79.46145694702864,
    },
    {
      id: "212",
      room: "212",
      floor: 2,
      latitude: 43.75335522737912,
      longitude: -79.46131143718958,
    },
    {
      id: "209",
      room: "209",
      floor: 2,
      latitude: 43.75325254389789,
      longitude: -79.46144085377455,
    },
    {
      id: "210",
      room: "210",
      floor: 2,
      latitude: 43.75327651953781,
      longitude: -79.46129769086838,
    },
    {
      id: "207",
      room: "207",
      floor: 2,
      latitude: 43.75316729710038,
      longitude: -79.46141436696053,
    },
    {
      id: "208",
      room: "208",
      floor: 2,
      latitude: 43.7531849761337,
      longitude: -79.46127321571112,
    },
    {
      id: "203",
      room: "203",
      floor: 2,
      latitude: 43.75303313001969,
      longitude: -79.46137748658656,
    },
    {
      id: "206",
      room: "206",
      floor: 2,
      latitude: 43.75310239320719,
      longitude: -79.46125041693449,
    },
    {
      id: "204",
      room: "204",
      floor: 2,
      latitude: 43.75301763055415,
      longitude: -79.46123063564302,
    },
    {
      id: "201",
      room: "201",
      floor: 2,
      latitude: 43.75291470431406,
      longitude: -79.4613479822874,
    },
    {
      id: "202",
      room: "202",
      floor: 2,
      latitude: 43.7529321412425,
      longitude: -79.46120783686638,
    },
    {
      id: "modern lang. office",
      room: "modern languages office",
      floor: 2,
      latitude: 43.75348697196493,
      longitude: -79.46130875498056,
    },
    {
      id: "history office",
      room: "history office",
      floor: 2,
      latitude: 43.75351506452293,
      longitude: -79.46131512522697,
    },
    {
      id: "geography office",
      room: "geography office",
      floor: 2,
      latitude: 43.7535455788382,
      longitude: -79.4613191485405,
    },
    {
      id: "english office",
      room: "english office",
      floor: 2,
      latitude: 43.753589170690184,
      longitude: -79.46133255958557,
    },
    {
      id: "238",
      room: "math office",
      floor: 2,
      latitude: 43.75362791897641,
      longitude: -79.46134228259324,
    },
    {
      id: "book room",
      room: "book room",
      floor: 2,
      latitude: 43.7535988577641,
      longitude: -79.46155149489641,
    },
    {
      id: "dark room",
      room: "dark room",
      floor: 2,
      latitude: 43.75363276251044,
      longitude: -79.46153406053782,
    },
    {
      id: "216A",
      room: "dark room A",
      floor: 2,
      latitude: 43.753774920059136,
      longitude: -79.46142073720694,
    },
    {
      id: "215",
      room: "215",
      floor: 2,
      latitude: 43.753836674936764,
      longitude: -79.46157932281494,
    },
    {
      id: "216",
      room: "216",
      floor: 2,
      latitude: 43.753852900717554,
      longitude: -79.46143213659525,
    },
    {
      id: "217",
      room: "217",
      floor: 2,
      latitude: 43.75397301979385,
      longitude: -79.46160983294249,
    },
    {
      id: "218",
      room: "218",
      floor: 2,
      latitude: 43.75394347439825,
      longitude: -79.46145627647638,
    },
    {
      id: "218A",
      room: "art office",
      floor: 2,
      latitude: 43.75399602644422,
      longitude: -79.46150656789541,
    },
  ];
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

  const contains = ({ id, room, long, lat }: any, query: any) => {
    if (id.includes(query) || room.includes(query)) {
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
  };

  // -------------------------------------------

  return (
    <View style={styles.container}>
      {/* ---- SEARCH BAR --- */}
      <TextInput
        style={[
          styles.searchBar,
          { color: useColorScheme() === "light" ? "black" : "white" },
        ]}
        placeholderTextColor={useColorScheme() === "light" ? "black" : "white"}
        placeholder="Search"
        onChangeText={(text) => handleSearch(text)}
        defaultValue={text}
      />

      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: useColorScheme() === "light" ? "black" : "white",
          marginBottom: state.query.length > 0 ? 5 : -1,
        }}
      />

        <View style={[styles.row2, {backgroundColor: useColorScheme()==="light"? "black": "white"}]}>
        
        <FlatList
          style={{
            height:
              state.query.length > 0
                ? state.fullData.length * 40 > 150
                  ? 150
                  : state.fullData.length * 40
                : 0,
          }}
          data={state.fullData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => reset(item)}>
              <View
                style={{
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
                  {`${item.room}`}
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
          backgroundColor: "#efefef",
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
        provider={PROVIDER_GOOGLE}
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
        ></Marker>

        {roomIdentifier(selectRoom.latitude, selectRoom.longitude)}
        {mapOverlay(location.altitude, isEnabled)}
      </MapView>
      <View
        style={{
          height: 3.5,
          width: "100%",
          backgroundColor: "#efefef",
        }}
      />
      <View style={styles.row}>
        <Text
          style={{
            color: isEnabled ? "#b7b7b7ff" : "#434343ff",
            fontFamily: "poppins",
            paddingHorizontal: 8,
          }}
        >
          Floor One
        </Text>
        <Switch
          trackColor={{ false: "#b7b7b7ff", true: "#b7b7b7ff" }}
          thumbColor={isEnabled ? "#434343ff" : "#434343ff"}
          onValueChange={toggleSwitch}
          value={isEnabled}
        />
        <Text
          style={{
            color: isEnabled ? "#434343ff" : "#b7b7b7ff",
            fontFamily: "poppins",
            paddingHorizontal: 8,
          }}
        >
          Floor Two
        </Text>
      </View>
    </View>
  );
}

function mapOverlay(altitude: any, isEnabled: boolean) {
  if (isEnabled ) {//|| altitude > 147
    return (
      <Overlay
        image={require("../assets/images/FloorTwo.png")}
        bounds={[
          [43.752834542813886, -79.4626054388977],
          [43.7540593854649, -79.46087161319494],
          
        ]}
      />
    );
  } else if ( !isEnabled) {
    return (
      <Overlay
        image={require("../assets/images/FloorOne.png")}
        bounds={[
          [43.752824542813886, -79.4626394388977],
          [43.7540893854649, -79.46088161319494],
        ]}
      />
    );
  }
}

function roomIdentifier(latitude: any, longitude: any) {
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
    // flexWrap: "wrap",
    paddingHorizontal: 8,
    paddingVertical: 20,
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
