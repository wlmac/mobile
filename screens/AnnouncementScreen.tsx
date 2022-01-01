import * as React from 'react';
import { useState, useEffect } from 'react';
import { Switch } from 'react-native';
import { StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';
import apiRequest from '../lib/apiRequest';
import Announcement from '../components/Announcement';

var total;
var myAnnouncements:Object[] = [];
var orgName: {[id: number]: string} = {};
var orgIcon: {[id: number]: string} = {};

export default function AnnouncementScreen() {
    // stores announcements
    const [announcements, setAnnouncements] = useState([]);
    const [myOrgs, setMyOrgs] = useState([]);

    // toggle between my feed and school feed
    const [isFilter, setFilter] = useState(false);
    const toggleSwitch = () => setFilter(isFilter => !isFilter);

    if (announcements.length == 0) {
        // announcements
        apiRequest('/api/announcements?format=json', '', 'GET').then((res) => {
            if(res.success){
                setAnnouncements(JSON.parse(res.response));
                total = announcements[0].id;
            }
        });
    }

    if (Object.keys(orgIcon).length == 0 || Object.keys(orgName).length == 0) {
        // organizations
        apiRequest('/api/organizations?format=json', '', 'GET').then((res) => {
            if(res.success){
                JSON.parse(res.response).forEach((org:any) => {
                    orgName[org.id] = org.name;
                    orgIcon[org.id] = org.icon;
                });
            }
        });
    }

    if (myOrgs.length == 0) {
        // my organizations
        apiRequest('/api/me?format=json', '', 'GET').then((res) => {
            if(res.success){
                setMyOrgs(JSON.parse(res.response));
            }
        });
    }
    
    if (myOrgs.length != 0 && announcements.length != 0) {
        announcements.forEach((item:any) => {
            let orgId = item.organization.id; // gets the organization id
            item.icon = orgIcon[orgId];
            item.name = orgName[orgId];
            if (myOrgs.organizations.includes(orgName[orgId])) { // checks against the user's organization list
                myAnnouncements.push(item);
            }
        });
        console.log(announcements);
    }




    return (
        <View style={styles.container}>

            <Text style={styles.header}>
                {isFilter ? "My Feed" : "School Feed"}
            </Text>

            {/* School Announcements */}
            <ScrollView style={!isFilter ? styles.scrollView : {display: "none"}}>
                {Object.entries(announcements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann}></Announcement>
                ))}
            </ScrollView>


            {/* My Feed Announcements */}
            <ScrollView style={isFilter ? styles.scrollView : {display: "none"}}>
                {Object.entries(myAnnouncements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann}></Announcement>
                ))}
            </ScrollView>


            {/* Filter Announcements */}
            <View style={styles.row}>
                <Text style={{color: isFilter ?"#b7b7b7ff" : "#434343ff", fontFamily: 'poppins', paddingHorizontal: 8
                }}>School </Text>
                <Switch style={styles.switch}
                    trackColor={{ false: "#b7b7b7ff", true: "#b7b7b7ff" }}
                    thumbColor={isFilter ? "#434343ff" : "#434343ff"}
                    onValueChange={toggleSwitch}
                    value={isFilter}
                />
                <Text style={{color: isFilter ?"#434343ff" : "#b7b7b7ff", fontFamily: 'poppins', paddingHorizontal:12 }}>My Feed</Text>
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
    header: {
        fontSize: 20,
        fontWeight: "bold",
        paddingVertical: 10,
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


