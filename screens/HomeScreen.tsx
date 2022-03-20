import * as React from 'react';
import { StyleSheet, Image, ImageBackground } from 'react-native';
import { ThemeContext } from '../hooks/useColorScheme';
import { GuestModeContext } from '../hooks/useGuestMode';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import apiRequest from '../lib/apiRequest';
import { Text, View } from '../components/Themed';
import { ChangeLogModal } from '../components/Changelog';
import config from '../config.json';
import getSeason from '../lib/getSeason';
import { BottomTabParamList } from '../types';

let theme;

export default function HomeScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, 'Home'> }) {
  const colorScheme = React.useContext(ThemeContext);
  const guestMode = React.useContext(GuestModeContext);

  let criticalTimes: any[];
  let time: number;
  let schedule: any;
  let termSchedule: any;
  let dayOfTheWeek: number;
  let season = getSeason();

  let [timetable, updateTimeTable] = React.useState("Fetching data...");
  let [weatherIcon, updateIcon] = React.useState(require('../assets/images/loading.gif'));
  let [weather, updateWeather] = React.useState('c');
  let [temp, updateTemp] = React.useState('Loading...');

  let [course, updateCourse] = React.useState("Loading...");
  let [timeText, updateTimeText] = React.useState("Loading...");
  let [nextCourse, updateNextCourse] = React.useState("");

  let [dayHomepage, updateHomePage] = React.useState("No School!");

  let [dataUploaded, updateDataUploaded] = React.useState("");

  criticalTimes = [];

  apiRequest(`/api/term/current/schedule`, '', 'GET', true).then(res => {
    if (res.success) {
      termSchedule = JSON.parse(res.response);
      if (termSchedule && termSchedule[0]) {
        let displayedInfo = ``;
        updateHomePage(`${termSchedule[0].cycle}`);
        for (let i = 0; i < termSchedule.length; i++) {
          if (termSchedule[i].course == null) {
            termSchedule[i].course = "Period " + (i + 1);
          }
          displayedInfo += `${termSchedule[i].description.time}${' '.repeat(Math.max(20 - termSchedule[i].description.time.length, 0))} |  ${termSchedule[i].course}`;
          let timeobj = {
            start: ((Date.parse(termSchedule[i].time.start) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000,
            end: ((Date.parse(termSchedule[i].time.end) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000,
            course: termSchedule[i].course
          }
          criticalTimes.push(timeobj);
          if (i !== termSchedule.length - 1) {
            displayedInfo += `\n`;
          }
        }
        if (criticalTimes.length >= 2) { //if there are more than 2 courses, there must be a lunch in there somewhere, right?
          let pindx = Math.floor(criticalTimes.length / 2.0) - 1;
          let lunchobj = {
            start: criticalTimes[pindx].end,
            end: criticalTimes[pindx + 1].start,
            course: 'LUNCH'
          }
          criticalTimes.splice(pindx + 1, 0, lunchobj);
        }
        if (dataUploaded == '') {
          updateTimeTable(displayedInfo);
          updateDataUploaded("public");
        }
      } else {
        updateTimeTable(`No class today!`);
        updateCourse(`SCHOOL DAY FINISHED`);
        updateTimeText(``);
      }
    }
  }).catch(err => {
    updateTimeTable(`Uh-oh, error occurred :(`);
  })
  getWeather().then((data) => {
    updateIcon(wIcons[data.weather_state_abbr]);
    updateTemp(`${data.the_temp}°`);
    updateWeather(data.weather_state_abbr);
  }).catch(() => {
    updateTemp(`Unknown`);
    updateIcon(require('../assets/images/nowifi.png'));
  })

  apiRequest(`/api/me/schedule`, '', 'GET').then(res => {
    if (res.success) {
      schedule = JSON.parse(res.response);
      if (schedule && schedule[0]) {
        let displayedInfo = ``;
        for (let i = 0; i < schedule.length; i++) {
          if (schedule[i].course == null) {
            schedule[i].course = "Period " + (i + 1);
          }
          displayedInfo += `${schedule[i].description.time}${' '.repeat(Math.max(20 - schedule[i].description.time.length, 0))} |  ${schedule[i].course}`;
          let timeobj = {
            start: ((Date.parse(schedule[i].time.start) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000,
            end: ((Date.parse(schedule[i].time.end) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000,
            course: schedule[i].course
          }
          for (let j = 0; j < criticalTimes.length; j++) {
            if (criticalTimes[j].start == timeobj.start && criticalTimes[j].end == timeobj.end) {
              criticalTimes[j].course = timeobj.course;
              break;
            }
          }
          if (i !== schedule.length - 1) {
            displayedInfo += `\n`;
          }
        }
        if (dataUploaded == 'public') {
          updateTimeTable(displayedInfo);
          updateDataUploaded("personal");
        }
      }
    }
    else if (dataUploaded == "") {
      updateCourse(`Currently Offline`);
      updateTimeText('No internet');
      updateTimeTable(`Could not connect to server!`);
    }
  }).catch(err => {
    updateTimeTable(`Uh-oh, error occurred :(`);
  })
  getWeather().then((data) => {
    updateIcon(wIcons[data.weather_state_abbr]);
    updateTemp(`${data.the_temp}°`);
    updateWeather(data.weather_state_abbr);
  }).catch(() => {
    updateTemp(`Unknown`);
    updateIcon(require('../assets/images/nowifi.png'));
  })


  const determineTimeString = (presentTime: number, futureTime: number) => {
    const difference = futureTime - presentTime;
    const hours = Math.floor(difference / 60) + "";
    const minutes = difference % 60 + "";

    return `${hours}h ${minutes}min`;
  }

  var loopingInterval: any;

  React.useEffect(() => {
    if (dataUploaded !== "") {
      dayOfTheWeek = new Date().getDay();
      clearInterval(loopingInterval);
      loopingInterval = setInterval(() => {
        time = Math.floor((Date.now() - new Date().setHours(0, 0, 0, 0)) / 60000);
        if (criticalTimes.length == 0) { }
        else if (time >= criticalTimes[criticalTimes.length - 1].end || dayOfTheWeek > 5) {
          updateCourse(`SCHOOL DAY FINISHED`);
          updateTimeText(``);
          updateNextCourse("");
        }
        else {
          if (time < criticalTimes[0].start) {
            updateTimeText(`Starts in ${determineTimeString(time, criticalTimes[0].start)}`);
            updateCourse(criticalTimes[0].course);
            updateNextCourse("");
          } else {
            for (let i: number = 0; i < criticalTimes.length; i++) {
              if (time >= criticalTimes[i].start && time < criticalTimes[i].end) {
                updateTimeText(`Ends in ${determineTimeString(time, criticalTimes[i].end)}`);
                updateCourse(criticalTimes[i].course);
                if (i != criticalTimes.length - 1) {
                  updateNextCourse(`Up next: ${criticalTimes[i + 1].course}`);
                } else {
                  updateNextCourse("");
                }
                break;
              }
            }
          }
        }
      }, 1000);
      return () => clearInterval(loopingInterval);
    }
  }, [dataUploaded]);

  if (colorScheme.scheme === "light") {
    theme = {
      color1: "#005C99",
      color2: "#003D66",
      websiteColor: "rgb(58, 106, 150)",
      tint: "transparent"
    }
  }
  else {
    theme = {
      color1: "#e6e6e6",
      color2: '#e0e0e0',
      websiteColor: "rgb(58, 106, 150)",
      tint: "rgba(0, 0, 0, 0.3)"
    }
  }

  return (
    <ImageBackground source={seasonBase[season]} resizeMode="cover" style={styles.backgroundImage}>
      <ImageBackground source={wLayers[weather][season]} resizeMode="cover" style={styles.backgroundImage}>

        {/* ---  Main Page Container ---*/}
        <View style={[styles.container, { backgroundColor: theme.tint }]}>

          {/* ---WEATHER CONTAINER ---*/}
          <View style={styles.weatherContainer}>

            {/* --- TEMPERATURE --- */}
            <Text style={[styles.temperature, { color: theme.color1 }]}>{temp}</Text>

            {/* --- WEATHER DIVIDER --- */}
            <View style={[styles.weatherDivider, { borderColor: 'rgb(58, 106, 150)' }]} />

            {/* --- WEATHER ICON --- */}
            <Image style={styles.logo} source={weatherIcon} />

            {/* ---WEATHER CONTAINER ---*/}
          </View>



          {/* --- COURSE ---*/}
          <Text style={[styles.course, { color: theme.color2 }]}>{course}</Text>

          {/* --- TIME TEXT ---*/}
          <Text style={[styles.timeText, { color: theme.color2 }]}>{timeText}</Text>

          {/* --- TIME TEXT ---*/}
          <Text style={[styles.timeText, { color: theme.color2 }]}>{nextCourse}</Text>
          <Text style={[{ textAlign: 'center' }, guestMode.guest ? {display: "flex"} : {display: "none"}]}>
            <Text style={{ color: 'rgb(148, 180, 235)' }} onPress={() => { navigation.jumpTo('Settings') }}>{' '}Log in{' '}</Text>
            to view your personal schedule here!</Text>



          {/* --- TIME TABLE CONTAINER ---*/}
          <View style={styles.timeTableContainer}>

            {/* --- WEEK TEXT --- */}
            <Text style={[styles.weekText, { color: theme.color1 }]}>{dayHomepage}</Text>

            {/* --- COURSE CONTAINER --- */}
            <View style={styles.courseContainer}>

              {/* --- COURSE TEXT --- */}
              <Text style={[styles.courseText, { color: theme.color1 }]}>{timetable}</Text>

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
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* --- BACKGROUND IMAGE --- */
  backgroundImage: {
    flex: 1,
  },
  /* ---------- WEATHER ---------- */

  /* ---WEATHER CONTAINER ---*/
  weatherContainer: {

    position: "absolute",
    right: 10,
    top: 10,

    backgroundColor: "transparent",
    alignItems: "center",
  },

  /* ---TEMPERATURE ---*/
  temperature: {
    fontWeight: "bold",
    fontSize: 35,
    fontFamily: "poppins",
  },

  /* --- WEATHER DIVIDER --- */
  weatherDivider: {
    width: "90%",
    borderWidth: 1,
    marginBottom: 7,
  },

  /* ---TEMPERATURE LOGO ---*/
  logo: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 20,
  },

  /*---------- MAIN INFO ----------*/

  course: {
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
  },

  /*---------- TIME TABLE ----------*/

  /* --- TIME TABLE CONTAINER --- */
  timeTableContainer: {
    backgroundColor: "transparent",
    position: "absolute",
    left: 10,
    bottom: 10,
  },

  /* --- COURSE CONTAINER --- */
  courseContainer: {
    backgroundColor: "transparent",
    borderColor: "rgb(58, 106, 150)",
    borderLeftWidth: 4,
    alignItems: "center",
  },

  /* --- WEEK TEXT --- */
  weekText: {
    fontSize: 40,
    fontWeight: "bold",
    fontFamily: "poppins",
  },

  /* --- COURSE TEXT --- */
  courseText: {
    marginVertical: 5,
    marginLeft: 10,

    fontSize: 17,
  },

});

function getWeather() {
  return new Promise<Weather>((resolve, reject) => {
    fetch(`${config.weatherserver}/api/location/4118/`).then((response) => response.json()).then((json) => {
      json.consolidated_weather[0];
      let weather = new Weather(json.consolidated_weather[0].weather_state_abbr, json.consolidated_weather[0].the_temp);
      resolve(weather);
    }).catch(err => reject("network"));
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
  c: require(`../assets/images/weather/c.png`),
  h: require(`../assets/images/weather/h.png`),
  hc: require(`../assets/images/weather/hc.png`),
  hr: require(`../assets/images/weather/hr.png`),
  lc: require(`../assets/images/weather/lc.png`),
  lr: require(`../assets/images/weather/lr.png`),
  s: require(`../assets/images/weather/s.png`),
  sl: require(`../assets/images/weather/sl.png`),
  sn: require(`../assets/images/weather/sn.png`),
  t: require(`../assets/images/weather/t.png`)
}

const seasonBase: {
  [key: string]: any
} = {
  spring: require(`../assets/images/weather/background/base_spring.png`),
  summer: require(`../assets/images/weather/background/base_summer.png`),
  fall: require(`../assets/images/weather/background/base_fall.png`),
  winter: require(`../assets/images/weather/background/base_winter.png`)
}

//all properties here are specified as spring, summer, fall, and winter
const wLayers: {
  [key: string]: any
} = {
  c: {
    spring: require(`../assets/images/weather/background/clear_spring.png`),
    summer: require(`../assets/images/weather/background/clear_summer.png`),
    fall: require(`../assets/images/weather/background/clear_fall.png`),
    winter: require(`../assets/images/weather/background/clear_winter.png`)
  },
  h: {
    spring: require(`../assets/images/weather/background/hail_all.png`),
    summer: require(`../assets/images/weather/background/hail_all.png`),
    fall: require(`../assets/images/weather/background/hail_all.png`),
    winter: require(`../assets/images/weather/background/hail_all.png`)
  },
  hc: {
    spring: require(`../assets/images/weather/background/heavyclouds_winterspringfall.png`),
    summer: require(`../assets/images/weather/background/heavyclouds_summer.png`),
    fall: require(`../assets/images/weather/background/heavyclouds_winterspringfall.png`),
    winter: require(`../assets/images/weather/background/heavyclouds_winterspringfall.png`)
  },
  hr: {
    spring: require(`../assets/images/weather/background/heavyrain_winterspringfall.png`),
    summer: require(`../assets/images/weather/background/heavyrain_summer.png`),
    fall: require(`../assets/images/weather/background/heavyrain_winterspringfall.png`),
    winter: require(`../assets/images/weather/background/heavyrain_winterspringfall.png`)
  },
  lc: {
    spring: require(`../assets/images/weather/background/lightclouds_spring.png`),
    summer: require(`../assets/images/weather/background/lightclouds_summer.png`),
    fall: require(`../assets/images/weather/background/lightclouds_fall.png`),
    winter: require(`../assets/images/weather/background/lightclouds_winter.png`)
  },
  lr: {
    spring: require(`../assets/images/weather/background/lightrain_winterspringfall.png`),
    summer: require(`../assets/images/weather/background/lightrain_summer.png`),
    fall: require(`../assets/images/weather/background/lightrain_winterspringfall.png`),
    winter: require(`../assets/images/weather/background/lightrain_winterspringfall.png`)
  },
  s: {
    spring: require(`../assets/images/weather/background/showers_spring.png`),
    summer: require(`../assets/images/weather/background/showers_summer.png`),
    fall: require(`../assets/images/weather/background/showers_fall.png`),
    winter: require(`../assets/images/weather/background/showers_winter.png`)
  },
  sl: {
    spring: require(`../assets/images/weather/background/sleet_all.png`),
    summer: require(`../assets/images/weather/background/sleet_all.png`),
    fall: require(`../assets/images/weather/background/sleet_all.png`),
    winter: require(`../assets/images/weather/background/sleet_all.png`)
  },
  sn: {
    spring: require(`../assets/images/weather/background/snow_all.png`),
    summer: require(`../assets/images/weather/background/snow_all.png`),
    fall: require(`../assets/images/weather/background/snow_all.png`),
    winter: require(`../assets/images/weather/background/snow_all.png`)
  },
  t: {
    spring: require(`../assets/images/weather/background/thunderstorm_winterspringfall.png`),
    summer: require(`../assets/images/weather/background/thunderstorm_summer.png`),
    fall: require(`../assets/images/weather/background/thunderstorm_winterspringfall.png`),
    winter: require(`../assets/images/weather/background/thunderstorm_winterspringfall.png`)
  }
}
