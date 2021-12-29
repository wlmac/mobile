import React, {useState, Fragment, useCallback, useEffect} from 'react';
import { Button, Dimensions, StyleSheet, ScrollView } from 'react-native';

import { Calendar, CalendarList, CalendarProps, Agenda } from 'react-native-calendars';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

import apiRequest from '../lib/apiRequest';
import config from '../config.json';
import { HideableView } from '../components/HideableView';

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
};

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
  let today: YMDDate = new YMDDate(new Date().toISOString().split('T')[0]);

  // selected date state
  const [selectedDay, setSelectedDay] = useState(today);

  // displayed date state
  const [displayedDate, setDisplayedDate] = useState(today);
  
  // current key state
  const [currentKey, setCurrentKey] = useState(new Date());

  // data fetched state
  const [data, setData] = useState(undefined as any);

  // events this month state
  const [eventsThisMonth, setEventsThisMonth] = useState([] as any[]);

  // events today state
  const [eventsToday, setEventsToday] = useState([] as any[]);


  // fetch events from API if not fetched yet
  if (data === undefined) {
    apiRequest(`/api/events?start=2021-09-20`, '', 'GET').then(res => {
      //console.log("fetching events...");
      if (res.success) {
        //console.log("success");
        setData(JSON.parse(res.response));
        // triggers re-render
        setSelectedDay(today);
      }
      else {
        console.log(res.response);
      }
    })
  }

  // update events on day change using useeffect
  useEffect(() => {
    // maybe we should set this to 'loading data' if it's undefined
    if (data === undefined) {
      setEventsToday([]);
    } else {
      let tempEventsToday: any = [];
      for (let i = 0; i < data.length; i++) {
        let event: any = data[i];
        let startDate: YMDDate = new YMDDate(event.start_date.split('T')[0]);
        let endDate: YMDDate = new YMDDate(event.end_date.split('T')[0]);
        // startDate is before or on selected day and endDate is after or on selected day add to tempEventsToday (use the compare method)
        if (startDate.compareDays(selectedDay) <= 0 && endDate.compareDays(selectedDay) >= 0) {
          tempEventsToday.push(event);
        }
      }
      setEventsToday(tempEventsToday);
    }
  }, [selectedDay]);

  // update events on month change using useeffect
  useEffect(() => {
    // maybe we should set this to 'loading data' if it's undefined
    if (data === undefined) {
      setEventsToday([]);
    } else {
      let tempEventsThisMonth: any = [];
      for (let i = 0; i < data.length; i++) {
        let event: any = data[i];
        let startDate: YMDDate = new YMDDate(event.start_date.split('T')[0]);
        let endDate: YMDDate = new YMDDate(event.end_date.split('T')[0]);
        // startDate is before or on displayed month and endDate is after or on selected month add to tempEventsToday (use the compare method)
        if (startDate.compareMonths(displayedDate) <= 0 && endDate.compareMonths(displayedDate) >= 0) {
          tempEventsThisMonth.push(event);
        }
      }
      setEventsThisMonth(tempEventsThisMonth);
    }
  }, [displayedDate]);

  return (
    // scrollview tentatively, will change potentially
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* --- Calendar wrapper ---*/}
      <View style={styles.calendar}>

        {/* --- Calendar component ---*/}
        <Calendar
          key={currentKey.toISOString()}
          theme = {calendarTheme}
          {...staticCalendarProps}

          onDayPress={(day) => {
            setSelectedDay(new YMDDate(day.dateString as string));
          }}
          
          

          // what to do when a day is selected
          markedDates={{
            [selectedDay.strform]: {
              selected: true,
              disableTouchEvent: true,
              selectedColor: '#fc1d00',
              selectedTextColor: today.strform == selectedDay.strform ? '#f7c40c' : '#ffffff',
            }

            // TODO: add event markers on dates (dots, etc)

          }}

          // arrow change left
          onPressArrowLeft={(substractMonth) => {
            // change displayed date
            let newYear: number = displayedDate.year;
            let newMonth: number = displayedDate.month - 1;
            let newDay = displayedDate.day; // this is not used
            if (newMonth < 1) {
              newMonth = 12;
              newYear--;
            }
            setDisplayedDate(new YMDDate(`${newYear}-${newMonth}-${newDay}`));
            substractMonth();
          }}

          // arrow change right
          onPressArrowRight={(addMonth) => {
            // change displayed date
            let newYear: number = displayedDate.year;
            let newMonth: number = displayedDate.month + 1;
            let newDay = displayedDate.day; // this is not used
            if (newMonth > 12) {
              newMonth = 1;
              newYear++;
            }
            setDisplayedDate(new YMDDate(`${newYear}-${newMonth}-${newDay}`));
            addMonth();
          }}
        />
      </View>

      {/* --- Separator placed maybe temporarily ---*/}
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/*<EditScreenInfo path="/screens/CalendarScreen.tsx" />*/}


      <View style={styles.container}>
        <Button
          title="Return to Today"
          onPress={() => {
            setSelectedDay(today); 
            setCurrentKey(new Date());
            setDisplayedDate(today);
          }}
         />
        <Text style={styles.selectedDayStyle}>{selectedDay.strform}{`${displayedDate.year}-${displayedDate.month} `}{eventsToday.length}{" " + eventsThisMonth.length}</Text> 

        {/* --- If no events, display `no events`, otherwise display a list of the event's titles using map ---*/}
        {eventsToday.length == 0 ? <Text>No events</Text> : <Text>Yes events</Text>}

      </View>

    </ScrollView>
  );
}

// date class, but only year month and day
class YMDDate {
  year: number;
  month: number;
  day: number;

  strform: string;

  // constructor that takes in string in YYYY-MM-DD format
  constructor(dateString: string) {
    // split by -
    this.strform = dateString;
    let dateArray = dateString.split('-');
    this.year = parseInt(dateArray[0]);
    this.month = parseInt(dateArray[1]);
    this.day = parseInt(dateArray[2]);
  }

  // compare two dates, date specific
  // returns -1 if this is before date, 0 if equal, 1 if after
  compareDays(date: YMDDate): number {
    if (this.year < date.year) return -1;
    else if (this.year > date.year) return 1;
    else {
      if (this.month < date.month) return -1;
      else if (this.month > date.month) return 1;
      else {
        if (this.day < date.day) return -1;
        else if (this.day > date.day) return 1;
        else return 0;
      }
    }
  }
  
  // compare two dates, month specific
  compareMonths(date: YMDDate): number {
    if (this.year < date.year) return -1;
    else if (this.year > date.year) return 1;
    else {
      if (this.month < date.month) return -1;
      else if (this.month > date.month) return 1;
      else return 0;
    }
  }
}
