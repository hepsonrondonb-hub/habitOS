import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { db } from '../config/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

// 1. Basic Configuration
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// 2. Types
export type NotificationType = 'checkin' | 'presence' | 'weekly_summary';

export interface NotificationLog {
    userId: string;
    type: NotificationType;
    scheduledFor: Date;
    sentAt: Date;
    openedAt?: Date;
    metadata?: any;
}

// 3. Logger
export const logNotificationEvent = async (
    userId: string,
    type: NotificationType,
    metadata: any = {}
) => {
    try {
        await addDoc(collection(db, 'notification_logs'), {
            user_id: userId,
            type,
            sent_at: serverTimestamp(),
            metadata,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        });
        console.log(`[Notification] Logged event: ${type}`);
    } catch (e) {
        console.error('[Notification] Error logging event', e);
    }
};

// 4. Permissions Helper
export const registerForPushNotificationsAsync = async () => {
    let token;

    // Check Permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        return null;
    }

    // Android Channel Configuration
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    return finalStatus;
};
