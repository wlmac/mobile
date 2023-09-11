import React from "react";
import { StyleSheet } from 'react-native';
import { TagDescriptor } from "../api";
import { Text, View } from '../components/Themed';
import { ThemeContext } from "../hooks/useColorScheme";

import { hexToHsv, hsvToHex } from '../lib/colors';

export function darkenColor(color: string) {
    let hsv = hexToHsv(color);
    hsv[1] = 0.7;
    hsv[2] *= 0.5;
    return hsvToHex(hsv);
}

export default function Tag({tag} : {tag: TagDescriptor}) {
    const scheme = React.useContext(ThemeContext).scheme;

    return (
        <Text style={[styles.tag, {
            backgroundColor: scheme == "light" ? tag.color : darkenColor(tag.color),
            shadowColor: scheme === "light" ? "black" : "white"
        }]}>{tag.name}</Text>
    );
}


const styles = StyleSheet.create({
    tag: {
        overflow: "hidden",
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginBottom: 5,
        marginRight: 5,
        borderRadius: 5,
        fontSize: 13,
    },
});