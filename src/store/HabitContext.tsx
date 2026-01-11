import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from './AuthContext';

// Simplified Habit Type for Onboarding
export type Habit = {
    id: string;
    name: string;
    type: 'simple' | 'exercise';
    icon: string;
    selectedDays: number[]; // 0-6
    active?: boolean; // Default true
};

// Training Types
export type TrainingSet = {
    id: string;
    reps: string; // using string for input ease
    weight: string;
    completed: boolean;
};

export type TrainingExercise = {
    id: string;
    name: string;
    muscleGroup: string;
    sets: TrainingSet[];
};

export type TrainingSession = {
    habitId: string;
    date: string;
    exercises: TrainingExercise[];
};

export type Routine = {
    id: string;
    habitId: string;
    date: string;
    name: string;
    type: 'Fuerza' | 'Cardio';
    focus?: string;
    durationMinutes?: string;
    exercises: TrainingExercise[];
};

// Map: DateString (YYYY-MM-DD) -> { HabitID: Routine }
type RoutineMap = {
    [date: string]: {
        [habitId: string]: Routine;
    }
};

// Map: DateString (YYYY-MM-DD) -> { HabitID: boolean }
type CompletionMap = {
    [date: string]: {
        [habitId: string]: boolean;
    }
};

type HabitContextType = {
    userHabits: Habit[];
    setUserHabits: (habits: Habit[]) => void;
    completions: CompletionMap;
    toggleHabit: (habitId: string, date: string) => void;
    getHabitStatus: (habitId: string, date: string) => boolean;
    addHabit: (habit: Habit) => void;
    logSession: (session: TrainingSession) => void;
    // Routine Logic
    routines: RoutineMap;
    getRoutine: (habitId: string, date: string) => Routine | undefined;
    saveRoutine: (routine: Routine) => void;
    toggleHabitActive: (habitId: string) => void;
};

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const [userHabits, setUserHabits] = useState<Habit[]>([]);
    const [completions, setCompletions] = useState<CompletionMap>({});
    const [routines, setRoutines] = useState<RoutineMap>({});

    // Load routines from Firestore when user logs in
    useEffect(() => {
        if (!user) return;

        const loadRoutines = async () => {
            try {
                const routinesRef = collection(db, 'routines');
                const q = query(routinesRef, where('userId', '==', user.uid));
                const snapshot = await getDocs(q);

                const loadedRoutines: RoutineMap = {};
                snapshot.forEach(docSnap => {
                    const routine = docSnap.data() as Routine;
                    if (!loadedRoutines[routine.date]) {
                        loadedRoutines[routine.date] = {};
                    }
                    loadedRoutines[routine.date][routine.habitId] = routine;
                });

                setRoutines(loadedRoutines);
                console.log('Loaded routines from Firestore:', Object.keys(loadedRoutines).length, 'dates');
            } catch (error) {
                console.error('Error loading routines from Firestore:', error);
            }
        };

        loadRoutines();
    }, [user]);

    const addHabit = (habit: Habit) => {
        // Ensure new habits are active by default
        setUserHabits(prev => [...prev, { ...habit, active: true }]);
    };

    const toggleHabitActive = (habitId: string) => {
        setUserHabits(prev => prev.map(h =>
            h.id === habitId ? { ...h, active: !h.active } : h
        ));
    };

    const logSession = (session: TrainingSession) => {
        // Keeps compatibility but we will move to saveRoutine
        toggleHabit(session.habitId, session.date);
        console.log('Session Logged:', JSON.stringify(session, null, 2));
    };

    // Routine Methods
    const getRoutine = (habitId: string, date: string) => {
        return routines[date]?.[habitId];
    };

    const saveRoutine = async (routine: Routine) => {
        // Save to local state for immediate UI update
        setRoutines(prev => {
            const dayRoutines = prev[routine.date] || {};
            return {
                ...prev,
                [routine.date]: {
                    ...dayRoutines,
                    [routine.habitId]: routine
                }
            };
        });

        console.log('Routine Saved to State:', JSON.stringify(routine, null, 2));

        // Save to Firestore
        try {
            const routineRef = doc(db, 'routines', `${routine.habitId}_${routine.date}`);
            await setDoc(routineRef, {
                ...routine,
                userId: user?.uid,
                updatedAt: new Date().toISOString()
            });
            console.log('Routine Saved to Firestore:', routine.id);
        } catch (error) {
            console.error('Error saving routine to Firestore:', error);
        }
    };

    const toggleHabit = (habitId: string, date: string) => {
        setCompletions(prev => {
            const dayCompletions = prev[date] || {};
            return {
                ...prev,
                [date]: {
                    ...dayCompletions,
                    [habitId]: !dayCompletions[habitId]
                }
            };
        });
    };

    const getHabitStatus = (habitId: string, date: string) => {
        return completions[date]?.[habitId] || false;
    };

    return (
        <HabitContext.Provider value={{
            userHabits,
            setUserHabits,
            completions,
            toggleHabit,
            getHabitStatus,
            addHabit,
            logSession,
            routines,
            getRoutine,
            saveRoutine,
            toggleHabitActive
        }}>
            {children}
        </HabitContext.Provider>
    );
};

export const useHabitContext = () => {
    const context = useContext(HabitContext);
    if (!context) {
        throw new Error('useHabitContext must be used within a HabitProvider');
    }
    return context;
};
