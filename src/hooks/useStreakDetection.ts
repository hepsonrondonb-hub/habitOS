import { useState, useEffect } from 'react';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, getDoc } from 'firebase/firestore';

interface StreakDetectionResult {
    shouldShowModal: boolean;
    streakDays: number;
    markModalAsShown: () => Promise<void>;
}

export const useStreakDetection = (selectedDate: Date): StreakDetectionResult => {
    const { user } = useAuth();
    const [streakDays, setStreakDays] = useState(0);
    const [shouldShowModal, setShouldShowModal] = useState(false);

    const getDateKey = (date: Date) => date.toISOString().split('T')[0];
    const todayKey = getDateKey(new Date());
    const selectedDateKey = getDateKey(selectedDate);

    // Calculate streak days
    const calculateStreak = async (): Promise<number> => {
        if (!user) return 0;

        try {
            const completionsRef = collection(db, 'habitCompletions');
            const habitsRef = collection(db, 'habits');

            // Get all active habits
            const habitsQuery = query(
                habitsRef,
                where('userId', '==', user.uid),
                where('isActive', '==', true)
            );
            const habitsSnapshot = await getDocs(habitsQuery);
            const habitIds = habitsSnapshot.docs.map(doc => doc.id);

            if (habitIds.length === 0) return 0;

            let currentStreak = 0;
            let checkDate = new Date();
            checkDate.setHours(0, 0, 0, 0);

            // Check backwards from today
            while (true) {
                const dateKey = getDateKey(checkDate);

                // Get completions for this date
                const completionsQuery = query(
                    completionsRef,
                    where('userId', '==', user.uid),
                    where('date', '==', dateKey),
                    where('completed', '==', true)
                );
                const completionsSnapshot = await getDocs(completionsQuery);
                const completedHabitIds = completionsSnapshot.docs.map(doc => doc.data().habitId);

                // Check if all habits were completed
                const allCompleted = habitIds.every(id => completedHabitIds.includes(id));

                if (allCompleted) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else {
                    break;
                }

                // Safety limit
                if (currentStreak > 365) break;
            }

            return currentStreak;
        } catch (error) {
            console.error('Error calculating streak:', error);
            return 0;
        }
    };

    // Check if all habits are completed for today
    const checkAllHabitsCompleted = async (): Promise<boolean> => {
        if (!user) return false;
        if (selectedDateKey !== todayKey) return false; // Only for today

        try {
            const habitsRef = collection(db, 'habits');
            const completionsRef = collection(db, 'habitCompletions');

            // Get all active habits
            const habitsQuery = query(
                habitsRef,
                where('userId', '==', user.uid),
                where('isActive', '==', true)
            );
            const habitsSnapshot = await getDocs(habitsQuery);
            const habitIds = habitsSnapshot.docs.map(doc => doc.id);

            if (habitIds.length === 0) return false;

            // Get today's completions
            const completionsQuery = query(
                completionsRef,
                where('userId', '==', user.uid),
                where('date', '==', todayKey),
                where('completed', '==', true)
            );
            const completionsSnapshot = await getDocs(completionsQuery);
            const completedHabitIds = completionsSnapshot.docs.map(doc => doc.data().habitId);

            // Check if all habits are completed
            return habitIds.every(id => completedHabitIds.includes(id));
        } catch (error) {
            console.error('Error checking habits completion:', error);
            return false;
        }
    };

    // Check if modal was already shown today
    const wasModalShownToday = async (): Promise<boolean> => {
        if (!user) return false;

        try {
            const modalRef = doc(db, 'streakModals', `${user.uid}_${todayKey}`);
            const modalDoc = await getDoc(modalRef);
            return modalDoc.exists();
        } catch (error) {
            console.error('Error checking modal status:', error);
            return false;
        }
    };

    // Mark modal as shown for today
    const markModalAsShown = async () => {
        if (!user) return;

        try {
            const modalRef = doc(db, 'streakModals', `${user.uid}_${todayKey}`);
            await setDoc(modalRef, {
                userId: user.uid,
                date: todayKey,
                shownAt: new Date().toISOString(),
                streakDays,
            });
            setShouldShowModal(false);
        } catch (error) {
            console.error('Error marking modal as shown:', error);
        }
    };

    // Check if we should show the modal
    const checkShouldShowModal = async () => {
        if (!user || selectedDateKey !== todayKey) {
            setShouldShowModal(false);
            return;
        }

        const allCompleted = await checkAllHabitsCompleted();
        if (!allCompleted) {
            setShouldShowModal(false);
            return;
        }

        const alreadyShown = await wasModalShownToday();
        if (alreadyShown) {
            setShouldShowModal(false);
            return;
        }

        const streak = await calculateStreak();
        setStreakDays(streak);
        setShouldShowModal(true);
    };

    return {
        shouldShowModal,
        streakDays,
        markModalAsShown,
    };
};
