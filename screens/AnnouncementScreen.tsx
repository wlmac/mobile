import * as React from 'react';
import { useState, useEffect } from 'react';
import { Switch } from 'react-native';
import { StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';
import apiRequest from '../lib/apiRequest';
import Announcement from '../components/Announcement';

var total;
var myAnnouncements:Object[] = [];
var organizations: {[id: number]: string} = {};

export default function AnnouncementScreen() {
    // stores announcements
    const [announcements, setAnnouncements] = useState([]);
    const [myOrgs, setMyOrgs] = useState([]);

    // toggle between my feed and school feed
    const [isFilter, setFilter] = useState(true);
    const toggleSwitch = () => setFilter(isFilter => !isFilter);

    // announcements
    apiRequest('/api/announcements?format=json', '', 'GET').then((res) => {
        if(res.success){
            setAnnouncements(JSON.parse(res.response));
            total = announcements[0].id;
        }
    });

    // organizations
    apiRequest('/api/organizations?format=json', '', 'GET').then((res) => {
        if(res.success){
            JSON.parse(res.response).forEach((org:any) => {
                organizations[org.id] = org.name;
            });
        }
    });

    // my organizations
    apiRequest('/api/me?format=json', '', 'GET').then((res) => {
        if(res.success){
            setMyOrgs(JSON.parse(res.response));
        }
    });

    announcements.forEach((item:any) => {
        let orgId = item.organization.id;
        if (myOrgs.organizations.includes(organizations[orgId])) {
            myAnnouncements.push(item);
        }
    });



    return (
        <View style={styles.container}>

            <ScrollView id="all" style={isFilter ? styles.scrollView : {display: "none"}}>
                {Object.entries(announcements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann}></Announcement>
                ))}
            </ScrollView>

            <ScrollView id="my" style={!isFilter ? styles.scrollView : {display: "none"}}>
                {Object.entries(myAnnouncements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann}></Announcement>
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


// ----- STYLES -----
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
        marginVertical: 10,
        flexDirection: "row", 
    },
    switch: {
        paddingHorizontal:8,
    },
});


