import * as React from "react";
import { StyleSheet, Image, ImageBackground, Button, Platform, } from "react-native";
import { ThemeContext } from "../hooks/useColorScheme";
import { GuestModeContext } from "../hooks/useGuestMode";
import { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { Table, Rows } from 'react-native-table-component';

import apiRequest from "../lib/apiRequest";
import { Text, View, useThemeColor } from "../components/Themed";
import config from "../config.json";
import getSeason from "../lib/getSeason";
import { BottomTabParamList } from "../types";
import { ChangeLogModal } from '../components/Changelog';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export default function HomeScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, "Home"> }) {
  const colorScheme = React.useContext(ThemeContext);
  const guestMode = React.useContext(GuestModeContext);

  const notificationListener = React.useRef<any>();
  const responseListener = React.useRef<any>();

  let criticalTimes: {start: number, end: number, course: string}[] = [];
  let season = getSeason();
  let textColor = useThemeColor({}, "text");

  const [weatherIcon, updateIcon] = React.useState(require("../assets/images/loading.gif"));
  const [weather, updateWeather] = React.useState("c");
  const [temperature, updateTemperature] = React.useState("Loading...");
  const [nextCourse, updateNextCourse] = React.useState<string | undefined>(undefined);
  const [timetableHeader, updateTimetableHeader] = React.useState<string | undefined>("Loading...");
  const [dataUploaded, updateDataUploaded] = React.useState<string | undefined>(undefined);
  //https://stackoverflow.com/questions/66762778/how-to-access-state-in-a-react-functional-component-from-a-settimeout-or-setinte
  const dataUploadedRef = React.useRef<string | undefined>();
  dataUploadedRef.current = dataUploaded;
  const [preTimeText, updatePreTimeText] = React.useState<string | undefined>(undefined);
  const [course, updateCourse] = React.useState("Loading...");
  const [timeText, updateTimeText] = React.useState<string | undefined>("Loading...");
  const [timetable, updateTimetable] = React.useState<string | any[][] | undefined>("Fetching data...");
  const [expoNotificationToken, setExpoNotificationToken] = React.useState<string | undefined>(undefined);
  const [notification, setNotification] = React.useState<Object | undefined>(undefined);

  const theme = colorScheme.scheme === "light" ? {
    color1: "#005C99",
    color2: "#003D66",
    websiteColor: "rgb(58, 106, 150)",
    tint: "transparent"
  } : {
    color1: "#e6e6e6",
    color2: "#e0e0e0",
    websiteColor: "rgb(58, 106, 150)",
    tint: "rgba(0, 0, 0, 0.3)"
  };

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });  

  async function setSchedule(endpoint: string, userSchedule: boolean){
    try{
      const res = await apiRequest(endpoint, "", "GET", !userSchedule);
      if (!res.success) {
        if (!dataUploadedRef.current && !userSchedule) {
          updatePreTimeText(undefined);
          updateCourse("Currently Offline");
          updateTimeText("No internet");
          updateTimetableHeader("Error");
          updateTimetable("Could not connect to server!");
        }
        return;
      }
      let schedule = JSON.parse(res.response);
      if (!(schedule && schedule[0])) {
        updatePreTimeText(undefined);
        updateCourse("NO CLASS TODAY");
        updateTimeText(undefined);
        updateTimetableHeader(undefined);
        updateTimetable(undefined);
        return;
      }
      let displayedInfo: any[][] = [];
      for (let i = 0; i < schedule.length; i++) {
        const course = schedule[i].course ?? `Period ${i + 1}`;

        displayedInfo.push([schedule[i].description.time, course]);

        let start = ((Date.parse(schedule[i].time.start) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000,
          end = ((Date.parse(schedule[i].time.end) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000;
        
        if(userSchedule){
          for (let j = 0; j < criticalTimes.length; j++) {
            if (criticalTimes[j].start == start && criticalTimes[j].end == end) {
              criticalTimes[j].course = course;
              break;
            }
          }
        }else{
          criticalTimes.push({ start, end, course });
        }
      }
      if(userSchedule){
        if (dataUploadedRef.current == "public") {
          updateTimetable(displayedInfo);
          updateDataUploaded("personal");
        }
      }else{
        updateTimetableHeader(schedule[0].cycle);
        if (!dataUploadedRef.current) {
          updateTimetable(displayedInfo);
          updateDataUploaded("public");
        }
      }
    }catch(err){
      console.error(err);
      updateTimetable("Uh-oh, an error occurred :(");
    }
  }

  function determineTimeString(difference: number){
    const hours = difference >= 3600 ? Math.floor(difference / 3600).toString().padStart(2, "0") + ":" : "";
    const minutes = (Math.floor(difference / 60) % 60).toString().padStart(2, "0");
    const seconds = (difference % 60).toString().padStart(2, "0");

    return `${hours}${minutes}:${seconds}`;
  }

  function updateInfo(){
    if (!dataUploadedRef.current)
      return;
    let time = Math.floor((Date.now() - new Date().setHours(0, 0, 0, 0)) / 1000), timeInMinutes = Math.floor(time / 60);
    if(criticalTimes.length > 0){
      if(new Date().getDay() >= 6 || timeInMinutes >= criticalTimes[criticalTimes.length - 1].end){
        updatePreTimeText(undefined);
        updateCourse("SCHOOL DAY FINISHED");
        updateTimeText(undefined);
        updateNextCourse(undefined);
      }else{
        for(let i = 0; i < criticalTimes.length; i++){
          let curTime = criticalTimes[i];
          if(timeInMinutes < curTime.end){
            if(timeInMinutes >= curTime.start){
              updatePreTimeText(undefined);
              updateCourse(curTime.course);
              updateTimeText(`Ends in ${determineTimeString(curTime.end * 60 - time)}`);
              updateNextCourse(i < criticalTimes.length - 1 ? `Up next: ${criticalTimes[i + 1].course}` : undefined);
            }else{
              updatePreTimeText("Up next:");
              updateCourse(curTime.course);
              updateTimeText(`Starts in ${determineTimeString(curTime.start * 60 - time)}`);
              updateNextCourse(undefined);
            }
            break;
          }
        }
      }
    }
  }


  async function setupNotifToken(): Promise<string | undefined> {
    if (!Device.isDevice) {
      console.error("Not a device");
      return undefined;
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      // remove in production
      alert('Failed to get push token for push notification! Perhaps your system permissions do not allow notifications?');
      return undefined;
    }
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    let expoPushToken: string | undefined = undefined;
    try {
      expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
    } catch (error) {
      console.log('Error fetching Expo token:', error, "\nFor developers, ensure you are logged in with your Expo account in order for notif testing to work.");
    }

    if (!expoPushToken) {
      alert('Failed to get push token for push notification');
      return undefined;
    }

    expoPushToken = expoPushToken.slice(18, -1);

    const options = {
      "allow": {
        "event.all": {},
        "event.singleday": {},
        "blog": {},
        "ann.personal": {},
        "ann.public": {},
      }
    }

    await apiRequest("/api/v3/notif/token", JSON.stringify({"expo_push_token": expoPushToken, "options": options}), "PUT", false).then((res) => {
      if (!res.success) {
        console.error("An error occurred while trying to set the expo notification token: " + res.error);
        return undefined;
      } else {
        console.log("Successfully updated notif token " + res.response);
        setExpoNotificationToken(expoPushToken);
      }
    }).catch((err) => {
      console.error("An error occurred while trying to set the expo notification token: " + err);
      // no notifs allowed
    });
    return expoPushToken;
  }

  function configureNotificationListeners() {
    notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
      setNotification(notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }

  React.useEffect(() => {
    if (!guestMode.guest) {
      setupNotifToken().then(token => {
        setExpoNotificationToken(token);
      });
    }
    configureNotificationListeners();

    getWeather().then((data) => {
      updateIcon(wIcons[data.weather_state_abbr]);
      updateTemperature(`${data.the_temp}°`);
      updateWeather(data.weather_state_abbr);
    }).catch(() => {
      updateTemperature("Unknown");
      updateIcon(require("../assets/images/nowifi.png"));
    });

    let interval: number;
    setSchedule((guestMode.guest ? "/api/term/current/schedule" : "/api/me/schedule")/* + "?date=2023-02-22"*/, !guestMode.guest).then(() => {
      interval = window.setInterval(() => updateInfo(), 1000);
      updateInfo();
    });
    return () => window.clearInterval(interval);
  }, []);

  return (
    <ImageBackground source={seasonBase[season]} resizeMode="cover" style={styles.backgroundImage}>
      <ImageBackground source={wLayers[weather][season]} resizeMode="cover" style={styles.backgroundImage}>

        {/* ---  Main Page Container ---*/}
        <View style={[styles.container, { backgroundColor: theme.tint }]}>

          {/* ---WEATHER CONTAINER ---*/}
          <View style={styles.weatherContainer}>

            {/* --- TEMPERATURE --- */}
            <Text style={[styles.temperatureText, { color: theme.color1 }]}>{temperature}</Text>

            {/* --- WEATHER DIVIDER --- */}
            <View style={styles.weatherDivider} />

            {/* --- WEATHER ICON --- */}
            <Image style={styles.temperatureLogo} source={weatherIcon} />

            {/* ---WEATHER CONTAINER ---*/}
          </View>

          {preTimeText && <Text style={[styles.timeText, { color: theme.color2 }]}>{preTimeText}</Text>}

          {/* <Text>{expoNotificationToken}</Text> */}

          {/* --- COURSE ---*/}
          <Text style={[styles.courseTitle, { color: theme.color2 }]}>{course}</Text>

          {/* --- TIME TEXT ---*/}
          <Text style={[styles.timeText, { color: theme.color2 }]}>{timeText}</Text>

          {/* --- TIME TEXT ---*/}
          {nextCourse && <Text style={[styles.timeText, { color: theme.color2 }]}>{nextCourse}</Text>}
          
          {guestMode.guest ?
            <Text style={{ textAlign: "center", marginTop: 10 }}>
              <Text style={{ color: colorScheme.scheme == "dark" ? "rgb(148, 180, 235)" : "rgb(51,102,187)" }}
                onPress={() => { navigation.jumpTo("Settings") }}>Log in&nbsp;</Text>
              to view your personal schedule here!
            </Text> : undefined
          }

          {/* --- TIME TABLE CONTAINER ---*/}
          <View style={styles.timetableContainer}>

            {/* --- WEEK TEXT --- */}
            {timetableHeader && <Text style={[styles.weekText, { color: theme.color1 }]}>{timetableHeader}</Text>}

            {/* --- COURSE CONTAINER --- */}
            <View style={styles.courseContainer}>

              {/* --- COURSE TEXT --- */}
              {
                timetable && (Array.isArray(timetable) ? 
                <Table>
                  <Rows data={
                    timetable.map(([times, course]) =>
                      [<Text style={styles.time}>{times}</Text>, <View style={[styles.courseRightText, { borderColor: textColor }]}><Text>{course}</Text></View>])
                  } widthArr={[148, 200]} textStyle={{ color: textColor }}/>
                  
                </Table> : <Text style={styles.courseText}>{timetable}</Text>)
              }

              {/* --- COURSE CONTAINER --- */}
            </View>

            {/* --- TIME TABLE CONTAINER ---*/}
          </View>


          {/* ---  Main Page Container ---*/}
          {ChangeLogModal()}
        </View>
      </ImageBackground>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  backgroundImage: {
    flex: 1,
  },

  /*---------- WEATHER ----------*/

  weatherContainer: {

    position: "absolute",
    right: 10,
    top: 10,

    backgroundColor: "transparent",
    alignItems: "center",
  },

  /* -------- TEMPERATURE --------*/
  temperatureText: {
    fontWeight: "bold",
    fontSize: 35,
    fontFamily: "poppins",
  },

  weatherDivider: {
    width: "90%",
    borderWidth: 1,
    marginBottom: 7,
    borderColor: "rgb(58, 106, 150)",
  },

  temperatureLogo: {
    width: 60,
    height: 60,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    borderRadius: 20,
  },

  /*---------- MAIN INFO ----------*/

  courseTitle: {
    width: "90%",
    fontSize: 40,
    fontWeight: "bold",
    textAlign: "center",

    fontFamily: "poppins",
  },

  timeText: {
    width: "80%",
    fontSize: 20,
    textAlign: "center",
    fontVariant: ["tabular-nums"]
  },

  /*---------- TIMETABLE ----------*/

  timetableContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    left: 10,
    bottom: 10,
  },

  courseContainer: {
    backgroundColor: "transparent",
    marginVertical: 5,
    marginLeft: 10,
    fontSize: 17,
    paddingLeft: 10,
    borderColor: "rgb(58, 106, 150)",
    borderLeftWidth: 4
  },

  courseItem: {
    backgroundColor: "transparent",
    alignItems: "center",
  },

  weekText: {
    fontSize: 40,
    fontWeight: "bold",
    fontFamily: "poppins",
  },

  courseText: {
    backgroundColor: "transparent"
  },

  courseTextRightAlign: {
    backgroundColor: "transparent",
    textAlign: "right"
  },

  courseRightText: {
    backgroundColor: "transparent",
    borderLeftWidth: 1.2,
    paddingLeft: 10
  },

  /*----------- MISC -----------*/

  time: {
    fontVariant: ["tabular-nums"]
  }

});

function getWeather() {
  return new Promise<Weather>((resolve, reject) => {
    fetch(`${config.weatherserver}/weather`).then(response => response.json()).then(json => {
      json.consolidated_weather[0];
      let weather = new Weather(json.consolidated_weather[0].weather_state_abbr, json.consolidated_weather[0].the_temp);
      resolve(weather);
    }).catch(() => reject("network"));
  })
}

class Weather {
  weather_state_abbr: string;
  the_temp: number;
  constructor(weather_state_abbr: string, the_temp: string) {
    this.weather_state_abbr = weather_state_abbr;
    this.the_temp = Math.round(parseFloat(the_temp));
  }
}

const wIcons: {
  [key: string]: any
} = {
  c: require("../assets/images/weather/c.png"),
  h: require("../assets/images/weather/h.png"),
  hc: require("../assets/images/weather/hc.png"),
  hr: require("../assets/images/weather/hr.png"),
  lc: require("../assets/images/weather/lc.png"),
  lr: require("../assets/images/weather/lr.png"),
  s: require("../assets/images/weather/s.png"),
  sl: require("../assets/images/weather/sl.png"),
  sn: require("../assets/images/weather/sn.png"),
  t: require("../assets/images/weather/t.png")
}

const seasonBase: {
  [key: string]: any
} = {
  spring: require("../assets/images/weather/background/base_spring.png"),
  summer: require("../assets/images/weather/background/base_summer.png"),
  fall: require("../assets/images/weather/background/base_fall.png"),
  winter: require("../assets/images/weather/background/base_winter.png")
}

//all properties here are specified as spring, summer, fall, and winter
const wLayers: {
  [key: string]: any
} = {
  c: {
    spring: require("../assets/images/weather/background/clear_spring.png"),
    summer: require("../assets/images/weather/background/clear_summer.png"),
    fall: require("../assets/images/weather/background/clear_fall.png"),
    winter: require("../assets/images/weather/background/clear_winter.png")
  },
  h: {
    spring: require("../assets/images/weather/background/hail_all.png"),
    summer: require("../assets/images/weather/background/hail_all.png"),
    fall: require("../assets/images/weather/background/hail_all.png"),
    winter: require("../assets/images/weather/background/hail_all.png")
  },
  hc: {
    spring: require("../assets/images/weather/background/heavyclouds_winterspringfall.png"),
    summer: require("../assets/images/weather/background/heavyclouds_summer.png"),
    fall: require("../assets/images/weather/background/heavyclouds_winterspringfall.png"),
    winter: require("../assets/images/weather/background/heavyclouds_winterspringfall.png")
  },
  hr: {
    spring: require("../assets/images/weather/background/heavyrain_winterspringfall.png"),
    summer: require("../assets/images/weather/background/heavyrain_summer.png"),
    fall: require("../assets/images/weather/background/heavyrain_winterspringfall.png"),
    winter: require("../assets/images/weather/background/heavyrain_winterspringfall.png")
  },
  lc: {
    spring: require("../assets/images/weather/background/lightclouds_spring.png"),
    summer: require("../assets/images/weather/background/lightclouds_summer.png"),
    fall: require("../assets/images/weather/background/lightclouds_fall.png"),
    winter: require("../assets/images/weather/background/lightclouds_winter.png")
  },
  lr: {
    spring: require("../assets/images/weather/background/lightrain_winterspringfall.png"),
    summer: require("../assets/images/weather/background/lightrain_summer.png"),
    fall: require("../assets/images/weather/background/lightrain_winterspringfall.png"),
    winter: require("../assets/images/weather/background/lightrain_winterspringfall.png")
  },
  s: {
    spring: require("../assets/images/weather/background/showers_spring.png"),
    summer: require("../assets/images/weather/background/showers_summer.png"),
    fall: require("../assets/images/weather/background/showers_fall.png"),
    winter: require("../assets/images/weather/background/showers_winter.png")
  },
  sl: {
    spring: require("../assets/images/weather/background/sleet_all.png"),
    summer: require("../assets/images/weather/background/sleet_all.png"),
    fall: require("../assets/images/weather/background/sleet_all.png"),
    winter: require("../assets/images/weather/background/sleet_all.png")
  },
  sn: {
    spring: require("../assets/images/weather/background/snow_all.png"),
    summer: require("../assets/images/weather/background/snow_all.png"),
    fall: require("../assets/images/weather/background/snow_all.png"),
    winter: require("../assets/images/weather/background/snow_all.png")
  },
  t: {
    spring: require("../assets/images/weather/background/thunderstorm_winterspringfall.png"),
    summer: require("../assets/images/weather/background/thunderstorm_summer.png"),
    fall: require("../assets/images/weather/background/thunderstorm_winterspringfall.png"),
    winter: require("../assets/images/weather/background/thunderstorm_winterspringfall.png")
  }
}
