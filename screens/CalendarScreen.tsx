import React, {useState, Fragment, useCallback, useEffect} from 'react';
import { Button, Dimensions, StyleSheet, ScrollView } from 'react-native';

import { Calendar, CalendarList, CalendarProps, Agenda } from 'react-native-calendars';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

import apiRequest from '../lib/apiRequest';
import config from '../config.json';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },

  separator: {
    margin: 15,
    height: 1,
    width: '80%',
  },

  calendar: {
    width: windowWidth,
  },

  selectedDayStyle: {
    justifyContent: 'center',
    color: 'white',
  }
});

const staticCalendarProps = {
  showSixWeeks: true,
  disableMonthChange: true,
  disableAllTouchEventsForDisabledDays: true,
}

const calendarTheme = {
  backgroundColor: '#000000',
  calendarBackground: '#000000',

  textSectionTitleColor: '#ffffff',
  textSectionTitleDisabledColor: '#4a4a4a',

  selectedDayBackgroundColor: '#ffffff',
  selectedDayTextColor: '#ffffff',

  todayTextColor: '#f7c40c',
  dayTextColor: '#ffffff',

  textDisabledColor: '#4a4a4a',

  dotColor: '#00adf5',
  selectedDotColor: '#ffffff',

  arrowColor: '#ffffff',
  disabledArrowColor: '#4a4a4a',

  monthTextColor: '#ffffff',
}

// calendar screen
export default function CalendarScreen() {

  // get today's date
  let today: string = new Date().toISOString().split('T')[0];
  
  let rawEvents: any;
  
  const [dbg, sdbg] = useState("did not fetch data yet");

  // selected date state
  const [selectedDay, setSelectedDay] = useState(today);
  
  // current key state
  const [currentKey, setCurrentKey] = useState(new Date());

  // data fetched state
  const [dataFetched, setDataFetched] = useState(false);

  // events state
  const [events, setEvents] = useState([]);

  // fetch events from API if not fetched yet
  if (!dataFetched) {
    apiRequest(`/api/events`, '', 'GET').then(res => {
      console.log("fetching events...");
      if (res.success) {
        console.log("success");
        rawEvents = JSON.parse(res.response);
        sdbg(res.response);
        setDataFetched(true);
      }
      else {
        console.log(res.response);
        sdbg(res.response);
      }
    })
  }

  // function that is called on day press
  const onDayPress = useCallback((day) => {
    setSelectedDay(day.dateString);
    // TODO: update events on this day
  }, []);

  return (
    // scrollview tentatively, will change potentially
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* --- Calendar wrapper ---*/}
      <View style={styles.calendar}>

        {/* --- Calendar component ---*/}
        <Calendar
          key={currentKey.toISOString()}
          onDayPress={(day) => {onDayPress(day)}}
          theme = {calendarTheme}
          {...staticCalendarProps}

          // what to do when a day is selected
          markedDates={{
            [selectedDay]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: '#fc1d00',
              selectedTextColor: today == selectedDay ? '#f7c40c' : '#ffffff',
            }
          }}

        />
      </View>

      {/* --- Separator placed maybe temporarily ---*/}
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/*<EditScreenInfo path="/screens/CalendarScreen.tsx" />*/}

      {/* --- Events may be displayed here ---*/}
      <View style={styles.container}>
        <Button
          title="Return to Today"
          onPress={() => {
            setSelectedDay(today); 
            setCurrentKey(new Date()); 
          }}
        />
        <Text style={styles.selectedDayStyle}>{selectedDay}{" " + dbg}{" " + dataFetched}</Text>

        
      </View>
    </ScrollView>
  );
}