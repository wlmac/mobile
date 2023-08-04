import React, {useState, useEffect} from 'react';
import { Dimensions, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BottomTabParamList } from '../types';
import { Calendar } from 'react-native-calendars';

import { Text, View } from '../components/Themed';
import { EventCard } from '../components/EventCard';
import {ThemeContext} from '../hooks/useColorScheme';

import { EventDataHandler } from '../api';
import { SessionContext } from '../util/session';
import { MarkedDates } from 'react-native-calendars/src/types';

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

// calendar screen
export default function CalendarScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, 'Calendar'> }) {

  // session
  const session = React.useContext(SessionContext);

  // get theme
  const colorScheme = React.useContext(ThemeContext);

  // get today's date
  const today: YMDDate = dateToYMD();

  // states
  const [selectedDay, setSelectedDay] = useState(today);
  const [displayedDate, setDisplayedDate] = useState(today);
  const [currentKey, setCurrentKey] = useState(new Date());
  const [eventDays, setEventDays] = useState<YMDDate[]>([]);

  // use effect on component load
  useEffect (() => { (async () => {
    setSelectedDay(today);
    setDisplayedDate(today);
    // add every single event day to the set
    let tempEventDays = new Set<YMDDate>();
    
    for await (const event of EventDataHandler.list(session, 5000)) {
      let startDate: Date = event.start_date;
      let endDate: Date = event.end_date;

      // iterate through all days between start and end dates
      while(startDate <= endDate) {
        tempEventDays.add(YMDDate.fromDate(startDate));
        startDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
      }
    }
    // convert set to array, and set as eventDays
    setEventDays(Array.from(tempEventDays));
  })() }, []);


  // use effect on color scheme change
  useEffect (() => {
    setCurrentKey(new Date());
  }, [colorScheme.scheme]);

  function getEventsOnDay(day: YMDDate) {
    const date = day.toDate();

    let tempEventsToday = [];
    for (const event of EventDataHandler.listCached()) {
      const startDate: Date = event.start_date;
      const endDate: Date = event.end_date;
      // startDate is before or on selected day and endDate is after or on selected day add to tempEventsToday (use the compare method)
      if (startDate <= date && endDate >= date) {
        tempEventsToday.push(event);
      }
    }
    return tempEventsToday;
  }

  const eventsToday = getEventsOnDay(selectedDay);

  return (
    <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}]}>
      <ScrollView>
        
        {/* --- Calendar wrapper ---*/}
        <View style={styles.calendar}>

          {/* --- Calendar component ---*/}
          <Calendar
            key={currentKey.toISOString()}
            theme = {
              {
                backgroundColor: colorScheme.scheme === 'dark' ? '#000' : '#fff',
                calendarBackground: colorScheme.scheme === 'dark' ? '#161616' : '#f0f0f0',
              
                textSectionTitleColor: colorScheme.scheme === 'dark' ? '#fff' : '#000',
                textSectionTitleDisabledColor: colorScheme.scheme === 'dark' ? '#4a4a4a' : '#b8b8b8',
              
                todayTextColor: colorScheme.scheme === 'dark' ? '#d1a700' : '#d49a13',
                dayTextColor: colorScheme.scheme === 'dark' ? '#fff' : '#000',
              
                textDisabledColor: colorScheme.scheme === 'dark' ? '#4a4a4a' : '#b8b8b8',
              
                dotColor: '#00adf5',
                selectedDotColor: '#fff',
              
                arrowColor: colorScheme.scheme === 'dark' ? '#fff' : '#0a2945',
                disabledArrowColor: '#4a4a4a',
              
                monthTextColor: colorScheme.scheme === 'dark' ? '#348feb' : '#105fb0',
                textMonthFontWeight: 'bold',
                textMonthFontSize: 16,

                textDayHeaderFontWeight: 'bold',
              }
            }
            {...staticCalendarProps}
            
            // set selected day to whatever is selected
            onDayPress={(day) => {
              setSelectedDay(new YMDDate(day.year, day.month, day.day));
            }}
            
            // mark event days, selected day, and today's date
            markedDates={{

              [selectedDay.toString()]: {
                selected: true,
                disableTouchEvent: true,
                selectedColor: '#105fb0',
                selectedTextColor: selectedDay.equals(today) ? '#f7c40c' : '#fff',
              },  

              ...eventDays.reduce<MarkedDates>((obj, eventDay) => {
                obj[eventDay.toString()] = {
                  marked: true,
                  dotColor: '#6e9bc4',
                  selected: selectedDay.equals(eventDay),
                  disableTouchEvent: selectedDay.equals(eventDay),
                  selectedColor: '#105fb0',
                  selectedTextColor: selectedDay.equals(today) ? '#f7c40c' : '#fff',
                };
                return obj;
              }, {}),
            }}

            // arrow change left
            onPressArrowLeft={(subtractMonth) => {
              setDisplayedDate(displayedDate.addMonths(-1));
              subtractMonth();
            }}

            // arrow change right
            onPressArrowRight={(addMonth) => {
              setDisplayedDate(displayedDate.addMonths(1));
              addMonth();
            }}
          />
        </View>
        
        <View style={{backgroundColor: colorScheme.scheme === 'dark' ? '#1c1c1c' : '#e6e6e6', height: 10}}></View>
        
        {/* --- Return to today button, disabled when selected day or displayed month isn't on the month ---*/}
        <View style={[styles.returnToToday, {backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}]}>
          <TouchableOpacity
            disabled={displayedDate.equals(today)}
            onPress={() => {
              setSelectedDay(today); 
              setCurrentKey(new Date());
              setDisplayedDate(today);
            }}
          >
            <Text style={[styles.returnToTodayText, 
              {color: colorScheme.scheme === 'light'
              ? 
              displayedDate.equals(today) ? '#b3b3b3' : '#000'
              : 
              displayedDate.equals(today) ? '#4a4a4a' : '#fff'
              }]}>
                Return to Today
              </Text>
          </TouchableOpacity>
        </View> 

        <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}]}>
        <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
        </View>
        
        {/* --- Event list title ---*/}
        <View style={[styles.eventsTitle, {backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}]}>
          
          {
            EventDataHandler.errored()
          ? 
          <Text style={[styles.eventsCountText, {color: '#ff0000'}]}>Error Fetching Data</Text> 
          : 

          // events today
          <View style={{backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}}>
            <Text style={[styles.dateText, {color: colorScheme.scheme === 'light' ? '#000' : '#fff'}]}>
              {selectedDay.toDate().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              })}
            </Text>
            {
              eventsToday.length === 0
              ?
              // if there's no events, display `no events`
              <Text style={[styles.eventsCountText, {color: colorScheme.scheme === 'light' ? '#000' : '#fff'}]}>No events on this day</Text>
              :
              // lists events
              <View style={[styles.eventCardsContainer, {backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}]}>
                {Object.entries(eventsToday).map(([key, event]) => (
                  // reset key (resets component)
                  <EventCard key={key+new Date().toISOString()} event={event} />
                ))}
              </View>
            }
          </View>
          }

        </View>

        <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'dark' ? '#252525' : '#e0e0e0'}]}>
          <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
        </View>

      </ScrollView>
    </View>
  );
}

// function that turns an ISO date to YYYY-MM-DD form
function dateToYMD(): YMDDate {
  return YMDDate.fromDate(new Date());
}

// date class, but only year month and day
export class YMDDate {
  year: number;
  month: number;
  day: number;

  constructor(year: number, month: number, day: number) {
    this.year = year;
    this.month = month;
    this.day = day;
  }

  static fromDate(date: Date): YMDDate {
    return new YMDDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  }

  toString(): string {
    return `${this.year}-${this.month.toString().padStart(2, '0')}-${this.day.toString().padStart(2, '0')}`;
  }

  equals(that: YMDDate): boolean {
    return this.year === that.year && this.month === that.month && this.day === that.day;
  }

  toDate(): Date {
    return new Date(this.year, this.month-1, this.day);
  }


  addMonths(months: number): YMDDate {
    this.month += months;
    if(this.month > 12) {
      this.month -= 12;
      this.year++;
    }else if(this.month < 1) {
      this.month += 12;
      this.year--;
    }
    return this;
  }
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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