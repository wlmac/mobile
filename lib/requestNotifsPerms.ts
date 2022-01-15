import messaging from '@react-native-firebase/messaging';

export default async function requestPerms() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
        //handle FCM registration here
        //console.log('Authorization status:', authStatus);
    }
}