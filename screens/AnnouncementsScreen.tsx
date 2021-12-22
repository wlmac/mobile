import * as React from 'react';
import { useState } from 'react';
import { Switch } from 'react-native';
import { StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';

export default function AnnouncementsScreen() {
    // toggle between my feed and school feed
    const [isFilter, setFilter] = useState(false);
    const toggleSwitch = () => setFilter(isFilter => !isFilter);


    return (
        <View style={styles.container}>

            {/* Filter Announcements */}
            <View style={styles.row}>
                <Text style={{color: isFilter ?"#b7b7b7ff" : "#434343ff", fontFamily: 'poppins', paddingHorizontal: 8
                }}>My Feed</Text>
                <Switch style={styles.switch}
                    trackColor={{ false: "#b7b7b7ff", true: "#b7b7b7ff" }}
                    thumbColor={isFilter ? "#434343ff" : "#434343ff"}
                    onValueChange={toggleSwitch}
                    value={isFilter}
                />
                <Text style={{color: isFilter ?"#434343ff" : "#b7b7b7ff", fontFamily: 'poppins', paddingHorizontal:12 }}>School </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
    flex: 1,
    flexDirection: "column",
    alignItems: 'center',
    justifyContent: 'center',
    },
    row: {
    flexDirection: "row", 
    },
    switch: {
    paddingHorizontal:8,
    },
});


