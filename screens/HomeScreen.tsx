import * as React from 'react';
import { StyleSheet, Image, useColorScheme, ImageBackground } from 'react-native';

import apiRequest from '../lib/apiRequest';
import { Text, View } from '../components/Themed';
import config from '../config.json';

let theme;

export default function HomeScreen() {

  let criticalTimes: number[];
  let time: number;
  let schedule: any;
  let dayOfTheWeek: number;

  let [timetable, updateTimeTable] = React.useState("Fetching data...");
  let [weatherIcon, updateIcon] = React.useState(require('../assets/images/loading.gif'));
  let [temp, updateTemp] = React.useState('Loading...');

  let [course, updateCourse] = React.useState("Loading...");
  let [timeText, updateTimeText] = React.useState("Loading...");

  let [dataUploaded, updateDataUploaded] = React.useState(false);

  criticalTimes = [];

  apiRequest(`/api/me/schedule?date=${(new Date()).toISOString().split('T')[0]}`, '', 'GET').then(res => {
    if (res.success) {
      schedule = JSON.parse(res.response);
      if (schedule && schedule[0]) {
        let displayedInfo = ``;
        for (let i = 0; i < schedule.length; i++) {
          displayedInfo += `P${i + 1} - ${schedule[i].course} (${schedule[i].description.time})`;
          for (let prop in schedule[i].time) {
            criticalTimes.push(((Date.parse(schedule[i].time[prop]) - new Date().getTimezoneOffset() * 60000) % 86400000) / 60000);
          }
          if (i !== schedule.length - 1) {
            displayedInfo += `\n`;
          }
        }
        updateTimeTable(displayedInfo);
        updateDataUploaded(true);
      }
      else {
        updateTimeTable(`No class today!`);
        updateCourse(`SCHOOL DAY FINISHED`);
        updateTimeText(``);
      }
    }
    else {
      updateTimeTable(`Uh-oh, error occurred :(`);
    }
  }).catch(err => {
    updateTimeTable(`Could not connect to server!`);
  })
  getWeather().then((data) => {
    updateIcon(wIcons[data.weather_state_abbr]);
    updateTemp(`${data.the_temp}°`);
  }).catch(() => {
    updateTemp(`Couldn't fetch :(`);
  })

  const determineTimeString = (presentTime: number, futureTime: number) => {
    return futureTime - presentTime >= 10 ?
      `${Math.floor((futureTime - presentTime) / 60)}:${(futureTime - presentTime) % 60}` :
      `${Math.floor((futureTime - presentTime) / 60)}:0${(futureTime - presentTime) % 60}`
  }

  React.useEffect(() => {
    if (dataUploaded) {
      dayOfTheWeek = new Date().getDay();
      const interval = setInterval(() => {
        time = Math.floor((Date.now() - new Date().setHours(0, 0, 0, 0)) / 60000);
        if (time >= criticalTimes[3] || dayOfTheWeek > 5) {
          updateCourse(`SCHOOL DAY FINISHED`);
          updateTimeText(``);
        }
        else if (time >= criticalTimes[2]) {
          updateTimeText(`Ends in ${determineTimeString(time, criticalTimes[3])} hours`);
          updateCourse(schedule[1].course);
        }
        else if (time >= criticalTimes[1]) {
          updateTimeText(`Ends in ${determineTimeString(time, criticalTimes[2])} hours`);
          updateCourse(`LUNCH`);
        }
        else if (time >= criticalTimes[0]) {
          updateTimeText(`Ends in ${determineTimeString(time, criticalTimes[1])} hours`);
        }
        else {
          updateTimeText(`Starts in ${determineTimeString(time, criticalTimes[0])} hours`);
          updateCourse(schedule[0].course);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [dataUploaded]);

  if (useColorScheme() === "light"){
    theme = {
      color: "#300",
      tint: "transparent" 
    }
  }
  else {
    theme = {
      color: "white",
      tint: "rgba(0, 0, 0, 0.3)"
    } 
  }

  let color;
  return (
    <ImageBackground source={{uri:"https://media.discordapp.net/attachments/759867023885860934/886010709526323210/image0.png?width=1944&height=729"}} resizeMode="cover" style={styles.backgroundImage}>

      {/* ---  Main Page Container ---*/} 
      <View style={[styles.container,{backgroundColor: theme.tint}]}>

        {/* ---WEATHER CONTAINER ---*/}
        <View style={styles.weatherContainer}>

          {/* --- TEMPERATURE --- */}
          <Text style={[styles.temperature,{color: theme.color}]}>{temp}</Text>

          {/* --- WEATHER DIVIDER --- */}
          <View style={[styles.weatherDivider, {borderColor: theme.color}]}/>

          {/* --- WEATHER ICON --- */}
          <Image style={styles.logo} source={weatherIcon} />

          {/* ---WEATHER CONTAINER ---*/}
        </View>



        {/* --- COURSE ---*/}
        <Text style={[styles.course,{color: theme.color}]}>{course}</Text>

        {/* --- TIME TEXT ---*/}
        <Text style={[styles.timeText,{color: theme.color}]}>{timeText}</Text>



        {/* --- TIME TABLE CONTAINER ---*/}
        <View style={styles.timeTableContainer}>

          {/* --- WEEK TEXT --- */}
          <Text style={[styles.weekText,{color: theme.color}]}>Week</Text>

          {/* --- COURSE CONTAINER --- */}
          <View style={styles.courseContainer}>

            {/* --- COURSE TEXT --- */}
            <Text style={[styles.courseText,{color: theme.color}]}>{timetable}</Text>

            {/* --- COURSE CONTAINER --- */}
          </View>

          {/* --- TIME TABLE CONTAINER ---*/}
        </View>


      {/* ---  Main Page Container ---*/} 
      </View>

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