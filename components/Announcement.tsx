import * as React from 'react';
import { StyleSheet, StatusBar, ScrollView, Linking } from 'react-native';
import { Text, View } from '../components/Themed';

export default function Announcement({key, ann}:{key: string, ann: any}) {
    return (
        <View style={styles.announcement}>
            <View style={styles.tags}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    createTag(key, tag)
                ))}
            </View>

            {createHeader(ann.title)}
            
            {annDetails(ann.organization.slug, ann.author.slug, ann.created_date)}
            {previewText(ann.body)}
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

function annDetails(org: string, author: string, timeStamp: string) {
    return (
        <View style={styles.details}>
            <Text>{org}</Text>
            <Text>{author}</Text>
            <Text>{timeStamp}</Text>
        </View>
    );
}

function previewText(text: string) {
    return (
        <Text style={styles.text}>
            {text}
        </Text>
    )
}

// ----- STYLES -----
const styles = StyleSheet.create({
    announcement: {
        borderWidth: 1,
        marginHorizontal: 10,
        marginBottom: 20,
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
        flexDirection: "row",
        flexWrap: "wrap",
    },

    text: {
        marginTop: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        overflow: "hidden",
        height: 100,
    },
});
