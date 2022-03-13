import React from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';

import { View, Text } from './Themed';
import { Ionicons } from '@expo/vector-icons';

import useColorScheme from '../hooks/useColorScheme';

let theme;

// Event card
export function EventCard({ event } : { event: any }) {

  theme = useColorScheme();

  const color = event.tags.length == 0 ? '#74e1ed' : event.tags[0].color;

  // selected state
  const [selected, setSelected] = React.useState(false);


  return (
    <View style={[styles.eventCardContainer, {backgroundColor: theme === 'dark' ? '#252525' : '#e0e0e0'}]}>
      <TouchableOpacity
        onPress={() => {setSelected(!selected)}}
      >

        <View style={[styles.quickInfo, {backgroundColor: 'transparent'}]}>
          {timeRange(event.start_date, event.end_date, color)}
          <View style={[styles.info, {backgroundColor: theme === 'light' ? '#f3f3f3' : '#1c1c1c'}]}>
            <Text style={[styles.titleText, {color: theme === 'light' ? '#404040' : '#fff'}]}>{event.name}</Text>
            <Text style={styles.organizationText}>{event.organization.name}</Text>
            {/* display if selected is true*/}
            {selected && (
              <View style={styles.description}>
                <View style={styles.separator} />
                <View style={styles.description}>
                  <Text style={{color: theme === 'light' ? '#4f4f4f' : '#fff'}}>{event.description.length == 0 ? 'No description' : event.description}</Text>
                </View>
              </View>
            )}
            {/* deal with tags*/}
            <View style={styles.separator} />
            {event.tags.length > 0 && (
              <View style={styles.tags}>
                {Object.entries(event.tags).map(([key, tag]) => (
                  <Tag key={key} tag={tag}/>
                ))}
              </View>
            )}
            <View style={styles.separator} />
            {/* caret to signify expanding of the description of an event*/}
            {selected && (
              <View style={styles.caret}>
                <Ionicons name="chevron-up" size={20} color={theme === 'light' ? '#000' : '#fff'} />
              </View>
            )}
            {!selected && (
              <View style={styles.caret}>
                <Ionicons name="chevron-down" size={20} color={theme === 'light' ? '#000' : '#fff'} />
              </View>
            )}
          </View>
          
        </View>
      </TouchableOpacity>
    </View>
  );
}

export function Tag({tag} : {tag: any}) {
  return (
    <View style={[styles.tag, {backgroundColor: tag.color}]}>
    <Text style={styles.tagText}>{tag.name}</Text>
    </View>
  );
}

function timeRange(startDate: string, endDate: string, color: string) {
  
  const startDateSplit: string[] = startDate.split('T');
  const endDateSplit: string[] = endDate.split('T');

  const startDateYMD: string[] = startDateSplit[0].split('-');
  const endDateYMD: string[] = endDateSplit[0].split('-');

  const startDateTime: string[] = startDateSplit[1].split(':');
  const endDateTime: string[] = endDateSplit[1].split(':');

  const startIsMorning: boolean = parseInt(startDateTime[0]) < 12;
  const endIsMorning: boolean = parseInt(endDateTime[0]) < 12;

  let startHour: number = parseInt(startDateTime[0]);
  if (!startIsMorning) startHour -= 12;
  if (startHour === 0) startHour = 12;

  let endHour: number = parseInt(endDateTime[0]);
  if (!endIsMorning) endHour -= 12;
  if (endHour === 0) endHour = 12;

  return (
    <View style={[styles.timeRange, {backgroundColor: color}]}>
      <Text style={styles.timeRangeText}>{startDateYMD[0]}/{startDateYMD[1]}/{startDateYMD[2]}</Text>
      {
        !(startHour == 12 && startDateTime[1] == "00" && startIsMorning && endHour == 11 && endDateTime[1] == "59" && !endIsMorning) && 
        <Text style={styles.timeRangeText}>{startHour}:{startDateTime[1]}{startIsMorning?" AM":" PM"}</Text>
      }
      <Text style={[styles.timeRangeText, {fontSize: 11}, {color: '#383838'}]}>to</Text>
      <Text style={styles.timeRangeText}>{endDateYMD[0]}/{endDateYMD[1]}/{endDateYMD[2]}</Text>
      {
        !(startHour == 12 && startDateTime[1] == "00" && startIsMorning && endHour == 11 && endDateTime[1] == "59" && !endIsMorning) &&
        <Text style={styles.timeRangeText}>{endHour}:{endDateTime[1]}{endIsMorning?" AM":" PM"}</Text>
      }
    </View>
  );
}

const styles = StyleSheet.create({
  eventCardContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    marginVertical: '2%',
  },
  separator: {
    marginVertical: 6,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  description: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeRange: {
    justifyContent: 'center',
    alignItems: 'flex-end',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    padding: 10,
    width: 101,
    
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.4,
  },
  timeRangeText: {
    fontSize: 14,
    color: '#404040',
  },
  info: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    padding: 10,
    width: 236,

    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.4,
  },
  titleText: {
    fontSize: 20,
  },
  organizationText: {
    fontSize: 14,
    color: '#4287f5',
    fontStyle: 'italic',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tag: {
    padding: '2%',
    margin: '1.5%',
    borderRadius: 5,
  },
  tagText: {
    fontSize: 12,
    color: '#525252',
  },
  caret: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    flexWrap: 'wrap',
  }
});
