import * as React from 'react';
import { ScrollView, StyleSheet, Alert, TouchableOpacity, Linking } from 'react-native';
import { Text, View } from '../components/Themed';
import {ThemeContext} from '../hooks/useColorScheme';

export default function Profile({ back, userinfo }: { back: Function, userinfo: any }) {
    const colorScheme = React.useContext(ThemeContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";

    return (
        <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'light' ? '#e0e0e0' : '#252525'}]}>
            <Text>{userinfo.username}</Text>
            <Text>{userinfo.first_name}</Text>
            <Text>{userinfo.last_name}</Text>
            <Text>{userinfo.bio}</Text>

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