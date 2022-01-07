import * as React from 'react';
import { StyleSheet, StatusBar, ScrollView, Linking, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import Markdown from 'react-native-markdown-display';
import useColorScheme from '../hooks/useColorScheme';

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
                <Text style={[{color: '#3a6a96'}, {fontSize: 16}]}>{"<  Back to Announcements"}</Text>
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
            <View style={[styles.iconShadow, {shadowColor: useColorScheme() === "light" ? "black" : "white"}]}>
                <Image style={styles.orgIcon} source={{uri: orgIcon}}></Image>
            </View>
            <Text style={styles.clubName}>{org}</Text>
            <Text style={styles.author}>{author}</Text>
            <Text style={styles.timeStamp}>{new Date(timeStamp).toLocaleString("en-US", {timeZone: "EST"})}</Text>
        </View>
    );
}

// markdown to plaintext
function previewText(text: string) {
    return (
        <Text style={styles.text}>
            <Markdown style={useColorScheme() === "light" ? markdownStylesLight : markdownStylesDark}>{text}</Markdown>
        </Text>
    )
}

// ----- STYLES -----
const styles = StyleSheet.create({
    announcement: {
        marginVertical: 15,
        marginHorizontal: 10,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
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
    },
    header: {
        fontSize: 30,
        fontWeight: "bold",
        marginHorizontal: 20,
        marginTop: 5,
        marginBottom: 10,
    },

    details: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
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
        fontSize: 18,
        paddingTop: 7,
        paddingHorizontal: 5,
        color: "#3a6a96",
        fontWeight: "bold",
    },
    author: {
        fontSize: 18,
        paddingTop: 7,
        paddingHorizontal: 5,
        color: "#3a6a96",
        fontWeight: "bold",
    },
    timeStamp: {
        fontSize: 18,
        paddingTop: 7,
        paddingLeft: 10,
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
        minWidth: '100%',
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
        color: "#018bcf",
    },
    image: {
        minWidth: '100%',
        margin: 10,
    }
});
