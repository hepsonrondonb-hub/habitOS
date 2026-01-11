import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboarding } from '../store/OnboardingContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding5Baseline'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding5Baseline'>;

type Objective = 'energy' | 'calm' | 'focus' | 'sleep' | 'fitness' | 'consistency';

const OBJECTIVE_LABELS: Record<Objective, string> = {
    energy: 'energía',
    calm: 'calma',
    focus: 'enfoque',
    sleep: 'sueño',
    fitness: 'estado físico',
    consistency: 'constancia'
};

const SCALE_LABELS = [
    { value: 1, label: 'Muy bajo' },
    { value: 2, label: 'Bajo' },
    { value: 3, label: 'Medio' },
    { value: 4, label: 'Alto' },
    { value: 5, label: 'Muy alto' }
];

export const Onboarding5BaselineScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
    const { setBaseline } = useOnboarding();

    const objective: Objective = (route.params?.objective as Objective) || 'energy';
    const signals = route.params?.signals || [];
    const objectiveLabel = OBJECTIVE_LABELS[objective];

    const handleContinue = () => {
        if (!selectedLevel) return;

        // Save baseline to context
        setBaseline(selectedLevel);

        navigation.navigate('Onboarding6Actions', {
            objective,
            signals,
            baseline: selectedLevel,
            resultIntent: route.params?.resultIntent // Propagate intent
        } as any);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.progressBarWrapper}>
                    <ProgressBar currentStep={5} totalSteps={8} />
                </View>
            </View>

            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <AppText variant="heading" centered style={styles.title}>
                        Tu nivel actual de {objectiveLabel}
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        Esto nos ayuda a medir progreso real en el tiempo.
                    </AppText>
                </View>

                {/* Question */}
                <AppText variant="subheading" centered style={styles.question}>
                    Hoy, ¿cómo describirías tu nivel de {objectiveLabel}?
                </AppText>

                {/* Scale */}
                <View style={styles.scaleContainer}>
                    {SCALE_LABELS.map((item) => (
                        <TouchableOpacity
                            key={item.value}
                            style={[
                                styles.scaleButton,
                                selectedLevel === item.value && styles.scaleButtonSelected
                            ]}
                            onPress={() => setSelectedLevel(item.value)}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.scaleCircle,
                                selectedLevel === item.value && styles.scaleCircleSelected
                            ]}>
                                <AppText
                                    variant="subheading"
                                    style={[
                                        styles.scaleNumber,
                                        selectedLevel === item.value && styles.scaleNumberSelected
                                    ]}
                                >
                                    {item.value}
                                </AppText>
                            </View>
                            <AppText
                                variant="caption"
                                centered
                                color={selectedLevel === item.value ? colors.primary : colors.textSecondary}
                                style={styles.scaleLabel}
                            >
                                {item.label}
                            </AppText>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Microcopy */}
                <View style={styles.microcopyContainer}>
                    <AppText variant="caption" centered color={colors.textSecondary} style={styles.microcopy}>
                        No es un juicio. Es solo tu punto de partida.
                    </AppText>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label="Guardar nivel actual"
                        onPress={handleContinue}
                        disabled={!selectedLevel}
                    />
                </View>
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
    progressBarWrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    header: {
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        marginBottom: spacing.md,
    },
    subtitle: {
        fontSize: 15,
        lineHeight: 22,
    },
    question: {
        fontSize: 17,
        marginBottom: spacing.xxl,
    },
    scaleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
        paddingHorizontal: spacing.xs,
    },
    scaleButton: {
        alignItems: 'center',
        flex: 1,
    },
    scaleButtonSelected: {
        // Style applied when button is selected (currently no additional styles needed)
    },
    scaleCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.surface,
        borderWidth: 2,
        borderColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    scaleCircleSelected: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    scaleNumber: {
        fontSize: 20,
        fontWeight: '700',
    },
    scaleNumberSelected: {
        color: colors.surface,
    },
    scaleLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    microcopyContainer: {
        marginBottom: spacing.xxl,
    },
    microcopy: {
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
