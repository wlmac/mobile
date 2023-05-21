import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, View } from '../components/Themed';
import { ThemeContext } from '../hooks/useColorScheme';
import removeMd from 'remove-markdown';
import * as colorConvert from 'color-convert';
import config from "../config.json";

var lightC = "#3a6a96";
var darkC = "#42a4ff";

export interface AnnouncementData{
    id: number,
    title: string,
    author: {
        id: number,
        username: string, 
        first_name: string,
        last_name: string,
    },
    organization: {
        id: number,
        slug: string,
        name: string,
        icon: string,
    }
    body: string,
    created_date: string,
    last_modified_date: string,
    show_after: string,
    is_public: boolean,
    tags: {
        id: number,
        name: string,
        color: string
    }[]
}

function darkenColor(color: string){
    let hsv = colorConvert.hex.hsv.raw(color);
    hsv[1] = 100;
    hsv[2] = hsv[2] * 0.5;
    return "#" + colorConvert.hsv.hex(hsv);
}

export default function Announcement({ ann, fullAnn }: { ann: AnnouncementData, fullAnn: Function }) {
    
    const scheme = React.useContext(ThemeContext).scheme;
    return (
        <View style={[styles.announcement, { backgroundColor: scheme === 'light' ? '#f7f7f7' : '#1c1c1c', shadowColor: scheme === 'light' ? '#1c1c1c' : '#e6e6e6'}]}>
            {/* tags */}
            <View style={[styles.tags, { backgroundColor: scheme === 'light' ? '#f7f7f7' : '#1c1c1c' }]}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    <Text key={key} style={[styles.tag, {
                        backgroundColor: scheme == "light" ? tag.color : darkenColor(tag.color),
                        shadowColor: scheme === "light" ? "black" : "white"
                    }]}>{tag.name}</Text>
                ))}
            </View>

            {/* title */}
            <Text style={styles.header}>{ann.title}</Text>
            
            {/* info */}
            <View style={styles.details}>
                <View style={[styles.detailsHeading, { backgroundColor: scheme === 'light' ? '#f7f7f7' : '#1c1c1c' }]}>
                    {/* icon */}
                    <View style={[styles.iconShadow,  { shadowColor: scheme === "light" ? "black" : "white" }]}>
                        <Image style={styles.orgIcon} source={{uri: config.server + ann.organization.icon}}/>
                    </View>
                    {/* name */}
                    <Text style={[styles.clubName, { color: scheme === "light" ? lightC : darkC }]}>{ann.organization.name}</Text>
                </View>
                {/* time */}
                <View style={[styles.detailsSubheading, { backgroundColor: scheme === 'light' ? '#f7f7f7' : '#1c1c1c' }]}>
                    <Text style={styles.timeStamp}>{new Date(ann.created_date).toLocaleString("en-US", { timeZone: "EST" }).replace(/(.*)\D\d+/, '$1')}</Text>
                    <Text style={[styles.author, { color: scheme === "light" ? lightC : darkC }]}>{ann.author.first_name + " " + ann.author.last_name}</Text>
                </View>
            </View>

            {/* body */}
            <Text style={styles.text} numberOfLines={5}>{removeMd(ann.body)}</Text>

            {/* view more */}
            <View style={[styles.click, { backgroundColor: scheme === 'light' ? '#f7f7f7' : '#1c1c1c' }]}>
                <TouchableOpacity onPress={() => {fullAnn(ann.id)}}>
                    <Text style={[{ color: scheme === "light" ? lightC : darkC }]}>{"See announcement"}</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
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
        borderRadius: 5,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 10,
    },
    tag: {
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