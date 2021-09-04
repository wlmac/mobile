import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import apiRequest from '../lib/apiRequest';
import { Text, View } from '../components/Themed';
import config from '../config.json';

export default function HomeScreen() {
  let [timetable, updateTimeTable] = React.useState("Fetching data...");
  let [weatherIcon, updateIcon] = React.useState(require('../assets/images/loading.gif'));
  let [temp, updateTemp] = React.useState('Loading...');
  apiRequest('/api/timetables', '', 'GET').then(res1 => {
    if (res1.success) {
      let parsed = JSON.parse(res1.response);
      if (parsed[0] && parsed[0].id) {
        apiRequest(`/api/timetable/${parsed[0].id}/today`, '', 'GET').then(res => {
          if (res.success) {
            let schedule = JSON.parse(res.response);
            if (schedule.schedule && schedule.schedule[0]) {
              let displayedInfo = ``;
              for (let i = 0; i < schedule.schedule.length; i++) {
                displayedInfo += `P${i + 1} - ${schedule.schedule[i].course} (${schedule.schedule[i].info})`;
                if (i !== schedule.schedule.length-1){
                  displayedInfo += `\n`;
                }
              }
              updateTimeTable(displayedInfo);
            }
            else {
              updateTimeTable(`No class today!`);
            }
          }
          else {
            updateTimeTable(`Uh-oh, error occurred :(`);
          }
        })
      }
      else {
        updateTimeTable(`No timetable`);
      }
    }
    else {
      updateTimeTable(`API request failed`);
    }
  })
  getWeather().then((data) => {
    updateIcon(wIcons[data.weather_state_abbr]);
    updateTemp(`${data.the_temp}°`);
  }).catch(() => {
    updateTemp(`Couldn't fetch :(`);
  })
  return (
    <View style={styles.container}>

      {/* ---WEATHER CONTAINER ---*/}
      <View style={styles.weatherContainer}>

        {/* --- TEMPERATURE --- */}
        <Text style={styles.temperature}>{temp}</Text>

        {/* --- WEATHER DIVIDER --- */}
        <View style={styles.weatherDivider}></View>

        {/* --- WEATHER ICON --- */}
        <Image style={styles.logo} source={weatherIcon} />

      {/* ---WEATHER CONTAINER ---*/}
      </View>

      {/* --- TIME TABLE CONTAINER ---*/}
      <View style={styles.timeTableContainer}>

        {/* --- WEEK TEXT --- */}
        <Text style={styles.weekText}>Week</Text>

        {/* --- COURSE CONTAINER --- */}
        <View style={styles.courseContainer}>

          {/* --- COURSE TEXT --- */}
          <Text style={styles.courseText}>{timetable}</Text>

        {/* --- COURSE CONTAINER --- */}
        </View>

      {/* --- TIME TABLE CONTAINER ---*/}
      </View>

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },


  /* ---------- WEATHER ---------- */ 

  /* ---WEATHER CONTAINER ---*/
  weatherContainer: {

    position: "absolute",
    right: 10,
    top: 10,

    alignItems: "center",
  },

  /* ---TEMPERATURE ---*/
  temperature : {
    fontWeight: "bold",
    fontSize: 35,
  },

  /* --- WEATHER DIVIDER --- */
  weatherDivider: {
    borderColor: "white",
    width: "90%",
    borderWidth: 1,
    marginBottom: 7,
  },

  /* ---TEMPERATURE LOGO ---*/
  logo: {
    width: 60,
    height: 60,
  },

  /*---------- TIME TABLE ----------*/

  /* --- TIME TABLE CONTAINER --- */
  timeTableContainer: {
    position: "absolute",
    left:10,
    bottom: 10,
  },

  /* --- COURSE CONTAINER --- */
  courseContainer: {
    borderColor:"rgb(58, 106, 150)",
    borderLeftWidth: 4,
    alignItems: "center",
  },

  /* --- WEEK TEXT --- */
  weekText: {
    fontSize: 30,
    fontWeight: "bold"
  },

  /* --- COURSE TEXT --- */
  courseText: {
    marginVertical: 5,
    marginLeft:10,

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
