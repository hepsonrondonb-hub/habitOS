import { useState, useRef } from 'react';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { useAuth } from '../store/AuthContext';

interface CelebrationContext {
    habitId: string;
    habitName: string;
    habitType: 'simple' | 'exercise' | 'training';
    date: string;
    totalHabitsForDay: number;
    completedHabitsForDay: number;
}

interface CelebrationResult {
    message: string;
    icon?: 'check-circle' | 'local-fire-department' | 'trending-up';
    type: 'base' | 'streak' | 'training' | 'day-complete';
}

const baseCelebrations = [
    "Bien hecho.",
    "Suma uno más.",
    "Constancia activada.",
    "Hecho.",
    "Buen paso."
];

const trainingMessages = [
    "Entrenamiento registrado.",
    "Trabajo hecho."
];

export const useCelebration = () => {
    const { user } = useAuth();
    const lastMessageIndex = useRef(-1);

    const getRandomMessage = (messages: string[]): string => {
        let index;
        do {
            index = Math.floor(Math.random() * messages.length);
        } while (index === lastMessageIndex.current && messages.length > 1);

        lastMessageIndex.current = index;
        return messages[index];
    };

    const detectStreak = async (habitId: string, date: string): Promise<number> => {
        if (!user) return 0;

        try {
            const completionsRef = collection(db, 'habitCompletions');
            const sevenDaysAgo = new Date(date);
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

            const q = query(
                completionsRef,
                where('userId', '==', user.uid),
                where('habitId', '==', habitId)
            );

            const snapshot = await getDocs(q);
            const completions = snapshot.docs
                .map(doc => doc.data())
                .filter(c => c.completed && c.date >= sevenDaysAgo.toISOString().split('T')[0])
                .sort((a, b) => b.date.localeCompare(a.date));

            // Count consecutive days backwards from today
            let streak = 0;
            const currentDate = new Date(date);

            for (let i = 0; i < 7; i++) {
                const checkDate = new Date(currentDate);
                checkDate.setDate(checkDate.getDate() - i);
                const dateStr = checkDate.toISOString().split('T')[0];

                const hasCompletion = completions.some(c => c.date === dateStr);
                if (!hasCompletion) break;
                streak++;
            }

            return streak;
        } catch (error) {
            console.error('Error detecting streak:', error);
            return 0;
        }
    };

    const detectTrainingProgress = async (habitId: string): Promise<{ improved: boolean; exerciseName?: string }> => {
        if (!user) return { improved: false };

        try {
            const routinesRef = collection(db, 'routines');
            // Simple query to avoid composite index requirement
            const q = query(
                routinesRef,
                where('userId', '==', user.uid)
            );

            const snapshot = await getDocs(q);

            // Filter and sort client-side
            const routines = snapshot.docs
                .map(doc => doc.data())
                .filter(r => r.habitId === habitId)
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 2);

            if (routines.length < 2) return { improved: false };

            const [current, previous] = routines;

            // Find common exercises and compare max weights
            const currentExercises = current.exercises || [];
            const previousExercises = previous.exercises || [];

            for (const currEx of currentExercises) {
                const prevEx = previousExercises.find((e: any) => e.name === currEx.name);
                if (!prevEx) continue;

                const currMaxWeight = Math.max(...(currEx.sets?.map((s: any) => parseFloat(s.weight) || 0) || [0]));
                const prevMaxWeight = Math.max(...(prevEx.sets?.map((s: any) => parseFloat(s.weight) || 0) || [0]));

                if (currMaxWeight > prevMaxWeight) {
                    return { improved: true, exerciseName: currEx.name };
                }
            }

            return { improved: false };
        } catch (error) {
            console.error('Error detecting training progress:', error);
            return { improved: false };
        }
    };

    const getCelebration = async (context: CelebrationContext): Promise<CelebrationResult> => {
        // Priority 1: Day Complete
        if (context.completedHabitsForDay >= context.totalHabitsForDay) {
            return {
                message: "Día completo. Buen trabajo.",
                icon: 'check-circle',
                type: 'day-complete'
            };
        }

        // Priority 2: Training with Progress
        if (context.habitType === 'exercise' || context.habitType === 'training') {
            const { improved, exerciseName } = await detectTrainingProgress(context.habitId);

            if (improved && exerciseName) {
                return {
                    message: `Nuevo mejor registro en ${exerciseName}`,
                    icon: 'trending-up',
                    type: 'training'
                };
            }

            // Base training message
            return {
                message: getRandomMessage(trainingMessages),
                icon: 'check-circle',
                type: 'training'
            };
        }

        // Priority 3: Streak
        const streak = await detectStreak(context.habitId, context.date);
        if (streak >= 2) {
            let message = "La racha continúa.";
            if (streak >= 7) {
                message = "Constancia sólida.";
            } else if (streak >= 4) {
                message = "Buen ritmo.";
            }

            return {
                message,
                icon: 'local-fire-department',
                type: 'streak'
            };
        }

        // Priority 4: Base celebration
        return {
            message: getRandomMessage(baseCelebrations),
            icon: 'check-circle',
            type: 'base'
        };
    };

    return { getCelebration };
};
