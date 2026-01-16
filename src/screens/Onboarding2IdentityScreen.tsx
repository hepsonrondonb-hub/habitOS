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
        // casting to any because context expects specific union type but we have string from DB
        setObjective(selectedIntent as any);

        navigation.navigate('Onboarding2Period', {
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
                                        size={24}
                                        color={selectedIntent === option.id ? colors.primary : colors.textSecondary}
                                    />
                                </View>

                                <AppText
                                    variant="subheading"
                                    style={[
                                        styles.optionLabel,
                                        selectedIntent === option.id && styles.optionLabelSelected
                                    ]}
                                    numberOfLines={2}
                                >
                                    {option.label}
                                </AppText>
                                {/* Description hidden in grid for compactness */}

                                {selectedIntent === option.id && (
                                    <View style={styles.checkmark}>
                                        <MaterialIcons name="check-circle" size={20} color={colors.primary} />
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    )}

                    {/* Custom Objective Option (Always visible) */}
                    <TouchableOpacity
                        style={[
                            styles.customCard // distinct style
                        ]}
                        onPress={() => navigation.navigate('OnboardingCustomCreate' as any)}
                        activeOpacity={0.7}
                    >
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.customIconContainer]}>
                                <MaterialIcons name="auto-awesome" size={24} color={colors.primary} />
                            </View>
                            <View style={{ flex: 1 }}>
                                <AppText variant="subheading" style={styles.optionLabel}>
                                    Crear mi propio objetivo
                                </AppText>
                                <AppText variant="caption" color={colors.textSecondary}>
                                    La IA diseñará tu plan
                                </AppText>
                            </View>
                            <MaterialIcons name="arrow-forward" size={20} color={colors.textSecondary} />
                        </View>
                    </TouchableOpacity>
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.md,
        justifyContent: 'space-between',
    },
    optionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.md,
        width: '47%', // roughly half minus gap
        alignItems: 'flex-start', // Align left for vertical stack
        borderWidth: 2,
        borderColor: 'transparent',
        minHeight: 110,
    },
    optionCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    iconContainerSelected: {
        backgroundColor: colors.surface,
    },
    textContainer: {
        flex: 1, // Not used in grid but keeping for safety if referenced elsewhere
    },
    optionLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
        lineHeight: 20,
    },
    optionLabelSelected: {
        color: colors.primary,
    },
    optionDescription: {
        display: 'none', // Hide description for grid
    },
    checkmark: {
        position: 'absolute',
        top: 10,
        right: 10,
    },
    customCard: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.sm,
        borderWidth: 1,
        borderColor: colors.primary + '60',
        borderStyle: 'dashed',
        padding: spacing.md,
        minHeight: 0,
    },
    customIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
