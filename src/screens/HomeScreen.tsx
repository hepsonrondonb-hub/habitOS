import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, DateStrip, InsightCard, HomeHabitCard, FAB } from '../design-system/components';
import { AvitioLogo } from '../design-system/components/Branding/AvitioLogo';
import { CheckInAccordion } from '../components/CheckInAccordion';
import { colors, spacing } from '../design-system/tokens';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAvatarSource } from '../utils/avatars';
import { useSignalsCatalog } from '../hooks/useCatalog';
import { MaterialIcons } from '@expo/vector-icons';
import { Action, FrequencyType } from '../types/Action';
import { isActionDue, getPeriodKey, getActionState } from '../utils/actionLogic';

// Local Habit interface removed in favor of Action import
// We might need to map existing data to Action if fields are missing, but we handle that in fetch.

interface Objective {
    id: string;
    userId: string;
    objectiveType: string;
    title?: string; // Custom title
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
    energy: { label: 'Energía', color: '#EAB308' }, // Warm Yellow
    fitness: { label: 'Cond. Física', color: '#0D9488' }, // Teal
    calm: { label: 'Calma', color: '#8B5CF6' }, // Violet
    focus: { label: 'Enfoque', color: '#059669' }, // Emerald
    sleep: { label: 'Sueño', color: '#4F46E5' }, // Indigo
    consistency: { label: 'Constancia', color: '#DB2777' }, // Pink
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
    const [habits, setHabits] = useState<Action[]>([]);
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
    // Load Habits and Signals when Active Objective or User changes
    useEffect(() => {
        if (!user || !activeObjective) return;

        const loadContextData = async () => {
            setLoading(true);
            try {
                // 1. Load Actions (formerly Habits)
                const habitsQ = query(
                    collection(db, 'habits'),
                    where('userId', '==', user.uid),
                    where('objectiveId', '==', activeObjective.id),
                    where('isActive', '==', true)
                );
                const habitsSnap = await getDocs(habitsQ);
                const loadedActions = habitsSnap.docs.map(doc => {
                    const d = doc.data();
                    // Map legacy fields to new Action type
                    return {
                        id: doc.id,
                        ...d,
                        frequency_type: d.frequency_type || 'daily', // Default to daily
                        frequency_days: d.frequency || [], // Map legacy frequency array to frequency_days
                        completed_count: d.completed_count || 0,
                        createdAt: d.createdAt,
                        active: d.isActive
                    };
                }) as Action[];

                setHabits(loadedActions);

                // 2. Load Signals
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

    // Load Completions and CheckIn Status
    useEffect(() => {
        if (!user || !activeObjective) return;

        const loadDailyData = async () => {
            const dateKey = getDateKey(selectedDate);

            // Calculate Period Keys for the selected date
            const dailyKey = getPeriodKey(selectedDate, 'daily');
            const weeklyKey = getPeriodKey(selectedDate, 'weekly');
            const monthlyKey = getPeriodKey(selectedDate, 'monthly');
            const targetKeys = [dailyKey, weeklyKey, monthlyKey, 'ONCE'];

            // 1. Load Completions
            try {
                const compMap: Record<string, boolean> = {};

                // A) Legacy Completions (Daily only, keyed by date)
                // Only relevant if we are looking at a specific day
                const legacyQ = query(
                    collection(db, 'habitCompletions'),
                    where('userId', '==', user.uid),
                    where('date', '==', dateKey)
                );
                const legacySnap = await getDocs(legacyQ);
                legacySnap.forEach(doc => {
                    const d = doc.data();
                    if (d.habitId) compMap[d.habitId] = d.completed;
                });

                // B) New Action Completions (Keyed by PeriodKey)
                // We fetch all completions for the relevant period keys of this date view
                const newQ = query(
                    collection(db, 'action_completions'),
                    where('userId', '==', user.uid),
                    where('periodKey', 'in', targetKeys)
                );
                // Note: 'in' query supports up to 10 values, we have ~4.

                const newSnap = await getDocs(newQ);
                newSnap.forEach(doc => {
                    const d = doc.data();
                    if (d.actionId) compMap[d.actionId] = true;
                    // Note: This naive mapping works because if it exists in 'targetKeys', it applies to this view.
                    // For example, if I'm viewing today, and I have a weekly completion for this week, it counts.
                });

                setCompletions(compMap);
            } catch (e) {
                console.error("Error loading completions", e);
            }

            // 2. Check-In Logic
            if (!isToday(selectedDate)) {
                setCurrentSignalQuestion(null);
                setIsCheckInCompleted(false);
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

                // ... Signal Logic (Simplified for brevity, keeping existing logic structure)
                if (!hasCheckIn && signals.length > 0) {
                    let signalToAsk = null;
                    const dayOfWeek = selectedDate.getDay();
                    for (const signal of signals) {
                        const catalogDef = catalogSignals.find(s => s.id === signal.signalId);
                        const frequency = catalogDef?.frequency || 'daily';
                        let shouldAsk = false;
                        if (frequency === 'daily') shouldAsk = true;
                        if (frequency === 'weekly' && dayOfWeek === 1) shouldAsk = true;
                        if (frequency === '2-3_weekly' && [1, 3, 5].includes(dayOfWeek)) shouldAsk = true;

                        if (shouldAsk) {
                            signalToAsk = { signalId: signal.signalId, question: catalogDef?.question || "¿Cómo te sientes hoy?" };
                            break;
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

        // Find the action to get its frequency type
        const action = habits.find(h => h.id === habitId);
        if (!action) return;

        const periodKey = getPeriodKey(selectedDate, action.frequency_type);
        const completionId = `${user.uid}_${periodKey}_${habitId}`;
        const isCompleted = completions[habitId];

        // Optimistic Update
        setCompletions(prev => ({ ...prev, [habitId]: !isCompleted }));

        try {
            // We use the new action_completions collection
            // But we also need to respect legacy? 
            // If we write to new collection, the fetcher reads it. Ideally we stick to one.
            // If it was legacy daily habit, we might want to also write to habitCompletions for safety?
            // Let's stick to the new collection as the source of truth for NEW writes.

            const ref = doc(db, 'action_completions', completionId);

            if (isCompleted) {
                await deleteDoc(ref);
                // Also try delete legacy if it exists? (Optional, maybe too much risk of error)
                if (action.frequency_type === 'daily') {
                    const legacyId = `${user.uid}_${getDateKey(selectedDate)}_${habitId}`;
                    await deleteDoc(doc(db, 'habitCompletions', legacyId)).catch(() => { });
                }
            } else {
                await setDoc(ref, {
                    userId: user.uid,
                    actionId: habitId, // Renamed from habitId in new schema, but keeping consistent
                    periodKey: periodKey,
                    completedAt: new Date().toISOString(), // ISO String
                    timestamp: serverTimestamp()
                });

                // Double write for Daily legacy compatibility?
                if (action.frequency_type === 'daily') {
                    const legacyId = `${user.uid}_${getDateKey(selectedDate)}_${habitId}`;
                    await setDoc(doc(db, 'habitCompletions', legacyId), {
                        userId: user.uid,
                        habitId,
                        date: getDateKey(selectedDate),
                        completed: true,
                        timestamp: serverTimestamp()
                    }).catch(() => { });
                }
            }
        } catch (e) {
            console.error("Error toggling action", e);
            setCompletions(prev => ({ ...prev, [habitId]: isCompleted })); // Revert
        }
    };

    // ... CheckIn Handler ...
    const handleSaveCheckIn = async (value: number) => {
        if (!user || !activeObjective || !currentSignalQuestion) return;
        setIsCheckInCompleted(true);
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
            setIsCheckInCompleted(false);
        }
    };

    // Filter Actions for UI
    const displayedHabits = habits.filter(h => {
        // Use the shared logic
        const state = getActionState(h, selectedDate, completions);
        // We show it if it is DUE or COMPLETED (for this period).
        // If it is 'not_due', we hide it.
        // Example: Daily habit strictly for Mondays, and today is Tuesday -> Hide.

        // However, getActionState relies on 'completions' map which we keyed by ActionID.
        // And isActionDue handles the "is it appropriate to show this today" logic?

        // Re-implement simplified visibility rule:
        // 1. If completed today/this period? Always show as done.
        if (completions[h.id]) return true;

        // 2. If not completed, is it valid for today?
        // Using `isActionDue` logic locally or imported
        if (h.frequency_type === 'daily' && h.frequency_days && h.frequency_days.length > 0) {
            const jsDay = selectedDate.getDay();
            const appDayIndex = jsDay === 0 ? 6 : jsDay - 1; // Mon=0 ... Sun=6 (Our standard)
            if (!h.frequency_days.includes(appDayIndex)) return false;
        }

        // 3. Weekly/Monthly/Once are always "Due" if not done (until archived)
        if (h.frequency_type === 'once' && h.status === 'archived') return false;

        return true;
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
    const getObjectiveLabel = (type: string, title?: string) => title || OBJECTIVE_CONFIG[type]?.label || type;
    const getObjectiveColor = (type: string) => OBJECTIVE_CONFIG[type]?.color || colors.primary;

    return (
        <AppScreen safeArea backgroundColor={colors.background}>
            {/* Header */}
            <View style={styles.header}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <AvitioLogo width={40} height={40} />
                    <View>
                        <AppText variant="heading" style={{ fontSize: 22, lineHeight: 28 }}>Avitio</AppText>
                        <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 11 }}>
                            Design your evolution
                        </AppText>
                    </View>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate('EditProfile')}>
                    <Image source={getAvatarSource(userProfile?.avatarId as any)} style={styles.avatar} />
                </TouchableOpacity>
            </View>

            {/* Welcome / Date Section */}
            <View style={{ paddingHorizontal: spacing.lg, marginBottom: spacing.md }}>
                <AppText variant="caption" color={colors.textSecondary} style={{ textTransform: 'uppercase', fontSize: 11, fontWeight: '700', opacity: 0.7 }}>
                    {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}
                </AppText>
                <AppText variant="heading" style={{ fontSize: 24, marginTop: 4 }}>
                    {greeting}
                </AppText>
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
                                    {(() => {
                                        const label = getObjectiveLabel(obj.objectiveType, obj.title);
                                        if (label.length <= 22) return label;
                                        // Simple truncate for now, user asked for "validation" which might mean shortening
                                        return label.substring(0, 20).trim() + '...';
                                    })()}
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
                    Acciones para {activeObjective ? getObjectiveLabel(activeObjective.objectiveType, activeObjective.title) : 'hoy'}
                </AppText>

                {/* Habits List */}
                <View style={styles.habitsList}>
                    {displayedHabits.length > 0 ? (
                        displayedHabits.map(habit => {
                            // Format dynamic description
                            let desc = habit.description || "Durante el día";
                            if (habit.frequency_type === 'weekly') desc = "Disponible esta semana";
                            if (habit.frequency_type === 'monthly') desc = "Disponible este mes";
                            if (habit.frequency_type === 'once') desc = "Una sola vez";

                            const isSuccess = completions[habit.id];

                            return (
                                <HomeHabitCard
                                    key={habit.id}
                                    name={habit.name}
                                    type={habit.type}
                                    icon={habit.icon}
                                    description={isSuccess ? "¡Completada!" : desc}
                                    completed={!!completions[habit.id]}
                                    readOnly={isDateReadonly}
                                    onToggle={() => handleToggleAction(habit.id)}
                                    // Disable workout log for now or update it?
                                    // For now keep as is, but LogWorkout might need ID update.
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

                <InsightCard
                    title="Insight del día"
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
