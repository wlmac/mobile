import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import Markdown from 'react-native-markdown-display';
import useColorScheme from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';
const linkify = require('markdown-linkify'); //using require due to lack of type definitions

var lightC = "#3a6a96";
var darkC = "#42a4ff";
export default function FullAnnouncement({ann, backToScroll}:{ann: any, backToScroll: Function}) {
    if (ann == undefined) { // prevent errors
        return(<></>);
    }
    return (
        <View style={[styles.announcement, {shadowColor: useColorScheme() === "light" ? "black" : "white"}]} onStartShouldSetResponder={(e) => true} onResponderRelease={() => backToScroll(ann.id)}>
            <View style={styles.tags}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    createTag(key, tag)
                ))}
            </View>

            {createHeader(ann.title)}
            
            {annDetails(ann.name, ann.icon, ann.author.slug, ann.created_date)}
            {previewText(ann.body)}

            {/* View More Details */}
            <View style={styles.click} onStartShouldSetResponder={(e) => true} onResponderRelease={() => backToScroll("-1")}>
                <Text style={[{color: useColorScheme() === "light" ? lightC : darkC}, {fontSize: 16}]}>{"<  Back to Announcements"}</Text>
            </View>
        </View>
    );
}

function createTag(key: any, tag: any) {
    return (
        <Text key={key} style={[styles.tag, {backgroundColor: tag.color}]}>{tag.name}</Text>
    );
}

function createHeader(title: string) {
    return (
        <Text style={styles.header}>{title}</Text>
    );
}

function annDetails(org: string, orgIcon: string, author: string, timeStamp: string) {
    return (
        <View style={styles.details}>
            <View style={styles.detailsHeading}>
                <View style={[styles.iconShadow, {shadowColor: useColorScheme() === "light" ? "black" : "white"}]}>
                    <Image style={styles.orgIcon} source={{uri: orgIcon}}></Image>
                </View>
                <Text style={[styles.clubName, {color: useColorScheme() === "light" ? lightC : darkC}]}>{org}</Text>
            </View>
            <View style={styles.detailsSubheading}>
                <Text style={styles.timeStamp}>{new Date(timeStamp).toLocaleString("en-US", {timeZone: "EST"})}</Text>
                <Text style={[styles.author, {color: useColorScheme() === "light" ? lightC : darkC}]}>{author}</Text>
            </View>
        </View>
    );
}

// markdown to plaintext
function previewText(text: string) {
    return (
        <View style={styles.text}>
            <Markdown style={useColorScheme() === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={url => {
                if(url) {
                    WebBrowser.openBrowserAsync(url);
                    return false;
                }
                else {
                    return true;
                }
            }}>{linkify(text)}</Markdown>
        </View>
    )
}


// ----- STYLES -----
const styles = StyleSheet.create({
    announcement: {
        marginVertical: 15,
        marginHorizontal: 10,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        borderRadius: 15,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 15,
        marginHorizontal: 5,
    },
    tag: {
        color: "black",
        overflow: "hidden",
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginHorizontal: 3,
        marginBottom: 5,
        borderRadius: 5,
        fontSize: 14,
    },
    header: {
        fontSize: 30,
        fontWeight: "bold",
        marginHorizontal: 20,
        marginBottom: 10,
    },
    details: {
        flex: 1,
    },
    detailsHeading:{
        width:"100%",
        flexDirection:"row",
        alignItems:"center",
        paddingBottom:5,
        paddingLeft: 6,
    },
    detailsSubheading:{
        flex:1,
    },
    iconShadow: {
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        shadowRadius: 2,
        marginHorizontal: 8,
        borderRadius: 38/2,
    },
    orgIcon: {
        display: "flex",
        width: 38,
        height: 38,
        borderRadius: 38/2,
    },
    text: {
        marginTop: 5,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    clubName: {
        fontSize: 20,
        paddingTop: 0,
        paddingHorizontal: 5,
        fontWeight: "bold",
        flex: 1
    },
    author: {
        fontSize: 18,
        paddingTop: 7,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        fontWeight: "bold",
    },
    timeStamp: {
        fontSize: 18,
        paddingTop: 7,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        color: '#939393',
    },
    click: {
        marginTop: 5,
        marginBottom: 15,
        marginHorizontal: 10,
    },
});

const markdownStylesLight = StyleSheet.create({
    body: {
        color: "black",
        backgroundColor: "white",
        fontSize: 17,
    },
    link: {
        color: "#018bcf",
    },
    image: {
        minWidth: '90%',
        margin: 10,
    }
});

const markdownStylesDark = StyleSheet.create({
    body: {
        color: "white",
        backgroundColor: "black",
        fontSize: 17,
    },
    blockquote: {
        backgroundColor: "black",
    },
    link: {
        color: "#00abff",
    },
    image: {
        minWidth: '90%',
        margin: 10,
    }
});
