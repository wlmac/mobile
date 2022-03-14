import * as React from 'react';
import { StyleSheet, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import Markdown, { MarkdownIt } from 'react-native-markdown-display';
import { TouchableOpacity } from 'react-native-gesture-handler';
import useColorScheme from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';

var lightC = "#3a6a96";
var darkC = "#42a4ff";
export default function FullAnnouncement({ann, backToScroll}:{ann: any, backToScroll: Function}) {
    if (ann == undefined) { // prevent errors
        return(<></>);
    }

    const colorScheme = useColorScheme();

    return (
        <View style={[styles.announcement, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c', shadowColor: colorScheme === 'light' ? '#1c1c1c' : '#e6e6e6'}]} onStartShouldSetResponder={(e) => true} onResponderRelease={() => backToScroll(ann.id)}>
            <View style={[styles.tags, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    createTag(key, tag)
                ))}
            </View>

            {createHeader(ann.title)}
            
            {annDetails(ann.name, ann.icon, ann.author.slug, ann.created_date, colorScheme)}
            {previewText(ann.body)}

            {/* View More Details */}
            <View style={[styles.click, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
                <TouchableOpacity onPress={() => backToScroll("-1")}>
                    <Text style={[{color: useColorScheme() === "light" ? lightC : darkC}, {fontSize: 16}]}>{"<  Return to Announcements"}</Text>
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

function annDetails(org: string, orgIcon: string, author: string, timeStamp: string, colorScheme: string) {
    return (
        <View style={[styles.details, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
            <View style={[styles.detailsHeading, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
                <View style={[styles.iconShadow, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
                    <Image style={styles.orgIcon} source={{uri: orgIcon}}></Image>
                </View>
                <Text style={[styles.clubName, {color: colorScheme === "light" ? lightC : darkC}]}>{org}</Text>
            </View>
            <View style={[styles.detailsSubheading, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
                <Text style={styles.timeStamp}>{new Date(timeStamp).toLocaleString("en-US", {timeZone: "EST"})}</Text>
                <Text style={[styles.author, {color: colorScheme === "light" ? lightC : darkC}]}>{author}</Text>
            </View>
        </View>
    );
}

// markdown to plaintext
function previewText(text: string) {

    const colorScheme = useColorScheme();

    return (
        <View style={[styles.text, {backgroundColor: colorScheme === 'light' ? '#ededed' : '#1c1c1c'}]}>
            <Markdown style={colorScheme === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={url => {
                if(url) {
                    WebBrowser.openBrowserAsync(url);
                    return false;
                }
                else {
                    return true;
                }
            }} markdownit={MarkdownIt({linkify: true, typographer: true})} defaultImageHandler="https://www.maclyonsden.com/">{text}</Markdown>
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
        borderRadius: 5,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 15,
        marginHorizontal: 12,
    },
    tag: {
        color: "black",
        overflow: "hidden",
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginHorizontal: 3,
        marginBottom: 10,
        borderRadius: 5,
        fontSize: 14,
    },
    header: {
        fontSize: 30,
        fontWeight: "bold",
        marginHorizontal: 15,
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
        marginHorizontal: 10,
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
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    clubName: {
        fontSize: 20,
        paddingTop: 0,
        paddingRight: 15,
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
        marginHorizontal: 20,
    },
});

const markdownStylesLight = StyleSheet.create({
    body: {
        color: "black",
        backgroundColor: "#ededed",
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
        backgroundColor: '#1c1c1c',
        fontSize: 17,
    },
    blockquote: {
        backgroundColor: "#3D3D3D",
    },
    link: {
        color: "#00abff",
    },
    image: {
        minWidth: '90%',
        margin: 10,
    },
    code_inline: {
        backgroundColor: '#3D3D3D',
    },
});