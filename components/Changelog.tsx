import * as React from 'react';
import { ScrollView, StyleSheet, Button, TouchableOpacity, useColorScheme } from 'react-native';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';

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
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}> v{change.version} </Text>
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
        flex: 1,
        marginVertical: 15,
        marginHorizontal: 10,
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

export function ChangeLogModal() {
    const [isModalVisible, setModalVisible] = React.useState(false);
    const modalOff = () => {
        setModalVisible(false);
        AsyncStorage.setItem(`@changelogseenver`, Constants.manifest?.version ?? '0.0.0').catch();
    };
    React.useEffect(() => {
        AsyncStorage.getItem('@changelogseenver').then(val => {
            if ((!val || val !== Constants.manifest?.version) && changelog[0].version === Constants.manifest?.version) {
                setModalVisible(true);
            }
        }).catch();
    }, [])
    return (
        <View>
            <Modal isVisible={isModalVisible}>
                <View style={[modalStyles.content, { flex: 1 }]}>
                    <Ionicons size={30} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignSelf: 'flex-end' }} name="close" color="white" onPress={modalOff} />
                    <Text style={styles.title}>What's New</Text>
                    <Text style={{ fontSize: 20, fontWeight: 'bold' }}> v{changelog[0].version} </Text>
                    <Text> {new Date(changelog[0].time).toLocaleString() + '\n'} </Text>
                    <Text> {changelog[0].changes} </Text>
                    <TouchableOpacity onPress={modalOff} style={styles.button}><Text>Close</Text></TouchableOpacity>
                </View>
            </Modal>
        </View>
    )
}

const modalStyles = StyleSheet.create({
    content: {
        padding: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    }
});