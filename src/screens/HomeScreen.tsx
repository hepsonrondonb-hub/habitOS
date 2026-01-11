import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, DateStrip, InsightCard, HomeHabitCard, FAB } from '../design-system/components';
import { CheckInAccordion } from '../components/CheckInAccordion';
import { colors, spacing } from '../design-system/tokens';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAvatarSource } from '../utils/avatars';
import { useSignalsCatalog } from '../hooks/useCatalog';
import { MaterialIcons } from '@expo/vector-icons';

interface Habit {
    id: string;
    userId: string;
    name: string;
    type: 'simple' | 'training' | 'exercise';
    icon: string;
    category: string;
    frequency?: number[]; // [0-6] Mon-Sun
    isActive: boolean;
    objectiveId?: string;
    scheduleText?: string; // e.g. "15 min · Durante el dia"
}

interface Objective {
    id: string;
    userId: string;
    objectiveType: string;
    active: boolean;
    createdAt?: any;
}

interface ProgressSignal {
    id: string;
    userId: string;
    objectiveId: string;
    signalId: string;
    frequency?: 'daily' | 'weekly' | '2-3_weekly';
}

interface CheckIn {
    id: string;
    userId: string;
    objectiveId: string;
    signalId: string;
    value: number;
    date: string;
}

const OBJECTIVE_CONFIG: Record<string, { label: string; color: string }> = {
    energy: { label: 'Energía', color: '#F59E0B' },
    fitness: { label: 'Cond. Física', color: '#3B82F6' },
    calm: { label: 'Calma', color: '#8B5CF6' },
    focus: { label: 'Enfoque', color: '#10B981' },
    sleep: { label: 'Sueño', color: '#6366F1' },
    consistency: { label: 'Constancia', color: '#EC4899' },
};

const INSIGHTS = [
    "Un pequeño paso hoy vale más que un plan perfecto.",
    "La constancia vence a la intensidad.",
    "Céntrate en lo que puedes controlar hoy.",
    "Escucha a tu cuerpo, es tu mejor guía.",
    "Cada acción cuenta, por pequeña que sea."
];

export const HomeScreen = () => {
    const { user, userProfile, refreshProfile } = useAuth();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Force profile refresh when focusing screen (e.g. returning from EditProfile)
    useFocusEffect(
        React.useCallback(() => {
            refreshProfile();
        }, [])
    );

    // State
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activeObjective, setActiveObjective] = useState<Objective | null>(null);
    const [allActiveObjectives, setAllActiveObjectives] = useState<Objective[]>([]);

    // Data Lists
    const [habits, setHabits] = useState<Habit[]>([]);
    const [completions, setCompletions] = useState<Record<string, boolean>>({});

    // Check-in State
    const [signals, setSignals] = useState<ProgressSignal[]>([]);
    const [currentSignalQuestion, setCurrentSignalQuestion] = useState<{ signalId: string, question: string } | null>(null);
    const [isCheckInCompleted, setIsCheckInCompleted] = useState(false);

    const [loading, setLoading] = useState(true);
    const [insight] = useState(INSIGHTS[Math.floor(Math.random() * INSIGHTS.length)]);

    // Catalog Hooks
    const { signals: catalogSignals } = useSignalsCatalog(activeObjective?.objectiveType || null);

    // Helpers
    const getDateKey = (date: Date) => date.toISOString().split('T')[0];
    const isToday = (date: Date) => getDateKey(date) === getDateKey(new Date());
    const isDateReadonly = !isToday(selectedDate);

    // Load Objectives (Once + Focus)
    useFocusEffect(
        React.useCallback(() => {
            if (!user) return;

            const loadObjectives = async () => {
                try {
                    setLoading(true);
                    const q = query(
                        collection(db, 'user_objectives'),
                        where('userId', '==', user.uid),
                        where('active', '==', true)
                    );
                    const snapshot = await getDocs(q);
                    const loadedObjectives = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Objective[];

                    // Sort by creation time if available, or just keeping order
                    // Assuming created_at is strictly handled, but for now simple list is fine.

                    setAllActiveObjectives(loadedObjectives);

                    if (loadedObjectives.length > 0 && !activeObjective) {
                        setActiveObjective(loadedObjectives[0]);
                    } else if (loadedObjectives.length === 0) {
                        // Handle empty state if needed?
                        // If no objectives, maybe empty habits?
                        // Fallback logic from previous version was good, but let's stick to simple first.
                    }
                } catch (e) {
                    console.error("Error loading objectives", e);
                } finally {
                    setLoading(false);
                }
            };

            loadObjectives();
        }, [user])
    );

    // Load Habits and Signals when Active Objective or User changes
    useEffect(() => {
        if (!user || !activeObjective) return;

        const loadContextData = async () => {
            setLoading(true);
            try {
                // 1. Load Habits
                const habitsQ = query(
                    collection(db, 'habits'),
                    where('userId', '==', user.uid),
                    where('objectiveId', '==', activeObjective.id),
                    where('isActive', '==', true)
                );
                const habitsSnap = await getDocs(habitsQ);
                const loadedHabits = habitsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Habit[];
                console.log('DEBUG: Active Objective:', activeObjective.objectiveType, activeObjective.id);
                console.log('DEBUG: Fetched Habits Count:', loadedHabits.length);
                if (loadedHabits.length > 0) {
                    console.log('DEBUG: First Habit:', JSON.stringify(loadedHabits[0], null, 2));
                }
                setHabits(loadedHabits);

                // 2. Load Signals (User's specific implementations)
                const signalsQ = query(
                    collection(db, 'progress_signals'),
                    where('userId', '==', user.uid),
                    where('objectiveId', '==', activeObjective.id)
                );
                const signalsSnap = await getDocs(signalsQ);
                const loadedSignals = signalsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProgressSignal[];
                setSignals(loadedSignals);
            } catch (e) {
                console.error("Error loading context data", e);
            } finally {
                setLoading(false);
            }
        };

        loadContextData();
    }, [user, activeObjective]);

    // Load Completions and CheckIn Status when Date or Habits/Signals change
    useEffect(() => {
        if (!user || !activeObjective) return;

        const loadDailyData = async () => {
            const dateKey = getDateKey(selectedDate);

            // 1. Load Habit Completions
            try {
                const completionsQ = query(
                    collection(db, 'habitCompletions'),
                    where('userId', '==', user.uid),
                    where('date', '==', dateKey)
                );
                const compSnap = await getDocs(completionsQ);
                const compMap: Record<string, boolean> = {};
                compSnap.docs.forEach(doc => {
                    const d = doc.data();
                    if (d.habitId) compMap[d.habitId] = d.completed;
                });
                setCompletions(compMap);
            } catch (e) {
                console.error("Error loading completions", e);
            }

            // 2. Check-In Logic
            if (!isToday(selectedDate)) {
                setCurrentSignalQuestion(null);
                setIsCheckInCompleted(false); // Or true? Just hide it.
                return;
            }

            try {
                const checkInQ = query(
                    collection(db, 'check_ins'),
                    where('userId', '==', user.uid),
                    where('objectiveId', '==', activeObjective.id),
                    where('date', '==', dateKey)
                );
                const checkInSnap = await getDocs(checkInQ);
                const hasCheckIn = !checkInSnap.empty;

                setIsCheckInCompleted(hasCheckIn);

                if (!hasCheckIn && signals.length > 0) {
                    // Decide which signal to ask
                    // F4 Rules: 
                    // 1. Frequency check
                    // 2. Oldest missing (Simplified -> First matching rules)

                    let signalToAsk = null;
                    const dayOfWeek = selectedDate.getDay(); // 0(Sun) - 6(Sat)

                    for (const signal of signals) {
                        const catalogDef = catalogSignals.find(s => s.id === signal.signalId);
                        const frequency = catalogDef?.frequency || 'daily';

                        let shouldAsk = false;
                        if (frequency === 'daily') shouldAsk = true;
                        if (frequency === 'weekly' && dayOfWeek === 1) shouldAsk = true; // Monday
                        if (frequency === '2-3_weekly' && [1, 3, 5].includes(dayOfWeek)) shouldAsk = true; // M, W, F (Simplified 3x)

                        if (shouldAsk) {
                            signalToAsk = {
                                signalId: signal.signalId,
                                question: catalogDef?.question || "¿Cómo te sientes hoy?"
                            };
                            break; // Pick the first one that matches
                        }
                    }
                    setCurrentSignalQuestion(signalToAsk);
                } else {
                    setCurrentSignalQuestion(null);
                }

            } catch (e) {
                console.error("Error loading daily check-ins", e);
            }
        };

        loadDailyData();
    }, [user, activeObjective, selectedDate, signals, catalogSignals]);


    // Handlers
    const handleToggleAction = async (habitId: string) => {
        if (!user || isDateReadonly) return;

        const dateKey = getDateKey(selectedDate);
        const completionId = `${user.uid}_${dateKey}_${habitId}`;
        const isCompleted = completions[habitId];

        // Optimistic
        setCompletions(prev => ({ ...prev, [habitId]: !isCompleted }));

        try {
            const ref = doc(db, 'habitCompletions', completionId);
            if (isCompleted) {
                await deleteDoc(ref);
            } else {
                await setDoc(ref, {
                    userId: user.uid,
                    habitId,
                    date: dateKey,
                    completed: true,
                    timestamp: serverTimestamp()
                });
            }
        } catch (e) {
            console.error("Error toggling action", e);
            setCompletions(prev => ({ ...prev, [habitId]: isCompleted })); // Revert
        }
    };

    const handleSaveCheckIn = async (value: number) => {
        if (!user || !activeObjective || !currentSignalQuestion) return;

        setIsCheckInCompleted(true); // Optimistic hide

        try {
            await addDoc(collection(db, 'check_ins'), {
                userId: user.uid,
                objectiveId: activeObjective.id,
                signalId: currentSignalQuestion.signalId,
                value,
                date: getDateKey(selectedDate),
                timestamp: serverTimestamp()
            });
        } catch (e) {
            console.error("Error saving checkin", e);
            setIsCheckInCompleted(false); // Revert
        }
    };

    // Filter Habits for UI
    const displayedHabits = habits.filter(h => {
        // Filter by day of week if frequency exists
        if (!h.frequency || h.frequency.length === 0) return true;
        const jsDay = selectedDate.getDay();
        const appDayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 ... Sun=6
        const included = h.frequency.includes(appDayIndex);
        if (!included) console.log(`DEBUG: Hiding habit ${h.name} because today (${appDayIndex}) is not in frequency`, h.frequency);
        return included;
    });

    console.log('DEBUG: Displayed Habits Count:', displayedHabits.length);

    const userName = userProfile?.firstName || userProfile?.name?.split(' ')[0] || user?.displayName?.split(' ')[0] || '';

    // Greeting Logic
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Buenos días';
        if (hour < 20) return 'Buenas tardes';
        return 'Buenas noches';
    };

    const greeting = userName ? `${getGreeting()}, ${userName}` : getGreeting();

    // UI Helpers
    const getObjectiveLabel = (type: string) => OBJECTIVE_CONFIG[type]?.label || type;
    const getObjectiveColor = (type: string) => OBJECTIVE_CONFIG[type]?.color || colors.primary;

    return (
        <AppScreen safeArea backgroundColor={colors.background}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText variant="caption" color={colors.textSecondary}>
                        {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}
                    </AppText>
                    <AppText variant="heading" style={styles.greeting}>
                        {greeting}
                    </AppText>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <Image source={getAvatarSource(userProfile?.avatarId as any)} style={styles.avatar} />
                </TouchableOpacity>
            </View>

            {/* Objectives Chips */}
            <View style={styles.chipsContainer}>
                <AppText variant="caption" style={styles.sectionTitle}>Tus objetivos activos</AppText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
                    {allActiveObjectives.map(obj => {
                        const isActive = activeObjective?.id === obj.id;
                        const color = getObjectiveColor(obj.objectiveType);
                        return (
                            <TouchableOpacity
                                key={obj.id}
                                style={[
                                    styles.chip,
                                    isActive ? { backgroundColor: color, borderColor: color } : styles.chipInactive
                                ]}
                                onPress={() => setActiveObjective(obj)}
                            >
                                <MaterialIcons
                                    name={isActive ? "bolt" : "radio-button-unchecked"}
                                    size={16}
                                    color={isActive ? "#FFF" : colors.textSecondary}
                                    style={{ marginRight: 6 }}
                                />
                                <AppText
                                    style={{
                                        color: isActive ? "#FFF" : colors.textSecondary,
                                        fontWeight: isActive ? '600' : '400'
                                    }}
                                >
                                    {getObjectiveLabel(obj.objectiveType)}
                                </AppText>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>

            {/* Date Carousel */}
            <DateStrip
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                maxDate={new Date()} // Block future dates
            />

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Dynamic Title */}
                <AppText variant="subheading" style={styles.dynamicTitle}>
                    Acciones para {activeObjective ? getObjectiveLabel(activeObjective.objectiveType) : 'hoy'}
                </AppText>

                {/* Habits List */}
                <View style={styles.habitsList}>
                    {displayedHabits.length > 0 ? (
                        displayedHabits.map(habit => {
                            console.log('Rendering habit:', habit.name, 'Type:', habit.type, 'IsTraining:', habit.type === 'training');
                            return (
                                <HomeHabitCard
                                    key={habit.id}
                                    name={habit.name}
                                    type={habit.type}
                                    icon={habit.icon}
                                    description={habit.scheduleText || "Durante el día"}
                                    completed={!!completions[habit.id]}
                                    readOnly={isDateReadonly}
                                    onToggle={() => handleToggleAction(habit.id)}
                                    onEdit={(habit.type === 'training' || habit.type === 'exercise') ? () => navigation.navigate('LogWorkout', { habitId: habit.id }) : undefined}
                                />
                            );
                        })
                    ) : (
                        <View style={styles.emptyState}>
                            <AppText variant="body" color={colors.textSecondary}>
                                No hay acciones programadas.
                            </AppText>
                        </View>
                    )}
                </View>

                {/* Check-In Section */}
                {isToday(selectedDate) && !isCheckInCompleted && currentSignalQuestion && (
                    <CheckInAccordion
                        question={currentSignalQuestion.question}
                        onSave={handleSaveCheckIn}
                        minLabel="Bajo"
                        maxLabel="Alto"
                    />
                )}

                {isCheckInCompleted && isToday(selectedDate) && (
                    <View style={styles.checkInCompleted}>
                        <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                        <AppText style={{ marginLeft: 8, color: colors.primary, fontWeight: '500' }}>
                            Check-in registrado
                        </AppText>
                    </View>
                )}

                {/* Insight Card */}
                <InsightCard
                    title="Insight del día" // Could be cleaner
                    subtitle={insight}
                />

                <View style={{ height: 100 }} />
            </ScrollView>

            <FAB
                onAddAction={() => navigation.navigate('CreateHabit', {
                    objectiveId: activeObjective?.id,
                    objectiveType: activeObjective?.objectiveType
                })}
                onCreatePlan={() => navigation.navigate('Onboarding2Identity', { resultIntent: 'NEW_PLAN' } as any)}
            />
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        marginBottom: spacing.md,
    },
    greeting: {
        fontSize: 22,
        fontWeight: '700',
        marginTop: 4,
    },
    avatar: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#E5E7EB',
    },
    chipsContainer: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.xs,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    chipsScroll: {
        paddingHorizontal: spacing.lg,
        gap: spacing.sm,
        paddingBottom: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    chipInactive: {
        borderColor: '#E5E7EB',
        backgroundColor: '#FFF',
    },
    dynamicTitle: {
        marginTop: spacing.sm,
        marginBottom: spacing.md,
        fontWeight: '700',
        fontSize: 18,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    habitsList: {
        marginBottom: spacing.lg,
    },
    emptyState: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 12,
    },
    checkInCompleted: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.md,
        backgroundColor: '#EFF6FF',
        borderRadius: 12,
        marginBottom: spacing.lg,
    }
});
