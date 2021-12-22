import React, {useState, Fragment, useCallback} from 'react';
import { Dimensions, StyleSheet, ScrollView } from 'react-native';

import { Calendar, CalendarList, CalendarProps, Agenda } from 'react-native-calendars';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

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

  // selected date state
  const [selectedDay, setSelectedDay] = useState(today);

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
        <Text style={styles.selectedDayStyle}>{selectedDay}</Text>
      </View>
    </ScrollView>
  );
}