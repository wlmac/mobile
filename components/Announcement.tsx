import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, View } from '../components/Themed';
import useColorScheme from '../hooks/useColorScheme';

var lightC = "#3a6a96";
var darkC = "#42a4ff";
export default function Announcement({ann, fullAnn}:{ann: any, fullAnn: Function}) {
    return (
        <View style={[styles.announcement, {shadowColor: useColorScheme() === "light" ? "black" : "white"}]}>
            <View style={styles.tags}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    createTag(key, tag)
                ))}
            </View>

            {createHeader(ann.title)}
            
            {annDetails(ann.name, ann.icon, ann.author.slug, ann.created_date)}
            {previewText(ann.body)}

            {/* View More Details */}
            <View style={styles.click}>
                <TouchableOpacity onPress={() => fullAnn(ann.id)}>
                    <Text style={[{color: useColorScheme() === "light" ? lightC : darkC}]}>{"See announcement  >"}</Text>
                </TouchableOpacity>
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
    const removeMd = require('remove-markdown');
    const plaintext = removeMd(text);
    return (
        <Text style={styles.text} numberOfLines={5} >{plaintext}</Text>
    )
}

// ----- STYLES -----
const styles = StyleSheet.create({
    announcement: {
        marginVertical: 15,
        marginHorizontal: 10,
        paddingTop: 5,
        paddingHorizontal:12,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        borderRadius: 15,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
    },
    tag: {
        color: "black",
        overflow: "hidden",
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginBottom: 5,
        marginRight: 5,
        borderRadius: 5,
        fontSize: 13,
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 10,
        marginTop: 3,
    },

    details: {
        flex:1,
    },
    detailsHeading:{
        width:"100%",
        flexDirection:"row",
        alignItems:"center",
        paddingBottom:5,
    },
    detailsSubheading:{
        flex:1,
    },
    iconShadow: {
        width: 32,
        height: 32,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        shadowRadius: 2,
        borderRadius: 32/2,
    },
    orgIcon: {
        width:"100%",
        height:"100%",
        borderRadius: 32/2,
    },
    text: {
        marginTop: 5,
        paddingVertical: 5,
        overflow: "hidden",
        height: 100,
    },
    clubName: {
        marginLeft:7,
        flex:1,
        fontWeight: "bold",
        fontSize: 17,
    },
    author: {
        marginVertical:3,
        fontWeight: "bold",
    },
    timeStamp: {
        marginVertical:3,
        color: '#939393',
    },
    click: {
        marginTop: 5,
        marginBottom: 15,
    },
});
