import * as React from 'react';
import { ScrollView, StyleSheet, Button, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Text, View } from '../components/Themed';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Modal from "react-native-modal";
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {ThemeContext} from '../hooks/useColorScheme';
import changelog from '../changelog.json';

export default function Changelog({ back }: { back: Function }) {

    const colorScheme = React.useContext(ThemeContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";

    return (
        <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}]}>
            <View style={[styles.changelog, {backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}]}>
                <Text style={styles.title}> Changelog </Text>
                <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
                {Object.entries(changelog).map(([key, change]) => (
                    <View key={key} style={[{backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}, {paddingBottom: 50}]}>
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colorScheme.scheme === "dark" ? '#348feb' : '#105fb0' }}> v{change.version} </Text>
                        <Text style={{ color: colorScheme.scheme === "dark" ? '#cccccc' : '#555555', fontSize: 15 }}> {new Date(change.time).toLocaleString() + '\n'} </Text>
                        <View style={{backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}}>
                            <Markdown style={colorScheme.scheme === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={url => {
                        if(url) {
                            WebBrowser.openBrowserAsync(url);
                            return false;
                        }
                        else {
                            return true;
                        }
                    }}>{change.changes + '\n\n'}</Markdown></View>
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
        marginTop: 'auto',
    }
});

export function ChangeLogModal() {
    const colorScheme = React.useContext(ThemeContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
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
    /*The string at the end is a hacky solution to elongate markdown text such that the button renders correctly. Contains zero-width spaces.*/
    return (
        <Modal isVisible={isModalVisible} style={modalStyles.modal}>
            <View style={modalStyles.wrapper}>
                <ScrollView style={{backgroundColor: colorScheme.scheme === "light" ? "white" : "black"}} contentContainerStyle={modalStyles.scrollView}>
                        <Ionicons size={30} style={{ position: 'absolute', right: 0, top: 0}} name="close" color="white" onPress={modalOff} />
                        <Text style={styles.title}>What's New</Text>
                        <Text style={{ fontSize: 20, fontWeight: 'bold' }}> v{changelog[0].version} </Text>
                        <Text> {new Date(changelog[0].time).toLocaleString() + '\n'} </Text>
                        <View>
                            <Markdown style={colorScheme.scheme === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={() => true}>{changelog[0].changes}</Markdown>
                        </View>
                        <TouchableOpacity onPress={modalOff} style={[modalStyles.button, { backgroundColor: btnBgColor }]}><Text>Close</Text></TouchableOpacity>
                </ScrollView>
            </View>
        </Modal>
    )
}

const modalStyles = StyleSheet.create({
    modal: {
        position: "absolute",
        top:0,
        left:0,
        bottom:0,
        right:0,
        justifyContent: "center",
        alignItems:"center",
    },
    wrapper:{
        width:"90%",
        maxWidth: 500,
        maxHeight:"70%",
        justifyContent: "center",
        alignItems:"center",
    },
    scrollView:{
        alignItems: "center",
        padding: 20,
    },
    button: {
        width: "100%",
        borderRadius: 5,
        alignItems: 'center',
        padding: 10,
        marginTop: 20,
    }
});

const markdownStylesLight = StyleSheet.create({
    body: {
        color: "black",
        backgroundColor: '#e0e0e0',
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
        backgroundColor: '#252525',
        fontSize: 17,
    },
    blockquote: {
        backgroundColor: "black",
    },
    link: {
        color: "#00abff",
    },
    image: {
        minWidth: '90%',
        margin: 10,
    }
});
