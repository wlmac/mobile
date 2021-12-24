import * as React from 'react';
import { useState, useEffect } from 'react';
import { Switch } from 'react-native';
import { StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';

// api link
const announcementURL = "https://maclyonsden.com/api/announcements?format=json";

export default function AnnouncementScreen() {
    // stores announcements
    const [announcements, setAnnouncements] = useState([]);

    // fetch from API
    useEffect(() => {
        const getAnnouncements = async() => {
            const fromAPI = await fetchAnnouncements();
            setAnnouncements(fromAPI);
        }
        getAnnouncements();
    }, []);

    // fetch announcements from API
    const fetchAnnouncements = async() => {
        const res = await fetch(announcementURL);
        const data = await res.json();
        return data;
    }

    // toggle between my feed and school feed
    const [isFilter, setFilter] = useState(false);
    const toggleSwitch = () => setFilter(isFilter => !isFilter);


    return (
        <View style={styles.container}>

            <ScrollView style={styles.scrollView}>
                {Object.entries(announcements).map(([key, ann]) => (
                    <Text key={ann.id}>{ann.author.slug} {ann.id} {key}</Text>
                ))}
            </ScrollView>





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
        marginTop: StatusBar.currentHeight || 0,
    },
    scrollView: {
        marginHorizontal: 0,
    },
    row: {
        flexDirection: "row", 
    },
    switch: {
        paddingHorizontal:8,
    },
});


