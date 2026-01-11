import { useEffect, useState } from 'react';
import * as Notifications from 'expo-notifications';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { evaluateDailyRule, getRandomCopy } from '../utils/notificationRules';
import { logNotificationEvent, registerForPushNotificationsAsync } from '../utils/notifications';

export const useNotificationScheduler = () => {
    const { user, userProfile } = useAuth();
    const [isEnabled, setIsEnabled] = useState(false);
    const [scheduledTime, setScheduledTime] = useState(new Date()); // Default used for UI

    // Load initial settings
    useEffect(() => {
        if (userProfile) {
            // Check persistence (we assume these fields will exist on user profile eventually)
            const settings = (userProfile as any).notificationSettings || {};
            setIsEnabled(settings.enabled || false);

            if (settings.time) {
                const [hours, minutes] = settings.time.split(':');
                const date = new Date();
                date.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                setScheduledTime(date);
            } else {
                // Default 20:00
                const date = new Date();
                date.setHours(20, 0, 0, 0);
                setScheduledTime(date);
            }
        }
    }, [userProfile]);

    const toggleNotifications = async (value: boolean) => {
        if (!user) return;

        if (value) {
            // 1. Request Permissions
            const permission = await registerForPushNotificationsAsync();
            if (permission !== 'granted') {
                setIsEnabled(false);
                alert('Para recibir notificaciones, activa el permiso en Ajustes del teléfono.');
                return;
            }
        } else {
            // 2. Cancel All if turning OFF
            await Notifications.cancelAllScheduledNotificationsAsync();
        }

        // 3. Update State & Persistence
        setIsEnabled(value);
        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                'notificationSettings.enabled': value,
                // Ensure timezone is captured
                'timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
            });

            // Trigger a re-schedule evaluation if turned ON
            if (value) {
                scheduleForTodayOrTomorrow();
            }
        } catch (e) {
            console.error('Error saving notification settings', e);
        }
    };

    const updateTime = async (newDate: Date) => {
        if (!user) return;
        setScheduledTime(newDate);

        // Format HH:mm
        const timeStr = `${newDate.getHours().toString().padStart(2, '0')}:${newDate.getMinutes().toString().padStart(2, '0')}`;

        try {
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                'notificationSettings.time': timeStr
            });

            // Re-schedule
            if (isEnabled) {
                scheduleForTodayOrTomorrow(newDate);
            }
        } catch (e) {
            console.error('Error saving time', e);
        }
    };

    // --- SCHEDULING LOGIC ---

    const fetchContextData = async () => {
        if (!user) return null;

        try {
            // 1. Active Plans
            const plansQ = query(collection(db, 'user_objectives'), where('userId', '==', user.uid), where('active', '==', true));
            const plansSnap = await getDocs(plansQ);

            // 2. Active Signals (from active plans)
            // Simplified: Just count all active signals for user for now (or refine if needed)
            // Ideally we check signals linked to active plans.
            // Let's assume 'progress_signals' collection
            const signalsQ = query(collection(db, 'progress_signals'), where('userId', '==', user.uid));
            const signalsSnap = await getDocs(signalsQ);

            // 3. Check-ins Today
            const todayStr = new Date().toISOString().split('T')[0];
            const checkinsQ = query(
                collection(db, 'check_ins'),
                where('userId', '==', user.uid),
                where('date', '==', todayStr)
            );
            const checkinsSnap = await getDocs(checkinsQ);

            // 4. Last Action Date (Habit Completions)
            const actionsQ = query(
                collection(db, 'habitCompletions'),
                where('userId', '==', user.uid),
                orderBy('timestamp', 'desc'),
                limit(1)
            );
            const actionsSnap = await getDocs(actionsQ);
            let daysSinceLastAction = 99;
            if (!actionsSnap.empty) {
                const lastDate = actionsSnap.docs[0].data().timestamp.toDate();
                const diff = new Date().getTime() - lastDate.getTime();
                daysSinceLastAction = Math.floor(diff / (1000 * 60 * 60 * 24));
            }

            // 5. Last 7 Days Activity (Mocking simple implementation for now)
            // Real implementation would require more complex queries or client-side filtering.
            // For PoC robustness, let's assume if daysSinceLastAction < 7 we have activity.
            const hasActivityLast7Days = daysSinceLastAction < 7;


            // 6. Last Notification Date (from logs)
            // We need to check if we already sent one today
            // Not implemented in DB yet, but let's check logs
            // Ideally we query 'notification_logs' for today.

            return {
                activePlansCount: plansSnap.size,
                activeSignalsCount: signalsSnap.size,
                todayCheckInCount: checkinsSnap.size,
                daysSinceLastAction: daysSinceLastAction,
                actionsLast7Days: hasActivityLast7Days ? 1 : 0, // Simplified
                checkInsLast7Days: 0, // Simplified
                userCreatedAt: (userProfile as any)?.createdAt?.toDate() || new Date(),
                lastNotificationDate: null // We will handle "one per day" via scheduling logic mostly
            };

        } catch (e) {
            console.error('Error fetching context', e);
            return null;
        }
    };

    const scheduleForTodayOrTomorrow = async (overrideTime?: Date) => {
        if (!isEnabled || !user) return;

        // Clean slate
        await Notifications.cancelAllScheduledNotificationsAsync();

        const timeToUse = overrideTime || scheduledTime;
        const now = new Date();

        let targetDate = new Date();
        targetDate.setHours(timeToUse.getHours(), timeToUse.getMinutes(), 0, 0);

        // If target time is in the past, schedule for TOMORROW
        // However, if it's in the future (later today), we should evaluate RULES now to see if we schedule for today.

        if (targetDate < now) {
            // It's past the time. Schedule for tomorrow? 
            // The problem is we can't predict tomorrow's data context (did they check in?).
            // Strategy: We can schedule a "Generic Notification" or rely on Background Fetch.
            // Since we promised "Robust Local", the best we can do without background code execution is:
            // 1. Evaluate context NOW. If satisfied -> Schedule for today (if future)
            // 2. If it is already past time, we can't do much for today unless we send immediately (which might be annoying).
            // Let's assume we logic check for "Tomorrow" is confusing locally because data changes.

            // ALERT: Real local scheduling limitation. 
            // For this implementation to be truly robust we really need Background fetch to "Wake up" and check.
            // OR we schedule a generic "Check in" everyday repeating, but that violates our custom rules.

            // COMPROMISE for Client-Side Only: 
            // We calculate the notification payload NOW.
            // If it's valid for "Right Now", we schedule it. 

            // For demonstration of "Rules Engine":
            // We will evaluate rules. If a rule matches, we schedule it for the next occurrence of that time.

            targetDate.setDate(targetDate.getDate() + 1);
        }

        const context = await fetchContextData();
        if (!context) return;

        const decision = evaluateDailyRule(context);

        console.log('Evaluation Result:', decision);

        if (decision.type && decision.body) {
            await Notifications.scheduleNotificationAsync({
                content: {
                    title: "HabitOS",
                    body: decision.body,
                    data: { type: decision.type }
                },
                trigger: targetDate, // One-off schedule for next slot
            });

            // Log INTENT (not sent yet, but scheduled)
            // ideally we log when received vs scheduled.
        }
    };

    // Debug method to force send NOW
    const sendTestNotification = async (type: any) => {
        const body = getRandomCopy(type);
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "HabitOS",
                body: body,
                data: { type }
            },
            trigger: null, // Send immediately
        });
        logNotificationEvent(user?.uid || 'test', type, { manual: true });
    };

    return {
        isEnabled,
        scheduledTime,
        toggleNotifications,
        updateTime,
        sendTestNotification
    };
};
