import * as React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function About({ back }: { back: Function }) {
    const btnBgColor = useColorScheme() === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";

    return (
        <View style={styles.container}>
            <Text style={styles.title}> About </Text>
            <View style={{justifyContent: 'space-between', height: 100}}>
                <TouchableOpacity style={[styles.button, { backgroundColor: btnBgColor }]} onPress={() => { back(-1) }}>
                    <Text> Back </Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 15,
        marginHorizontal: 10,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
    },
    separator: {
        marginVertical: 30,
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
