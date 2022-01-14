import * as React from 'react';
import { useState, useEffect } from 'react';
import { Switch, useColorScheme } from 'react-native';
import { StyleSheet, StatusBar, ScrollView, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import Announcement from '../components/Announcement';
import FullAnnouncement from '../components/FullAnnouncement';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AnnouncementScreen() {
    // stores announcements
    const [announcements, setAnnouncements] = useState([]);
    const [myAnnouncements, setMyAnnouncements] = useState([]);
    
    // loading
    const [isLoading, toggleLoading] = useState(true);
    const loadingIcon = require('../assets/images/loading.gif');

    // toggle between my feed and school feed
    const [isFilter, setFilter] = useState(false);
    const toggleSwitch = () => setFilter(isFilter => !isFilter);

    // toggle between scroll feed and full announcement feed
    const [fullAnnId, setAnnId] = useState("-1");
    function setFullAnnId(id: string) {
        setAnnId(id);
        fullA?.current?.scrollTo({x: 0, y: 0, animated: false});
    }

    // scrollview reset to top on switch toggle
    const allA = React.useRef<ScrollView>(null);
    const myA = React.useRef<ScrollView>(null);
    const fullA = React.useRef<ScrollView>(null);

    const readData = async() => {
        await AsyncStorage.getItem("@announcements").then((res:any) => {
            setAnnouncements(JSON.parse(res));
        });
        await AsyncStorage.getItem("@myann").then((res:any) => {
            setMyAnnouncements(JSON.parse(res));
        });
        toggleLoading(false);
    }
    
    // fetch data from API
    useEffect(() => {
        readData();
    }, []);
    
    return (
        <>
        {/* Loading Icon */}
        <View style={isLoading ? styles.container : {display: "none"}}>
            <Image style={styles.loading} source={loadingIcon}/>
        </View>

        {/* After Everything is Loaded */}
        <View style={!isLoading ? styles.container : {display: "none"}}>
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
            <ScrollView ref={fullA} style={fullAnnId != "-1" ? styles.scrollView : {display: "none"}}>
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
        </>
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
    loading: {
        width: 40,
        height: 40,
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

