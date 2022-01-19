import * as React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';

import changelog from '../changelog.json';

export default function Changelog({ back }: { back: Function }) {
    const btnBgColor = useColorScheme() === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";

    return (
        <View style={styles.container}>
            <View style={styles.changelog}>
                <Text style={styles.title}> Changelog </Text>
                <View style={styles.separator} lightColor="#eee" darkColor="rgba(255,255,255,0.1)" />
                {Object.entries(changelog).map(([key, change]) => (
                    <View key={key}>
                        <Text style={{fontSize: 20, fontWeight: 'bold'}}> v{change.version} </Text>
                        <Text> {new Date(change.time).toLocaleString() + '\n'} </Text>
                        <Text> {change.changes + '\n\n'} </Text>
                    </View>
                ))}
            </View>
        <TouchableOpacity style={[styles.button, { backgroundColor: btnBgColor }]} onPress={() => { back(-1) }}>
            <Text> Back </Text>
        </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    changelog: {
        marginVertical: 30,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    separator: {
        marginLeft: '10%',
        marginVertical: 15,
        height: 1,
        width: '80%',
    },
    button: {
        width: "100%",
        borderRadius: 5,
        alignItems: 'center',
        padding: 10,
        marginTop: 'auto'
    }
});
