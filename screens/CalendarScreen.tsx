import React, {useState, useEffect} from 'react';
import { Button, Dimensions, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

import { Calendar } from 'react-native-calendars';

import { Text, View } from '../components/Themed';
import { EventCard } from '../components/EventCard';
import useColorScheme from '../hooks/useColorScheme';

import AsyncStorage from '@react-native-async-storage/async-storage';

const windowWidth = Dimensions.get('window').width;

// calendar settings that should not change
const staticCalendarProps = {
  showSixWeeks: true,
  disableMonthChange: true,
};

// month names
const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

// day names
const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// required to calculate date difference
const daysInMonth = [-1, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// dark or light mode
let appTheme: string;

// calendar screen
export default function CalendarScreen() {

  // get theme
  appTheme = useColorScheme();

  // get today's date
  const today: YMDDate = dateToYMD();

  // states
  const [selectedDay, setSelectedDay] = useState(today);
  const [displayedDate, setDisplayedDate] = useState(today);
  const [currentKey, setCurrentKey] = useState(new Date());
  const [data, setData] = useState(undefined as any);
  const [eventDays, setEventDays] = useState([] as any[]);
  const [eventsToday, setEventsToday] = useState([] as any[]);

  // use effect on component load
  useEffect (() => {
    // load from AsyncStorage
    AsyncStorage.getItem("@events").then((events: any) => {
      if (events) {
        setData(JSON.parse(events)); // set data
      }
    }).catch((err) => {
      console.log("Async storage error: " + err);
      setData(null); // set data to null if error, this will show up as an error on the frontend
    });
  }, []);


  // use effect on data change
  useEffect (() => {
    setSelectedDay(today);
    setDisplayedDate(today);
    // add every single event day to the set
    if (data) {
      let tempEventDays = new Set<string>();
      for (let i = 0; i < data.length; i++) {
        let event: any = data[i];
        let startDate: YMDDate = new YMDDate(event.start_date.split('T')[0]);
        let endDate: YMDDate = new YMDDate(event.end_date.split('T')[0]);

        let currentYear: number = startDate.year;
        let currentMonth: number = startDate.month;
        let currentDay: number = startDate.day;
        
        // number of days between start and end dates
        let daysBetween: number = endDate.dayDifference(startDate);
        
        // iterate through all days between start and end dates
        for (let j = 1; j <= daysBetween; j++) {
          // add to set (formatting is funny because they need the 0 for single digits)
          tempEventDays.add(`${currentYear}-${currentMonth < 10 ? '0'+currentMonth : currentMonth}-${currentDay < 10 ? '0'+currentDay : currentDay}`);
          currentDay++;
          if (currentDay > daysInMonth[currentMonth]) {
            currentDay = 1;
            currentMonth++;
            if (currentMonth > 12) {
              currentMonth = 1;
              currentYear++;
            }
          }
        }
      }
      // convert set to array, and set as eventDays
      setEventDays(Array.from(tempEventDays));
    }
  }, [data]);


  // use effect on color scheme change
  useEffect (() => {
    setCurrentKey(new Date());
  }, [appTheme]);

  // update events on day change using useeffect
  useEffect(() => {
    if (data) {
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
    } else {
      setEventsToday([]);
    }
  }, [selectedDay]);

  return (
    <View style={styles.container}>
      <ScrollView>
        
        {/* --- Calendar wrapper ---*/}
        <View style={styles.calendar}>

          {/* --- Calendar component ---*/}
          <Calendar
            key={currentKey.toISOString()}
            theme = {
              {
                backgroundColor: appTheme === 'dark' ? '#000' : '#fff',
                calendarBackground: appTheme === 'dark' ? '#141414' : '#fafafa',
              
                textSectionTitleColor: appTheme === 'dark' ? '#fff' : '#000',
                textSectionTitleDisabledColor: appTheme === 'dark' ? '#4a4a4a' : '#b8b8b8',
              
                todayTextColor: appTheme === 'dark' ? '#d1a700' : '#d49a13',
                dayTextColor: appTheme === 'dark' ? '#fff' : '#000',
              
                textDisabledColor: appTheme === 'dark' ? '#4a4a4a' : '#b8b8b8',
              
                dotColor: '#00adf5',
                selectedDotColor: '#fff',
              
                arrowColor: appTheme === 'dark' ? '#fff' : '#0a2945',
                disabledArrowColor: '#4a4a4a',
              
                monthTextColor: appTheme === 'dark' ? '#348feb' : '#105fb0',
                textMonthFontWeight: 'bold',
                textMonthFontSize: 16,

                textDayHeaderFontWeight: 'bold',
              }
            }
            {...staticCalendarProps}
            
            // set selected day to whatever is selected
            onDayPress={(day) => {
              setSelectedDay(new YMDDate(day.dateString as string));
            }}
            
            // mark event days, selected day, and today's date
            markedDates={{
              [selectedDay.strform]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: '#105fb0',
                selectedTextColor: today.strform == selectedDay.strform ? '#f7c40c' : '#fff',
              },

              ...eventDays.reduce((obj, eventDay) => {
                obj[eventDay] = {
                  marked: true,
                  dotColor: '#6e9bc4',
                  selected: selectedDay.strform === eventDay,
                  disableTouchEvent: selectedDay.strform === eventDay,
                  selectedColor: '#105fb0',
                  selectedTextColor: today.strform == selectedDay.strform ? '#f7c40c' : '#fff',
                };
                return obj;
              }, {}),
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
              setDisplayedDate(new YMDDate(`${newYear}-${newMonth < 10 ? '0' + newMonth : newMonth}-${newDay < 10 ? '0' + newDay : newDay}`));
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
              setDisplayedDate(new YMDDate(`${newYear}-${newMonth < 10 ? '0' + newMonth : newMonth}-${newDay < 10 ? '0' + newDay : newDay}`));
              addMonth();
            }}
          />
        </View>
        
        <View style={{backgroundColor: appTheme === 'dark' ? '#0c0c0c' : '#fdfdfd', height: 5}}></View>
        
        {/* --- Return to today button, disabled when selected day or displayed month isn't on the month ---*/}
        <View style={styles.returnToToday}>
          <TouchableOpacity
            disabled={displayedDate.strform == today.strform}
            onPress={() => {
              setSelectedDay(today); 
              setCurrentKey(new Date());
              setDisplayedDate(today);
            }}
          >
            <Text style={[styles.returnToTodayText, 
              {color: appTheme === 'light'
              ? 
              displayedDate.strform == today.strform ? '#b3b3b3' : '#000'
              : 
              displayedDate.strform == today.strform ? '#4a4a4a' : '#fff'
              }]}>
                Return to Today
              </Text>
          </TouchableOpacity>
        </View> 

        <View style={styles.container}>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </View>
        
        {/* --- Event list title ---*/}
        <View style={styles.eventsTitle}>
          
          {
          // if the data is null, there is an error
          data === null
          ? 
          <Text style={[styles.eventsCountText, {color: '#ff0000'}]}>Error Fetching Data</Text> 
          : 

          // events today
          <View>
            <Text style={[styles.dateText, {color: appTheme === 'light' ? '#000' : '#fff'}]}>
              {YMDToLong(selectedDay)}
            </Text>
            {
              eventsToday.length === 0
              ?
              // if there's no events, display `no events`
              <Text style={[styles.eventsCountText, {color: appTheme === 'light' ? '#000' : '#fff'}]}>No events on this day{appTheme}</Text>
              :
              // lists events
              <View style={styles.eventCardsContainer}>
                {Object.entries(eventsToday).map(([key, event]) => (
                  // reset key (resets component)
                  <EventCard key={key+new Date().toISOString()} event={event} />
                ))}
              </View>
            }
          </View>
          }

        </View>

        <View style={styles.container}>
          <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
        </View>

      </ScrollView>
    </View>
  );
}

// function that turns an ISO date to YYYY-MM-DD form
function dateToYMD(): YMDDate {
  let date = new Date();
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();
  return new YMDDate(`${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`);
}

// function that turns a YMD to long form: [day name], [month] [day], [year]
function YMDToLong(ymd: YMDDate): string {
  let date = new Date(ymd.year, ymd.month-1, ymd.day);
  return `${dayNames[date.getDay()]}, ${monthNames[ymd.month-1]} ${ymd.day}, ${ymd.year}`;
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

  // get the number of days between two dates, inclusive
  dayDifference(date: YMDDate): number {
    let millisecondsPerDay = 1000 * 60 * 60 * 24;
    let thisDate = new Date(this.year, this.month-1, this.day);
    let dateDate = new Date(date.year, date.month-1, date.day);
    return Math.round((thisDate.getTime() - dateDate.getTime()) / millisecondsPerDay) + 1;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  separator: {
    marginVertical: '4%',
    height: 1,
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  calendar: {
    width: windowWidth,
  },

  selectedDayStyle: {
    justifyContent: 'center',
    color: 'white',
  },

  returnToToday: {
    marginTop: '3%',
    alignItems: 'flex-end',
    width: '95%',
  },

  returnToTodayText: {
    fontSize: 16,
    textAlign: 'right',
    marginHorizontal: '2%',
  },

  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'left',
    marginVertical: '3%',
  },

  eventsCountText: {
    fontSize: 16,
    textAlign: 'left',
    marginVertical: '3%',
  },

  eventsTitle: {
    marginLeft: '5%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },

  eventCardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent:'space-between',
    marginTop: '2%',
  },
});