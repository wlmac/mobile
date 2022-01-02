import * as React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Switch, useColorScheme } from 'react-native';
import { StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';
import apiRequest from '../lib/apiRequest';
import Announcement from '../components/Announcement';
import FullAnnouncement from '../components/FullAnnouncement';


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

    // toggle between scroll feed and full announcement feed
    const [fullAnnId, setAnnId] = useState("-1");
    function setFullAnnId(id: string) {
        setAnnId(id);
        myA?.current?.scrollTo({x: 0, y: 0, animated: false});
    }

    // scrollview reset to top on switch toggle
    const allA = React.useRef<ScrollView>(null);
    const myA = React.useRef<ScrollView>(null);
    const fullA = React.useRef<ScrollView>(null);

    if (announcements.length == 0) {
        // announcements
        apiRequest('/api/announcements?format=json', '', 'GET').then((res) => {
            if(res.success){
                setAnnouncements(JSON.parse(res.response));
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
    }





    return (
        <View style={styles.container}>

            <Text style={fullAnnId == "-1" ? styles.header : {display: "none"}}>
                {isFilter ? "My Feed" : "School Feed"}
            </Text>

            {/* School Announcements */}
            <ScrollView ref={allA} style={!isFilter && fullAnnId == "-1" ? styles.scrollView : {display: "none"}}>
                {Object.entries(announcements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann} fullAnn={setFullAnnId}></Announcement>
                ))}
            </ScrollView>

            {/* My Feed Announcement */}
            <ScrollView ref={myA} style={isFilter && fullAnnId == "-1" ? styles.scrollView : {display: "none"}}>
                {Object.entries(myAnnouncements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann} fullAnn={setFullAnnId}></Announcement>
                ))}
            </ScrollView>

            {/* Full Announcement */}
            <ScrollView ref={myA} style={fullAnnId != "-1" ? styles.scrollView : {display: "none"}}>
                <FullAnnouncement ann={announcements.find((e: any) => e.id == fullAnnId)} backToScroll={setFullAnnId}></FullAnnouncement>
            </ScrollView>

            {/* Filter Announcements */}
            <View style={fullAnnId == "-1" ? styles.row : {display: "none"}}>
                <Text style={{color: isFilter ?(useColorScheme() === "dark" ? "#434343ff" : "#b7b7b7ff") : (useColorScheme() === "light" ? "#434343ff" : "#b7b7b7ff"), fontFamily: 'poppins', paddingHorizontal: 8
                }}>School </Text>
                <Switch style={styles.switch}
                    trackColor={{ false: "#b7b7b7ff", true: "#b7b7b7ff" }}
                    thumbColor={isFilter ? "#434343ff" : "#434343ff"}
                    onValueChange={() => {
                        toggleSwitch();
                        allA?.current?.scrollTo({x: 0, y: 0, animated: false});
                        myA?.current?.scrollTo({x: 0, y: 0, animated: false});
                    }}
                    value={isFilter}
                />
                <Text style={{color: isFilter ?(useColorScheme() === "light" ? "#434343ff" : "#b7b7b7ff") : (useColorScheme() === "dark" ? "#434343ff" : "#b7b7b7ff"), fontFamily: 'poppins', paddingHorizontal:12 }}>My Feed</Text>
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


