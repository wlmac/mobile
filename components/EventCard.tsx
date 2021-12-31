import React from 'react';

import { StyleSheet, TouchableOpacity } from 'react-native';

import { View, Text } from './Themed';

// Event card
export function EventCard({ event } : { event: any }) {

  const color = event.tags.length == 0 ? '#74e1ed' : event.tags[0].color;

  // selected state
  const [selected, setSelected] = React.useState(false);

  return (
    <View style={styles.eventCardContainer}>
      
      <TouchableOpacity
        onPress={() => {setSelected(!selected)}}
      >

        <View style={styles.quickInfo}>
          {timeRange(event.start_date, event.end_date, color)}
          <View style={styles.info}>
            <Text style={styles.titleText}>{event.name}</Text>
            <Text style={styles.organizationText}>{event.organization.name}</Text>
            {/* display if selected is true*/}
            {selected && (
              <View style={styles.description}>
                <View style={styles.separator} />

                <View style={styles.description}>
                  <Text>{event.description.length == 0 ? 'No description' : event.description}</Text>
                </View>
              </View>
            )}
          </View>
        </View>
    
      </TouchableOpacity>

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
      <Text style={styles.timeRangeText}>{startHour}:{startDateTime[1]}{startIsMorning?" AM":" PM"}</Text>
      <Text style={[styles.timeRangeText, {fontSize: 10}, {color: '#383838'}]}>To</Text>
      <Text style={styles.timeRangeText}>{endDateYMD[0]}/{endDateYMD[1]}/{endDateYMD[2]}</Text>
      <Text style={styles.timeRangeText}>{endHour}:{endDateTime[1]}{endIsMorning?" AM":" PM"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  eventCardContainer: {
    alignContent: 'center',
    justifyContent: 'center',
    marginVertical: 7,
  },
  separator: {
    marginVertical: 6,
  },
  quickInfo: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  description: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  timeRange: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    padding: 10,
    width: '28%'
  },
  timeRangeText: {
    fontSize: 14,
    color: '#000000',
  },
  info: {
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    padding: 10,
    backgroundColor: '#2e2e2e',
    width: '68%',
  },
  titleText: {
    fontSize: 20,
    color: '#ffffff',
  },
  organizationText: {
    fontSize: 14,
    color: '#4287f5',
    fontStyle: 'italic',
  },
});
