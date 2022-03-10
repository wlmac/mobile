import * as React from 'react';
import { useState, useEffect } from 'react';
import { Switch, useColorScheme } from 'react-native';
import { StyleSheet, StatusBar, ScrollView, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import Announcement from '../components/Announcement';
import FullAnnouncement from '../components/FullAnnouncement';
import * as WebBrowser from 'expo-web-browser';
import apiRequest from '../lib/apiRequest';
import config from '../config.json';

export default function AnnouncementScreen() {
    const loadNum = 5;

    // stores announcements
    const [announcements, setAnnouncements] = useState([]);
    const [myAnnouncements, setMyAnnouncements] = useState([]);
    const [orgs, setOrgs] = useState(new Array(1000).fill({name: "", icon: ""}));
    
    const addOrgs = (id: number, name: String, icon: String) => {
        let tmp = orgs;
        tmp[id].name = name;
        tmp[id].icon = icon;
        setOrgs(tmp);
    }


    const [nextAnnSet, setNextAnnSet] = useState(0);

    // loading
    const [isLoading, toggleLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
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

    function isCloseToBottom({layoutMeasurement, contentOffset, contentSize}: any): boolean {
        return layoutMeasurement.height + contentOffset.y >= contentSize.height - 5;
    }

    const onStartup = async() => {
        await apiRequest('/api/organizations?format=json', '', 'GET').then((res) => {
            if (res.success) {
                let jsonres = JSON.parse(res.response);
                if(jsonres && Array.isArray(jsonres)) {
                    jsonres.forEach((org: any) => {
                        addOrgs(org.id, org.name, org.icon);
                    });
                }
            }
        });

        await loadAnnResults();
        if(myAnnouncements.length == 0) {
            togglenoMyFeedText(true);
        }
    }

    // load more "all announcements"
    const loadAnnResults = async() => {
        if (loadingMore) return;
        setLoadingMore(true);
        var jsonres;
        await apiRequest(`/api/announcements?format=json&limit=${loadNum}&offset=${nextAnnSet}`, '', 'GET').then((res) => {
            if (res.success) {
                jsonres = JSON.parse(res.response).results;
                jsonres.forEach((item: any) => {
                    let orgId = item.organization.id; // gets the organization id
                    item.icon = orgs[orgId].icon;
                    item.name = orgs[orgId].name;
                });
                setAnnouncements(announcements.concat(jsonres));
                setNextAnnSet(nextAnnSet + loadNum);
            }
        });

        setLoadingMore(false);
        toggleLoading(false);
    }

    // load more "my announcements"
    const loadMyResults = async() => {
        if (loadingMore) return;
        setLoadingMore(true);
        var jsonres;
        await apiRequest(`/api/announcements?format=json&limit=${loadNum}&offset=${nextAnnSet}`, '', 'GET').then((res) => {
            if (res.success) {
                jsonres = JSON.parse(res.response).results;
                jsonres.forEach((item: any) => {
                    let orgId = item.organization.id; // gets the organization id
                    item.icon = orgs[orgId].icon;
                    item.name = orgs[orgId].name;
                });
                setAnnouncements(announcements.concat(jsonres));
                setNextAnnSet(nextAnnSet + loadNum);
            }
        });

        setLoadingMore(false);
        toggleLoading(false);
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
        <View style={!isLoading ? styles.container : {display: "none"}}>
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
            <ScrollView ref={myA} style={isFilter && fullAnnId == "-1" ? styles.scrollView : {display: "none"}}>
                {Object.entries(myAnnouncements).map(([key, ann]) => (
                    <Announcement key={key} ann={ann} fullAnn={setFullAnnId}></Announcement>
                ))}
                <View style={noMyFeed ? {display: "none"} : {display: "flex"}}><Text style={{textAlign: 'center'}}>There is nothing in your feed. Join some 
                <Text style={{color: 'rgb(51,102,187)'}} onPress={() => { WebBrowser.openBrowserAsync(config.server + '/clubs') }}>{' '}clubs{' '}</Text>
                 to have their announcements show up here!</Text></View>
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
                backgroundColor: "#efefef",
                }}
            />

            {/* Filter Announcements */}
            <View style={fullAnnId == "-1" ? styles.row : {display: "none"}}>
                <Text style={{color: isFilter ?(useColorScheme() === "dark" ? "#434343ff" : "#b7b7b7ff") : (useColorScheme() === "light" ? "#434343ff" : "#b7b7b7ff"), fontFamily: 'poppins', paddingHorizontal: 8, paddingTop: 5,
                }}>All </Text>
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
                <Text style={{color: isFilter ?(useColorScheme() === "light" ? "#434343ff" : "#b7b7b7ff") : (useColorScheme() === "dark" ? "#434343ff" : "#b7b7b7ff"), fontFamily: 'poppins', paddingHorizontal:12, paddingTop: 5 }}>My </Text>
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

