import * as React from 'react';
import { StyleSheet, StatusBar, ScrollView } from 'react-native';
import { Text, View } from '../components/Themed';

export default function Announcement({key, ann}:{key: string, ann: any}) {
    return (
        <View style={styles.announcement}>
            <View style={styles.tags}>
                {Object.entries(ann.tags).map(([key, tag]) => (
                    createTag(tag)
                ))}
            </View>

            {createHeader(ann.title)}
            
            {annDetails(ann.organization.slug, ann.author.slug, ann.created_date)}
        </View>
    );
}

function createTag(tag: any) {
    return (
        <Text style={[styles.tag, {backgroundColor: tag.color}]}>{tag.name}</Text>
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
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginHorizontal: 3,
        marginBottom: 3,
    },

    header: {
        fontSize: 20,
        fontWeight: "bold",
        marginHorizontal: 20,
        marginVertical: 10,
    },

    details: {
        flexDirection: "row",
        flexWrap: "wrap",
    },
});


