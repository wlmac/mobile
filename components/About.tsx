import * as React from 'react';
import { StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '../components/Themed';
import * as WebBrowser from 'expo-web-browser';
import {ThemeContext} from '../hooks/useColorScheme';
import config from '../config.json';
export default function About({ back }: { back: (x: number) => void }) {
    const colorScheme = React.useContext(ThemeContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
    return (
        <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}]}>
            <Text style={styles.title}>
                About
            </Text>
            <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}]}>
                <Text>The Metropolis app is the mobile app for {' '}
                    <TouchableOpacity onPress={() => { WebBrowser.openBrowserAsync(config.server) }}>
                        <Text style={styles.link}>
                            {config.server}
                        </Text>
                    </TouchableOpacity>
                    {'\n'}{'\n'}
                    We operate in conjunction with the main site, providing features and functionality that aim to be consistent with the site.
                    However, we are planning to update the app with more features exclusive to the mobile experience. You can view updates in the changelog.
                    {'\n'}{'\n'}
                    By using this app, you consent to the {}
                    <Text style={styles.link} onPress={() => { WebBrowser.openBrowserAsync(config.server + '/privacy') }}>
                        privacy policy
                    </Text> and <Text style={styles.link} onPress={() => { WebBrowser.openBrowserAsync(config.server + '/terms') }}>
                        terms of service
                    </Text> as outlined on the site.
                </Text>
                <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
                <Text style={styles.subtitle}>
                    Credits
                </Text>
                <Text style={{ marginBottom: 12 }}>
                    <Text style={{ fontWeight: 'bold' }}>Lead Developers:</Text> Patrick Lin, Shane Chen {'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Other Developers:</Text> Aaron Zhu, Aava Sapkota, Vlad Surdu, Jeremy Liang, Max Sun, Colin Cai {'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Backend:</Text> Ken Shibata, Paul Lee {'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Graphics and Design:</Text> Chelsea Wong, Annie Wong, Justin Lu, Nicole Cui {'\n'}
                    <Text style={{ fontWeight: 'bold' }}>Support:</Text> Project Metropolis, SAC, WLMAC {'\n'}
                </Text>
                <Text style={styles.subtitle}>
                    Contact
                </Text>
                <Text style={{ marginBottom: 12 }}>
                    Got a question, concern, or issue? Contact us using these methods! {'\n'}{'\n'}
                    <TouchableOpacity onPress={() => { Linking.openURL('mailto:hello@maclyonsden.com?subject=[App]%20Support%20Requested') }}>
                        <Text style={styles.link}>
                            hello@maclyonsden.com
                        </Text>
                    </TouchableOpacity>{'\n'}
                    <TouchableOpacity onPress={() => { WebBrowser.openBrowserAsync('https://maclyonsden.com/contact') }}>
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
            <View style={{ justifyContent: 'space-between' , backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}}>
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
        marginLeft: '3%',
    },
    subtitle: {
        marginBottom: 12,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginLeft: '10%',
        marginVertical: 30,
        height: 1,
        width: '80%',
    },
    button: {
        width: "80%",
        borderRadius: 5,
        alignItems: 'center',
        padding: 10,
        marginTop: 'auto',
        marginLeft: '10%',
    },
    link: {
        color: 'rgb(51,102,187)'
    },
});