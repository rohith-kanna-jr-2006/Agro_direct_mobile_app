import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

export async function scheduleNotification(title: string, body: string) {
    if (Platform.OS === 'web') {
        console.log(`[Web Notification] ${title}: ${body}`);
        alert(`${title}\n${body}`); // Use Alert on web
        return;
    }
    await Notifications.scheduleNotificationAsync({
        content: {
            title,
            body,
            sound: 'default',
        },
        trigger: null, // show immediately
    });
}

export async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web') return;
    let token;

    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    if (finalStatus !== 'granted') {
        alert('Permission Denied: Please enable notifications in your device settings (Settings > Apps > Expo Go > Notifications) to receive updates.');
        return;
    }
    // token = (await Notifications.getExpoPushTokenAsync()).data;
    // console.log(token);

    return token;
}
