import * as React from 'react';
import { StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import { Text, View } from '../components/Themed';
import Markdown, { MarkdownIt, RenderRules } from 'react-native-markdown-display';
import { TouchableOpacity } from 'react-native-gesture-handler';
import {ThemeContext} from '../hooks/useColorScheme';
import * as WebBrowser from 'expo-web-browser';
import { TagDescriptor, URLString } from '../api';
import Tag from './Tag';
import loadingImage from '../assets/images/blank.png';


const lightC = "#3a6a96";
const darkC = "#42a4ff";
const markdownItInstance = MarkdownIt({linkify: true, typographer: true});
const {width} = Dimensions.get('window');
export default function FullAnnouncement({
    id,
    tags,
    title,
    organization,
    icon,
    author,
    date,
    featured_image,
    body,

    backToScroll,
    isBlog,
}:{
    id: number,
    tags: TagDescriptor[],
    title: string,
    organization: string | undefined,
    icon: URLString
    author: string,
    date: Date,
    featured_image: URLString | undefined,
    body: string,
    
    backToScroll: (x: number) => void,
    isBlog: boolean
}) {
    const colorScheme = React.useContext(ThemeContext);

    return (
        <ScrollView style={[
                styles.announcement,
                {
                    backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c',
                    shadowColor: colorScheme.scheme === 'light' ? '#1c1c1c' : '#e6e6e6'
                }
            ]}
            onStartShouldSetResponder={() => true}
            onResponderRelease={() => backToScroll(id)}>
            <View style={[styles.tags, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                {tags.map((tag, index) => <Tag key={index} tag={tag} />)}
            </View>

            {/* Header */}
            <Text style={styles.header}>{title}</Text>
            
            {/* Details */}
            <View style={[styles.details, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                <View style={[styles.detailsHeading, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                    <View style={[styles.iconShadow, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                        <Image style={styles.orgIcon} source={{uri: icon}}/>
                    </View>
                    <Text style={[styles.clubName, {color: colorScheme.scheme === "light" ? lightC : darkC}]}>{organization}</Text>
                </View>
                <View style={[styles.detailsSubheading, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                    <Text style={styles.timeStamp}>{date.toLocaleString("en-US", {timeZone: "EST"})}</Text>
                    <Text style={[styles.author, {color: colorScheme.scheme === "light" ? lightC : darkC}]}>{author}</Text>
                </View>
            </View>

            {featured_image && <ImageResizeAfter uri={featured_image} desiredWidth={width}/>}
            
            {/* Preview Text */}
            <View style={[styles.text, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                {/* @ts-ignore */}
                <Markdown debugPrintTree={false} style={colorScheme.scheme === "light" ? markdownStylesLight : markdownStylesDark} onLinkPress={url => {
                    if(url) {
                        WebBrowser.openBrowserAsync(url);
                        return false;
                    }
                    else {
                        return true;
                    }
                }} markdownit={markdownItInstance} rules={rules} defaultImageHandler="https://www.maclyonsden.com">{body}</Markdown>
            </View>

            {/* View More Details */}
            <View style={[styles.click, {backgroundColor: colorScheme.scheme === 'light' ? '#f7f7f7' : '#1c1c1c'}]}>
                <TouchableOpacity onPress={() => backToScroll(-1)}>
                    <Text style={[{color: colorScheme.scheme === "light" ? lightC : darkC}, {fontSize: 16}]}>{"<  Return to " + (isBlog ? "Blogs" : "Announcements")}</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

// https://stackoverflow.com/questions/42170127/auto-scale-image-height-with-react-native/42170351#42170351
const ImageResizeAfter = ({uri, desiredWidth}: {uri: string, desiredWidth: number}) => {
    const [desiredHeight, setDesiredHeight] = React.useState(0);

    Image.getSize(uri, (width, height) => {
        setDesiredHeight(desiredWidth / width * height);
    })
    
    return (
        <Image
            source={desiredHeight === 0 ? loadingImage : {uri}}
            style={{
                flex: 1,
                display: 'flex',
                resizeMode: 'contain',
                // borderColor: 'black', 
                // borderWidth: 5,
                // alignItems: 'center',
                // justifyContent: 'center',
                width: desiredWidth,
                height: desiredHeight === 0 ? desiredWidth : desiredHeight,
            }}
        />
    )
}

const rules: RenderRules = {
  image: function(
    node,
    allowedImageHandlers,
    defaultImageHandler,
  ){
    const { src } = node.attributes;

    // we check that the source starts with at least one of the elements in allowedImageHandlers
    const show =
      allowedImageHandlers.filter((value) => {
        return typeof value === "string" && src.toLowerCase().startsWith(value.toLowerCase());
      }).length > 0;

    if (show === false && defaultImageHandler === null) {
      return null;
    }

    const url = show === true ? `${src}?w=${width}&fmt=webp` : `${defaultImageHandler}${src}?w=${Math.round(width)}&fmt=webp`;

    return (
        <ImageResizeAfter key={node.key} uri={url} desiredWidth={width - 60}/>
    );
  },
}


// ----- STYLES -----
const styles = StyleSheet.create({
    announcement: {
        marginVertical: 15,
        marginHorizontal: 10,
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        borderRadius: 5,
    },
    back: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginTop: 20,
        marginBottom: 15,
        marginHorizontal: 19,
    },
    tags: {
        flex: 1,
        flexDirection: "row",
        flexWrap: "wrap",
        marginHorizontal: 12,
    },
    tag: {
        overflow: "hidden",
        paddingVertical: 2,
        paddingHorizontal: 7,
        marginBottom: 5,
        marginRight: 5,
        borderRadius: 5,
        fontSize: 13,
    },
    header: {
        fontSize: 30,
        fontWeight: "bold",
        marginHorizontal: 15,
        marginBottom: 10,
    },
    details: {
        flex: 1,
    },
    detailsHeading:{
        width:"100%",
        flexDirection:"row",
        alignItems:"center",
        paddingBottom:5,
        paddingLeft: 6,
    },
    detailsSubheading:{
        flex:1,
    },
    iconShadow: {
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.4,
        shadowRadius: 2,
        marginHorizontal: 10,
        borderRadius: 38/2,
    },
    orgIcon: {
        display: "flex",
        width: 38,
        height: 38,
        borderRadius: 38/2,
    },
    text: {
        flex: 0,
        flexDirection: 'row',
        marginTop: 5,
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    clubName: {
        fontSize: 20,
        paddingTop: 0,
        paddingRight: 15,
        fontWeight: "bold",
        flex: 1
    },
    author: {
        fontSize: 18,
        paddingTop: 7,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        fontWeight: "bold",
    },
    timeStamp: {
        fontSize: 18,
        paddingTop: 7,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        color: '#939393',
    },
    click: {
        marginTop: 5,
        marginBottom: 15,
        marginHorizontal: 20,
    },
});

const markdownStylesLight = StyleSheet.create({
    body: {
        color: "black",
        backgroundColor: "#f7f7f7",
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
        backgroundColor: '#1c1c1c',
        fontSize: 17,
    },
    hr: {
        backgroundColor: "white",
    },
    blockquote: {
        backgroundColor: "#3D3D3D",
    },
    link: {
        color: "#00abff",
    },
    image: {
        minWidth: '90%',
        margin: 10,
    },
    code_inline: {
        backgroundColor: '#3D3D3D',
    },
});