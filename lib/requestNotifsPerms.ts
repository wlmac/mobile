import messaging from '@react-native-firebase/messaging';

export default async function requestPerms() {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus === messaging.AuthorizationStatus.AUTHORIZED || authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
        //handle FCM registration here
        //console.log('Authorization status:', authStatus);
        subscribeWithRetry('announcements', 2000, 5);
    }
}

async function subscribeWithRetry(topic: string, timeout: number, retries: number) {
    messaging().subscribeToTopic(topic).catch(err => {
        if (retries > 0) {
            setTimeout(() => {
                subscribeWithRetry(topic, timeout*2, retries - 1);
            }, timeout);
        }
    })
}