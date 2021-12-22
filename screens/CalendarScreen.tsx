import * as React from 'react';
import { Dimensions, StyleSheet } from 'react-native';

import { Calendar, CalendarList, Agenda } from 'react-native-calendars';

import EditScreenInfo from '../components/EditScreenInfo';
import { Text, View } from '../components/Themed';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {

    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    margin: windowHeight/25,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  calendar: {
    
    height: windowHeight * 0.55,
    width: windowWidth,
    backgroundColor: 'transparent',

    borderWidth: 5,
    borderColor: 'black',
    
    

    
  },
});

const calendarParams = {
  showSixWeeks: true,
}

// calendar theme
const theme = {
    
};


export default function CalendarScreen() {

  return (
    <View style={styles.container}>
      {/*<Text style={styles.title}>Calendar</Text>*/}
      <Calendar 
  
        style={styles.calendar}
        theme={theme}
        {...calendarParams} 
        
      />
      <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
      {/*<EditScreenInfo path="/screens/CalendarScreen.tsx" />*/}
    </View>
  );
}


