import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboarding } from '../store/OnboardingContext';
import { useSignalsCatalog } from '../hooks/useCatalog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding4ProgressSignals'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding4ProgressSignals'>;

type Objective = 'energy' | 'calm' | 'focus' | 'sleep' | 'fitness' | 'consistency';



export const Onboarding4ProgressSignalsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const [selectedSignals, setSelectedSignals] = useState<string[]>([]);
    const { setSignals } = useOnboarding();

    const objective: string = (route.params?.objective as string) || 'energy';
    const { signals, loading } = useSignalsCatalog(objective);

    const toggleSignal = (signalId: string) => {
        setSelectedSignals(prev =>
            prev.includes(signalId)
                ? prev.filter(id => id !== signalId)
                : [...prev, signalId]
        );
    };

    const handleContinue = () => {
        // Save signals to context
        setSignals(selectedSignals);

        navigation.navigate('Onboarding5Baseline', {
            objective: objective as any,
            signals: selectedSignals,
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
                    <ProgressBar currentStep={4} totalSteps={8} />
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
                        ¿Cómo sabremos que estás avanzando?
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        Selecciona las señales que más te importa observar.{'\n'}
                        <AppText variant="caption" color={colors.textSecondary}>(Recomendado: 2–4)</AppText>
                    </AppText>
                </View>

                {/* Signals */}
                {loading ? (
                    <View style={{ padding: 20, alignItems: 'center' }}>
                        <AppText color={colors.textSecondary}>Cargando señales...</AppText>
                    </View>
                ) : (
                    <View style={styles.signalsContainer}>
                        {signals.map((signal) => {
                            const isSelected = selectedSignals.includes(signal.id);
                            return (
                                <TouchableOpacity
                                    key={signal.id}
                                    style={[
                                        styles.signalCard,
                                        isSelected && styles.signalCardSelected
                                    ]}
                                    onPress={() => toggleSignal(signal.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={styles.signalContent}>
                                        <AppText
                                            variant="body"
                                            style={[
                                                styles.signalLabel,
                                                isSelected && styles.signalLabelSelected
                                            ]}
                                        >
                                            {signal.name}
                                            {signal.optional && (
                                                <AppText variant="caption" color={colors.textSecondary}> (opcional)</AppText>
                                            )}
                                        </AppText>
                                    </View>
                                    <View style={styles.checkbox}>
                                        {isSelected ? (
                                            <MaterialIcons name="check-circle" size={24} color={colors.primary} />
                                        ) : (
                                            <MaterialIcons name="radio-button-unchecked" size={24} color={colors.textSecondary} />
                                        )}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                )}

                {/* Bottom spacing */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Continuar"
                    onPress={handleContinue}
                    disabled={selectedSignals.length === 0}
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
    signalsContainer: {
        gap: spacing.sm,
    },
    signalCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    signalCardSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primarySoft,
    },
    signalContent: {
        flex: 1,
    },
    signalLabel: {
        fontSize: 15,
        lineHeight: 21,
    },
    signalLabelSelected: {
        color: colors.primary,
        fontWeight: '600',
    },
    checkbox: {
        marginLeft: spacing.sm,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
