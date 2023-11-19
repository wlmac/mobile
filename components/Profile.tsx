import * as React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Text, View } from '../components/Themed';
import { ThemeContext } from '../hooks/useColorScheme';
import { UserData } from '../api';



export default function Profile({ back, userinfo, headerOnly }: { back?: () => void, userinfo: UserData | null, headerOnly?: boolean }) {

    if (userinfo === undefined) {
        console.warn("userinfo is invalid");
        return (
            <View>
                <Text>API Error</Text>
            </View>
        );
    }

    const colorScheme = React.useContext(ThemeContext);
    const btnBgColor = colorScheme.scheme === "light" ? "rgb(189, 189, 189)" : "rgb(64, 64, 64)";
    
    return (
        <View style={[styles.container, {backgroundColor: colorScheme.scheme === 'light' ? '#c2c2c2' : '#1f1f1f'}]}>
            
            { userinfo === null ?
                <>
                    <Text style={styles.title}>Not logged in</Text>
                    <View style={{ flexDirection: 'column', backgroundColor: "transparent"}}> 
                        <Text style={[styles.name, { marginBottom: 22 }]}>Guest</Text>
                    </View>
                </> : <>
                    <Text style={styles.greeting}>Logged in as</Text>
                    <View style={{ flexDirection: 'row', backgroundColor: "transparent"}}> 
                        <Image
                            style={styles.avatar}
                            source={{
                                uri: userinfo.gravatar_url,
                            }}
                        />
                        <View style={{ flexDirection: 'column', backgroundColor: "transparent"}}> 
                            <Text 
                                style={styles.title}
                            >
                                {userinfo.first_name} {userinfo.last_name}
                            </Text>
                            <Text style={styles.name}>{userinfo.username}</Text>
                        </View>
                    </View>
                    
                    {!headerOnly && <>
                        <View style={styles.separator} lightColor="#adadad" darkColor="rgba(255,255,255,0.1)" />
                        <View style={{flexDirection: 'column', padding: '5%', backgroundColor: "transparent"}}>
                            <View style={{ flexDirection: 'row', backgroundColor: "transparent"}}>
                                <Text style={styles.leftText}>Graduating Year</Text>
                                <Text style={styles.rightText}>{userinfo.graduating_year}</Text>
                            </View>
                            {
                                userinfo.organizations.length > 0 && <View style={{ flexDirection: 'row', backgroundColor: "transparent"}}>
                                    <Text style={styles.leftText} > Following </Text>
                                    <Text style={styles.rightText}>
                                        {userinfo.organizations.join(', ')}
                                    </Text>
                                </View>
                            }
                            <Text></Text>
                            
                            <Text style={styles.rightText}>{userinfo.bio || 'This user has not shared any information'}</Text>
                        </View>
                        
                        
        
                        <View style={{ justifyContent: 'space-between' , backgroundColor: "transparent"}}>
                            <TouchableOpacity style={[styles.button, { backgroundColor: btnBgColor }]} onPress={back}>
                                <Text> Back </Text>
                            </TouchableOpacity>
                        </View>
                    </>}
                </>
            }
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        alignSelf: 'center',
        width: "100%",
        borderRadius: 10,
        paddingVertical: "5%",
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        marginLeft: '10%',
        marginTop: '7.5%',
    },
    subtitle: {
        marginBottom: 12,
        fontSize: 20,
        fontWeight: 'bold',
    },
    separator: {
        marginLeft: '5%',
        marginVertical: 30,
        height: 1,
        width: '90%',
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
    avatar: {
        width: 75,
        height: 75,
        borderRadius: 75 / 2.0,
        resizeMode: 'stretch',
        marginLeft: '3%',
        marginTop: '5%',
    },
    name: {
        color: '#757575',
        marginLeft: "10%",
        marginTop: "3%"
    },
    //text that goes on the left of the right text 
    leftText: {
        marginLeft: '3%',
        marginBottom: '2%',
        color: '#434343'
    },
    //text that goes on the right of the left text
    rightText: {
        marginLeft: '3%',
        marginBottom: '2%',
        flex: 1,
    },
    greeting: {
        marginLeft: '5%',
        marginBottom: '4%',
        color: '#3a6a96',
        fontSize: 40,
    },
    
});