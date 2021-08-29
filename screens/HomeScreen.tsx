import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import apiRequest from '../components/apiRequest';
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
                displayedInfo += `P${i + 1} - ${schedule.schedule[i].course} (${schedule.schedule[i].info})\n`;
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
    updateTemp(`${data.the_temp}°C`);
  }).catch(() => {
    updateTemp(`Couldn't fetch :(`);
  })
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Home</Text>
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      <Text>{temp}</Text>
      <Image style={styles.logo} source={weatherIcon} />
      <Text>{timetable}</Text>
    </View>
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
  logo: {
    width: 66,
    height: 58,
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
