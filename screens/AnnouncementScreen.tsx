import * as React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, StatusBar, ScrollView, Image, Switch, Platform } from 'react-native';
import { Text, View } from '../components/Themed';
import Announcement from '../components/Announcement';
import FullAnnouncement from '../components/FullAnnouncement';
import * as WebBrowser from 'expo-web-browser';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

import { ThemeContext } from '../hooks/useColorScheme';
import { GuestModeContext } from '../hooks/useGuestMode';
import apiRequest from '../lib/apiRequest';
import config from '../config.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabParamList } from '../types';

export default function AnnouncementScreen({ navigation }: { navigation: BottomTabNavigationProp<BottomTabParamList, 'Announcements'> }) {
    // get color scheme
    let colorScheme = React.useContext(ThemeContext);
    const guestMode = React.useContext(GuestModeContext);
    const loadNum = 5; // # announcements to load at a time

    const emptyOrgs: {name: string, icon: string}[] = [];

    // stores announcements
    const [announcements, setAnnouncements] = useState([]);
    const [myAnnouncements, setMyAnnouncements] = useState([]);
    const [orgs, setOrgs] = useState(emptyOrgs);

    const addOrgs = (id: number, name: string, icon: string) => {
        let tmp = orgs;
        tmp[id] = {name: name, icon: icon};
        setOrgs(tmp);
    }

    // tracking how many announcements have been loaded
    const [nextAnnSet, setNextAnnSet] = useState(0);
    const [nextMySet, setNextMySet] = useState(0);

    // loading
    const [isLoading, toggleLoading] = useState(true); // initial loading
    const [loadingMore, setLoadingMore] = useState(false); // loading more for lazy
    const loadingIcon = require('../assets/images/loading.gif');

    // toggle between my feed and school feed
    const [isFilter, setFilter] = useState(false);
    const toggleSwitch = () => setFilter(isFilter => !isFilter);

    // toggle between scroll feed and full announcement feed
    const [fullAnnId, setAnnId] = useState("-1");
    function setFullAnnId(id: string) {
        setAnnId(id);
        if (id == "-1") fullA?.current?.scrollTo({x: 0, y: 0, animated: false});
    }
    
    //displayed info if nothing in feed
    const [noMyFeed, togglenoMyFeedText] = useState(false);

    // scrollview reset to top on switch toggle
    const allA = React.useRef<ScrollView>(null);
    const myA = React.useRef<ScrollView>(null);
    const fullA = React.useRef<ScrollView>(null);

    // lazy loading check if user at bottom
    function isCloseToBottom({layoutMeasurement, contentOffset, contentSize}: any): boolean {
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 5;
    }

    // doesn't work properly for some reason :sob:
    // // handle to name
    // await apiRequest(`/api/user/${item.author.slug}?format=json`, '', 'GET').then((res) => {
    //     if (res.success) {
    //         let json = JSON.parse(res.response);
    //         item.author.slug = json.first_name + " " + json.last_name;
    //     }
    // });


    const onStartup = async() => {
        // club name + club icon API requests
        await AsyncStorage.getItem("@orgs").then((res:any) => {
            let jsonres = JSON.parse(res);
            if (jsonres && Array.isArray(jsonres)) {
                for (let i = 0; i < jsonres.length; i += 1) {
                    if (jsonres[i] != null) addOrgs(i, jsonres[i].name, jsonres[i].icon);
                }
            }
        });

        await loadAnnResults();
        await loadMyResults();

        if(myAnnouncements.length == 0) {
            togglenoMyFeedText(true);
        }
        toggleLoading(false);
    }

    // load more "all announcements"
    const loadAnnResults = async() => {
        if (loadingMore) return;
        setLoadingMore(true);
        var success: boolean = false;
        var counter: number = 0;
        while (!success && counter < 3) {
            counter += 1;
            await apiRequest(`/api/announcements?format=json&limit=${loadNum}&offset=${nextAnnSet}`, '', 'GET', true).then((res) => {
                if (res.success) {
                    try {
                        let jsonres = JSON.parse(res.response).results;
                        if (jsonres && Array.isArray(jsonres)) {
                            jsonres.forEach((item: any) => {
                                let orgId = item.organization.id; // gets the organization id
                                item.icon = orgs[orgId].icon;
                                item.name = orgs[orgId].name;
                            });
                            success = true;
                            // @ts-ignore
                            setAnnouncements(announcements.concat(jsonres));
                            setNextAnnSet(nextAnnSet + loadNum);
                        }
                    } catch (_e) {}
                }
            })
        }
        if (!success && counter == 3) console.log("All Announcements API Not Working");
        setLoadingMore(false);
    }

    // load more "my announcements"
    const loadMyResults = async() => {
        if (loadingMore) return;
        setLoadingMore(true);
        var success: boolean = false;
        var counter: number = 0;
        while (!success && counter < 3) {
            counter += 1;
            await apiRequest(`/api/announcements/feed?format=json&limit=${loadNum}&offset=${nextMySet}`, '', 'GET').then((res) => {
                if (res.success) {
                    let jsonres = JSON.parse(res.response).results;
                    if (jsonres && Array.isArray(jsonres)) {
                        jsonres.forEach((item: any) => {
                            let orgId = item.organization.id; // gets the organization id
                            item.icon = orgs[orgId].icon;
                            item.name = orgs[orgId].name;
                        });
                        success = true;
                        // @ts-ignore
                        setMyAnnouncements(myAnnouncements.concat(jsonres));
                        setNextMySet(nextMySet + loadNum);
                    }
                }
            });
        }
        if (!success && counter == 3) console.log("My Announcements API Not Working");
        setLoadingMore(false);
    }
    
    // fetch data from API
    useEffect(() => {
        onStartup();
    }, []);
    

    return (
        <>
        {/* Loading Icon */}
        <View style={isLoading ? styles.container : {display: "none"}}>
            <Image style={styles.loading} source={loadingIcon}/>
        </View>

        {/* After Everything is Loaded */}
        <View style={!isLoading ? [styles.container, {backgroundColor: (colorScheme.scheme === "dark" ? "#252525" : "#eaeaea")}] : {display: "none"}}>
            <Text style={fullAnnId == "-1" ? styles.header : {display: "none"}}>
                {isFilter ? "My Announcements" : "All Announcements"}
            </Text>

            {/* School Announcements */}
            <ScrollView 
                ref={allA} 
                style={!isFilter && fullAnnId == "-1" ? styles.scrollView : {display: "none"}}
                onScroll={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                        loadAnnResults();
                    }
                }}
                scrollEventThrottle={0}
                >
                    {Object.entries(announcements).map(([key, ann]) => (
                        <Announcement key={key} ann={ann} fullAnn={setFullAnnId}></Announcement>
                    ))}
            </ScrollView>

            {/* My Feed Announcement */}
            <ScrollView 
                ref={myA} 
                style={isFilter && fullAnnId == "-1" ? styles.scrollView : {display: "none"}}
                onScroll={({nativeEvent}) => {
                    if (isCloseToBottom(nativeEvent)) {
                        loadMyResults();
                    }
                }}
                scrollEventThrottle={0}
            >
                {Object.entries(myAnnouncements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann} fullAnn={setFullAnnId}></Announcement>
                ))}
                <View style={noMyFeed ? {display: "none"} : {display: "flex"}}>     
                    <Text style={{textAlign: 'center'}}>There is nothing in your feed. Join some 
                        <Text style={{color: 'rgb(51,102,187)'}} onPress={() => { WebBrowser.openBrowserAsync(config.server + '/clubs') }}>{' '}clubs{' '}</Text>
                    to have their announcements show up here!</Text>
                 </View>
                 <View style={guestMode.guest ? {display: "flex"} : {display: "none"}}>     
                    <Text style={{textAlign: 'center'}}>
                        <Text style={{color: 'rgb(51,102,187)'}} onPress={() => { navigation.jumpTo('Settings') }}>{' '}Log in{' '}</Text>
                    to view your personal feed here!</Text>
                 </View>
            </ScrollView>

            {/* Full Announcement */}
            <ScrollView ref={fullA} style={fullAnnId != "-1" ? styles.scrollView : {display: "none"}}>
                <FullAnnouncement ann={announcements.find((e: any) => e.id == fullAnnId)} backToScroll={setFullAnnId}></FullAnnouncement>
            </ScrollView>

            {/* Divider */}
            <View
                style={{
                height: 3.5,
                width: "100%",
                backgroundColor: colorScheme.scheme === "dark" ? "#1c1c1c" : "#d4d4d4",
                }}
            />

            {/* Filter Announcements */}
            <View style={[fullAnnId == "-1" ? styles.row : {display: "none"}, {backgroundColor: colorScheme.scheme === 'dark' ? "#252525" : "#eaeaea",}]}>
                <Text style={
                    {color: isFilter ?(colorScheme.scheme === "dark" ? "#434343" : "#a8a8a8") : (colorScheme.scheme === "light" ? "#434343" : "#a8a8a8"), 
                    fontFamily: 'poppins', 
                    paddingHorizontal: 8, 
                    paddingVertical: Platform.OS === 'ios' ? 5 : 10
                }}>All </Text>
                <Switch style={styles.switch}
                    trackColor={{ false: "#555555", true: "#828282" }}
                    thumbColor={isFilter ? "#444444" : "#444444"}
                    onValueChange={() => {
                        toggleSwitch();
                        allA?.current?.scrollTo({x: 0, y: 0, animated: false});
                        myA?.current?.scrollTo({x: 0, y: 0, animated: false});
                    }}
                    value={isFilter}
                />
                <Text style={
                    {color: isFilter ?(colorScheme.scheme === "light" ? "#434343" : "#a8a8a8") : (colorScheme.scheme === "dark" ? "#434343" : "#a8a8a8"), 
                    fontFamily: 'poppins', 
                    paddingHorizontal:12, 
                    paddingVertical: Platform.OS === 'ios' ? 5 : 10
                }}>My </Text>
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

