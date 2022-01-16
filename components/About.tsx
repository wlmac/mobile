import * as React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, useColorScheme, Linking } from 'react-native';
import { Text, View } from '../components/Themed';
import * as WebBrowser from 'expo-web-browser';
import AsyncStorage from '@react-native-async-storage/async-storage';

import config from '../config.json';

export default function About({ back }: { back: Function }) {
    const btnBgColor = useColorScheme() === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";

    return (
        <View style={styles.container}>
            <Text style={styles.title}> About </Text>
            <View style={styles.container}>
                <Text>The Metropolis app is the mobile app for
                    <TouchableOpacity onPress={() => { WebBrowser.openBrowserAsync(config.server) }}>
                        <Text style={styles.link}>
                            {config.server}
                        </Text>
                    </TouchableOpacity>
                    {'\n'}
                    We operate in conjunction with the main site, providing features and functionality that aim to be consistent with the site. 
                    However, we are planning to update the app with more features exclusive to the mobile experience. You can view updates in the changelog.
                    {'\n'}{'\n'}
                    By using this app, you consent to the privacy policy and terms of service as outlined on the site.
                    {'\n'}
                </Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>
                    Credits
                </Text>
                <Text>
                    <Text style={{fontWeight: 'bold'}}>Lead Developer:</Text> Patrick Lin {'\n'}
                    <Text style={{fontWeight: 'bold'}}>Other Developers:</Text> Aaron Zhu, Shane Chen, Aava Sapkota, Vlad Surdu {'\n'}
                    <Text style={{fontWeight: 'bold'}}>Backend:</Text> Ken Shibata, Paul Lee {'\n'}
                    <Text style={{fontWeight: 'bold'}}>Graphics and Design:</Text> Chelsea Wong, Justin Lu, Nicole Cui {'\n'}
                    <Text style={{fontWeight: 'bold'}}>Support:</Text> Project Metropolis, SAC, WLMAC {'\n'} 
                </Text>
                <Text style={{fontWeight: 'bold', fontSize: 20}}>
                    Contact
                </Text>
                <Text>
                    Got a question, concern, or issue? Contact us using these methods! {'\n'}{'\n'}
                    <TouchableOpacity onPress={() => { Linking.openURL('mailto:hello@maclyonsden.com?subject=[App]%20Support%20Requested') }}>
                        <Text style={styles.link}>
                            hello@maclyonsden.com
                        </Text>
                    </TouchableOpacity>{'\n'}
                    <TouchableOpacity onPress={() => { WebBrowser.openBrowserAsync('https://forms.gle/VoEn6s1814oEQYEV6') }}>
                        <Text style={styles.link}>
                            Contact Us Form
                        </Text>
                    </TouchableOpacity>{'\n'}
                    <TouchableOpacity onPress={() => { WebBrowser.openBrowserAsync('https://github.com/wlmac/mobile/issues') }}>
                        <Text style={styles.link}>
                            Github
                        </Text>
                    </TouchableOpacity>
                </Text>
            </View>
            <View style={{ justifyContent: 'space-between' }}>
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
    },
    link: {
        color: 'rgb(51,102,187)'
    }
});
