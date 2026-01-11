import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, Card, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboarding } from '../store/OnboardingContext';
import { useObjectives, ObjectiveDefinition } from '../hooks/useCatalog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding2Identity'>;

// Removed hardcoded Intent type to support dynamic DB objectives
// type Intent = 'energy' | 'calm' | 'focus' | 'sleep' | 'fitness' | 'consistency';




export const Onboarding2IdentityScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>(); // Quick fix for route typing
    const [selectedIntent, setSelectedIntent] = useState<string | null>(null);
    const { setObjective } = useOnboarding();
    const { objectives, loading } = useObjectives();

    const handleContinue = () => {
        if (!selectedIntent) return;

        // Save objective to context
        // casting to any because context expects specific union type but we have string from DB
        setObjective(selectedIntent as any);

        navigation.navigate('Onboarding3Expectations', {
            objective: selectedIntent as any,
            resultIntent: route.params?.resultIntent // Propagate intent
        } as any);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.progressBarWrapper}>
                    <ProgressBar currentStep={2} totalSteps={8} />
                </View>
            </View>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <AppText variant="heading" centered style={styles.title}>
                        ¿Qué cambio te gustaría notar en tu vida?
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        Vamos a construir un plan juntos, paso a paso.
                    </AppText>
                </View>

                {/* Intent Options */}
                <View style={styles.optionsContainer}>
                    {loading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <AppText color={colors.textSecondary}>Cargando opciones...</AppText>
                        </View>
                    ) : (
                        objectives.map((option) => (
                            <TouchableOpacity
                                key={option.id}
                                style={[
                                    styles.optionCard,
                                    selectedIntent === option.id && styles.optionCardSelected
                                ]}
                                onPress={() => setSelectedIntent(option.id)}
                                activeOpacity={0.7}
                            >
                                <View style={[
                                    styles.iconContainer,
                                    selectedIntent === option.id && styles.iconContainerSelected
                                ]}>
                                    <MaterialIcons
                                        name={option.icon as any}
                                        size={28}
                                        color={selectedIntent === option.id ? colors.primary : colors.textSecondary}
                                    />
                                </View>
                                <View style={styles.textContainer}>
                                    <AppText
                                        variant="subheading"
                                        style={[
                                            styles.optionLabel,
                                            selectedIntent === option.id && styles.optionLabelSelected
                                        ]}
                                    >
                                        {option.label}
                                    </AppText>
                                    <AppText
                                        variant="caption"
                                        color={selectedIntent === option.id ? colors.primary : colors.textSecondary}
                                        style={styles.optionDescription}
                                    >
                                        {option.description}
                                    </AppText>
                                </View>
                                {selectedIntent === option.id && (
                                    <View style={styles.checkmark}>
                                        <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Bottom spacing for button */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* CTA */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Continuar"
                    onPress={handleContinue}
                    disabled={!selectedIntent}
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
    progressBarWrapper: {
        flex: 1,
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
    optionsContainer: {
        gap: spacing.md,
    },
    optionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    iconContainerSelected: {
        backgroundColor: colors.surface,
    },
    textContainer: {
        flex: 1,
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    optionLabelSelected: {
        color: colors.primary,
    },
    optionDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    checkmark: {
        marginLeft: spacing.sm,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
