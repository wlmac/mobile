import * as React from 'react';
import { StyleSheet, StatusBar, ScrollView, Linking, Image } from 'react-native';
import { Text, View } from '../components/Themed';

export default function Announcement({key, ann, fullAnn}:{key: string, ann: any, fullAnn: Function}) {
    return (
        <View style={styles.announcement}>
            <View style={styles.tags}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    createTag(key, tag)
                ))}
            </View>

            {createHeader(ann.title)}
            
            {annDetails(ann.name, ann.icon, ann.author.slug, ann.created_date)}
            {previewText(ann.body)}

            {/* View More Details */}
            <View style={styles.click} onStartShouldSetResponder={(e) => true} onResponderRelease={() => fullAnn(ann.id)}>
                <Text style={[{fontWeight: 'bold'}, {color: '#6e9bc4'}]}>{"See announcement  >"}</Text>
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
            <View style={styles.iconShadow}>
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
    const removeMd = require('remove-markdown');
    const plaintext = removeMd(text);
    return (
        <Text style={styles.text}>{plaintext}</Text>
    )
}

// ----- STYLES -----
const styles = StyleSheet.create({
    announcement: {
        marginVertical: 15,
        marginHorizontal: 10,
        shadowColor: "black",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 5,
    },
    tag: {
        overflow: "hidden",
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginHorizontal: 3,
        marginBottom: 5,
        borderRadius: 5,
    },
    header: {
        fontSize: 20,
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
        shadowColor: "black",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        shadowRadius: 2,
        marginHorizontal: 8,
        borderRadius: 32/2,
    },
    orgIcon: {
        display: "flex",
        width: 32,
        height: 32,
        borderRadius: 32/2,
    },
    text: {
        marginTop: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        overflow: "hidden",
        height: 100,
    },
    clubName: {
        paddingTop: 7,
    },
    author: {
        paddingTop: 7,
        paddingHorizontal: 5,
    },
    timeStamp: {
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
