import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboarding } from '../store/OnboardingContext';
import { AiService } from '../services/AiService';
import { ActivityIndicator } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding2Period'>;

const PERIOD_OPTIONS = [
    { value: 3, label: '3 meses', defaultFor: ['energy', 'calm', 'focus', 'consistency'] },
    { value: 6, label: '6 meses', defaultFor: ['fitness'] },
    { value: 12, label: '12 meses', defaultFor: [] },
];

export const Onboarding2PeriodScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();
    const { data: onboardingData, setPeriod } = useOnboarding();

    // Default 3, or match logic if needed
    const [selectedPeriod, setSelectedPeriod] = useState<number | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const customGoal = route.params?.customGoal; // Check if coming from Custom Create

    useEffect(() => {
        // Auto-select recommended based on objective if not already selected
        if (!selectedPeriod && onboardingData.objective) {
            const recommended = PERIOD_OPTIONS.find(p => p.defaultFor.includes(onboardingData.objective!));
            if (recommended) {
                setSelectedPeriod(recommended.value);
            } else {
                setSelectedPeriod(3); // Default for custom or others
            }
        }
    }, [onboardingData.objective]);

    const handleContinue = async () => {
        if (!selectedPeriod) return;

        // Custom AI Flow
        if (customGoal) {
            setIsGenerating(true);
            try {
                // Generate plan with context of period
                const plan = await AiService.generatePlan(customGoal, selectedPeriod);

                // Navigate to Review
                navigation.navigate('OnboardingCustomReview', { plan } as any);
            } catch (error) {
                console.error("Generación fallida", error);
                setIsGenerating(false);
                // Todo: Show alert
            } finally {
                setIsGenerating(false);
            }
            return;
        }

        // Standard Flow
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setMonth(startDate.getMonth() + selectedPeriod);

        setPeriod(
            selectedPeriod,
            startDate.toISOString(),
            endDate.toISOString()
        );

        navigation.navigate('Onboarding3Expectations', {
            objective: onboardingData.objective,
            resultIntent: route.params?.resultIntent
        } as any);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Container */}
            <View style={styles.progressContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.progressBarWrapper}>
                    {/* 2.5 step visualization approx by staying at 2 but maybe filling a bit more or just 2 */}
                    <ProgressBar currentStep={2} totalSteps={8} />
                </View>
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <AppText variant="heading" centered style={styles.title}>
                        ¿Durante cuánto tiempo quieres trabajar este objetivo?
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        Este período nos ayuda a observar si el cambio está ocurriendo. Puedes ajustarlo después.
                    </AppText>
                </View>

                <View style={styles.optionsContainer}>
                    {PERIOD_OPTIONS.map((option) => (
                        <TouchableOpacity
                            key={option.value}
                            style={[
                                styles.optionCard,
                                selectedPeriod === option.value && styles.optionCardSelected
                            ]}
                            onPress={() => setSelectedPeriod(option.value)}
                            activeOpacity={0.8}
                        >
                            <AppText
                                variant="subheading"
                                style={{
                                    fontWeight: '700',
                                    color: selectedPeriod === option.value ? colors.primary : colors.textPrimary
                                }}
                            >
                                {option.label}
                            </AppText>

                            {selectedPeriod === option.value && (
                                <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                <AppText variant="caption" centered color={colors.textSecondary} style={styles.microcopy}>
                    No es una fecha límite. Es un marco para observar tu progreso.
                </AppText>

            </View>

            <View style={styles.footer}>
                {isGenerating ? (
                    <View style={{ alignItems: 'center', padding: spacing.sm }}>
                        <ActivityIndicator size="small" color={colors.primary} />
                        <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: 8 }}>
                            La IA está analizando tu objetivo para {selectedPeriod} meses...
                        </AppText>
                    </View>
                ) : (
                    <PrimaryButton
                        label={customGoal ? "Generar Plan con IA ✨" : "Continuar"}
                        onPress={handleContinue}
                        disabled={!selectedPeriod}
                    />
                )}
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
    content: {
        paddingHorizontal: spacing.xl,
        flex: 1,
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
    optionsContainer: {
        gap: spacing.md,
        marginBottom: spacing.xl,
    },
    optionCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    microcopy: {
        width: '80%',
        alignSelf: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
