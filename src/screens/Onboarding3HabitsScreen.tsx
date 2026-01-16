import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding3Habits'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding3Habits'>;

type Intent = 'energy' | 'calm' | 'focus' | 'sleep' | 'fitness' | 'consistency';

interface SuggestedHabit {
    id: string;
    name: string;
    time: string;
    icon: string;
}

const HABIT_SUGGESTIONS: Record<Intent, SuggestedHabit[]> = {
    energy: [
        { id: 'energy_1', name: 'Beber agua al despertar', time: 'Al despertar', icon: 'water-drop' },
        { id: 'energy_2', name: 'Caminar 10 minutos', time: 'En la mañana', icon: 'directions-walk' },
        { id: 'energy_3', name: 'Exponerse a luz natural', time: 'Primeros 30 min del día', icon: 'wb-sunny' }
    ],
    calm: [
        { id: 'calm_1', name: 'Respirar consciente 3 minutos', time: 'Cuando lo necesites', icon: 'air' },
        { id: 'calm_2', name: 'Meditar 5 minutos', time: 'En la mañana', icon: 'self-improvement' },
        { id: 'calm_3', name: 'Escribir algo que agradeces', time: 'Antes de dormir', icon: 'edit-note' }
    ],
    focus: [
        { id: 'focus_1', name: 'Definir 1 prioridad del día', time: 'Al empezar el día', icon: 'flag' },
        { id: 'focus_2', name: 'Trabajar 25 min sin interrupciones', time: 'Cuando trabajes', icon: 'timer' },
        { id: 'focus_3', name: 'Alejar el teléfono al trabajar', time: 'Durante trabajo profundo', icon: 'phonelink-off' }
    ],
    sleep: [
        { id: 'sleep_1', name: 'Apagar pantallas 30 min antes', time: 'Antes de dormir', icon: 'phone-disabled' },
        { id: 'sleep_2', name: 'Acostarse a la misma hora', time: 'Todas las noches', icon: 'schedule' },
        { id: 'sleep_3', name: 'Leer antes de dormir', time: '10-15 minutos', icon: 'menu-book' }
    ],
    fitness: [
        { id: 'fitness_1', name: 'Entrenamiento ligero 20-30 min', time: 'En la mañana o tarde', icon: 'fitness-center' },
        { id: 'fitness_2', name: 'Caminar rápido', time: '15-20 minutos', icon: 'directions-run' },
        { id: 'fitness_3', name: 'Rutina básica de fuerza', time: '3 veces por semana', icon: 'sports-gymnastics' }
    ],
    consistency: [
        { id: 'consistency_1', name: 'Cumplir 1 acción aunque sea mínima', time: 'Todos los días', icon: 'check-circle' },
        { id: 'consistency_2', name: 'Revisar acciones al final del día', time: 'Antes de dormir', icon: 'fact-check' },
        { id: 'consistency_3', name: 'No romper la racha dos días seguidos', time: 'Siempre', icon: 'trending-up' }
    ]
};

export const Onboarding3HabitsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const [selectedHabits, setSelectedHabits] = useState<string[]>([]);

    // Get habits based on selected intent
    const intent: Intent = (route.params?.intent as Intent) || 'energy';
    const suggestedHabits = HABIT_SUGGESTIONS[intent];

    const toggleHabit = (id: string) => {
        setSelectedHabits(prev =>
            prev.includes(id)
                ? prev.filter(h => h !== id)
                : [...prev, id]
        );
    };

    const handleContinue = () => {
        const selected = suggestedHabits.filter((h: SuggestedHabit) => selectedHabits.includes(h.id));
        navigation.navigate('Onboarding4Account', {
            intent: route.params?.intent,
            selectedHabits: selected
        });
    };

    const handleSkip = () => {
        navigation.navigate('Onboarding4Account', {
            intent: route.params?.intent,
            selectedHabits: []
        });
    };

    const handleBack = () => {
        navigation.goBack();
    };

    const handleCreateCustomHabit = () => {
        navigation.navigate({
            name: 'CreateHabit',
            params: {}
        } as any);
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="caption" color={colors.textSecondary}>Paso 3 de 6</AppText>
            </View>

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <AppText variant="heading" centered style={styles.title}>
                        Empieza por algo pequeño
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        Lo importante no es hacer mucho. Es sostenerlo.
                    </AppText>
                </View>

                {/* Suggested Habits */}
                <View style={styles.habitsContainer}>
                    {suggestedHabits.map((habit: SuggestedHabit) => (
                        <TouchableOpacity
                            key={habit.id}
                            style={[
                                styles.habitCard,
                                selectedHabits.includes(habit.id) && styles.habitCardSelected
                            ]}
                            onPress={() => toggleHabit(habit.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.habitIcon}>
                                <MaterialIcons
                                    name={habit.icon as any}
                                    size={24}
                                    color={selectedHabits.includes(habit.id) ? colors.primary : colors.textSecondary}
                                />
                            </View>
                            <View style={styles.habitInfo}>
                                <AppText variant="subheading" style={styles.habitName}>
                                    {habit.name}
                                </AppText>
                                <AppText variant="caption" color={colors.textSecondary}>
                                    {habit.time}
                                </AppText>
                            </View>
                            <View style={styles.checkbox}>
                                {selectedHabits.includes(habit.id) ? (
                                    <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                                ) : (
                                    <MaterialIcons name="radio-button-unchecked" size={24} color={colors.textSecondary} />
                                )}
                            </View>
                        </TouchableOpacity>
                    ))}

                    {/* Create Custom Habit */}
                    <TouchableOpacity
                        style={styles.createHabitButton}
                        onPress={handleCreateCustomHabit}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
                        <AppText variant="subheading" style={styles.createHabitText}>
                            Crear acción propia
                        </AppText>
                    </TouchableOpacity>
                </View>

                <View style={{ height: 180 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                    <AppText variant="body" color={colors.textSecondary}>
                        Saltar
                    </AppText>
                </TouchableOpacity>
                <PrimaryButton
                    label="Continuar"
                    onPress={handleContinue}
                />
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        gap: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    header: {
        marginTop: spacing.xl,
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: 24,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    habitsContainer: {
        gap: spacing.md,
    },
    habitCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    habitCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    habitIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    habitInfo: {
        flex: 1,
    },
    habitName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    checkbox: {
        marginLeft: spacing.sm,
    },
    createHabitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: colors.primary,
        borderStyle: 'dashed',
        gap: spacing.sm,
    },
    createHabitText: {
        color: colors.primary,
        fontWeight: '600',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
        gap: spacing.md,
    },
    skipButton: {
        alignItems: 'center',
        paddingVertical: spacing.sm,
    }
});
