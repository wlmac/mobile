import * as React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Text, View } from '../components/Themed';
import Modal from "react-native-modal";
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import {ThemeContext} from '../hooks/useColorScheme';
import changelog from '../changelog.json';
import { SessionContext } from '../util/session';

export default function Changelog({ back }: { back: () => void }) {

    const colorScheme = React.useContext(ThemeContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
    const BgColor = colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525';

    return (
        <View style={[styles.container, {backgroundColor: BgColor}]}>
            <View style={[styles.changelog, {backgroundColor: BgColor}]}>
                <Text style={styles.title}> Changelog </Text>
                <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
                {Object.entries(changelog).map(([key, change]) => (
                    <View key={key} style={[{backgroundColor: BgColor}, {paddingBottom: 50}]}>
                        <Text style={[styles.version, { color: colorScheme.scheme === "dark" ? '#348feb' : '#105fb0' }]}> v{change.version} </Text>
                        <Text style={{ color: colorScheme.scheme === "dark" ? '#cccccc' : '#555555', fontSize: 15 }}> {new Date(change.time).toLocaleString() + '\n'} </Text>
                        <View style={{backgroundColor: BgColor}}>
                            { /* @ts-ignore */ }
                            <Markdown style={colorScheme.scheme === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={url => {
                                if(url) {
                                    WebBrowser.openBrowserAsync(url);
                                    return false;
                                } else {
                                    return true;
                                }
                            }}>{change.changes + '\n\n'}</Markdown>
                        </View>
                    </View>
                ))}
            </View>
            <TouchableOpacity style={[styles.button, { backgroundColor: btnBgColor }]} onPress={() => { back() }}>
                <Text> Back </Text>
            </TouchableOpacity>
        </View>
    )
}




export function ChangeLogModal() {
    const colorScheme = React.useContext(ThemeContext);
    const sessionContext = React.useContext(SessionContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
    const BgColor = colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525';
    const xColor = colorScheme.scheme === 'light' ? 'black' : 'white';

    const [isModalVisible, setModalVisible] = React.useState(false);
    const modalOff = () => {
        console.log("User updated, Version " + Constants.expoConfig?.version);
        sessionContext.set('@changelogseenver', Constants.expoConfig?.version ?? '0.0.0');
        setModalVisible(false);
    };
    React.useEffect(() => {
        let val = sessionContext.get<string>('@changelogseenver');
        console.log(val);
        console.log(Constants.expoConfig?.version ?? '0.0.0');
        console.log(changelog[0].version);

        // val = '1.0.0'; // testing modal
        // sessionContext.set('@changelogseenver', '0.0.0');

        if ((!val || val !== Constants.expoConfig?.version) && changelog[0].version === Constants.expoConfig?.version) {
            setModalVisible(true);
        }
    }, [])

    
    /*The string at the end is a hacky solution to elongate markdown text such that the button renders correctly. Contains zero-width spaces.*/
    return (
        <Modal isVisible={isModalVisible} style={modalStyles.modal}>
            <View style={[modalStyles.wrapper, {backgroundColor: BgColor, shadowColor: colorScheme.scheme === 'light' ? '#1c1c1c' : '#e6e6e6'}]}>
                <ScrollView style={{backgroundColor: BgColor}} contentContainerStyle={modalStyles.scrollView}>
                        <Ionicons size={30} style={modalStyles.xIcon} name="close" color={xColor} onPress={modalOff} />
                        <Text style={styles.title}>What&apos;s New</Text>
                        <View style={modalStyles.modalSeparator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
                        <Text style={[styles.version, { color: colorScheme.scheme === "dark" ? '#348feb' : '#105fb0' }]}> v{changelog[0].version} </Text>
                        <Text style={{ color: colorScheme.scheme === "dark" ? '#cccccc' : '#555555', fontSize: 15 }}> {new Date(changelog[0].time).toLocaleString() + '\n'} </Text>
                        <View>
                            { /* @ts-ignore */ }
                            <Markdown style={colorScheme.scheme === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={() => true}>{changelog[0].changes}</Markdown>
                        </View>
                        <TouchableOpacity onPress={modalOff} style={[modalStyles.button, { backgroundColor: btnBgColor }]}><Text>Close</Text></TouchableOpacity>
                </ScrollView>
                <View style={modalStyles.modalSeparator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
            </View>
        </Modal>
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
    version: {
        fontSize: 20, 
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
    xIcon: {
        position: 'absolute', 
        right: 0, 
        top: 0,
        margin: 10,
    },
    modalSeparator: {
        marginVertical: 15,
        height: 1,
        width: '80%',
    },
    wrapper:{
        width:"100%",
        maxHeight:"70%",
        justifyContent: "center",
        alignItems:"center",
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        borderRadius: 5,
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
