import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useOnboarding } from '../store/OnboardingContext';
import { useActionsCatalog } from '../hooks/useCatalog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding6Actions'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding6Actions'>;

type Objective = 'energy' | 'calm' | 'focus' | 'sleep' | 'fitness' | 'consistency';



export const Onboarding6ActionsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const [selectedActions, setSelectedActionsState] = useState<string[]>([]);
    const { setSelectedActions } = useOnboarding();

    const objective: string = (route.params?.objective as string) || 'energy';
    // signals and baseline are passed but not used yet in this screen, potentially for future logic
    const signals = route.params?.signals || [];
    const baseline = route.params?.baseline || 3;

    const { actions, loading } = useActionsCatalog(objective);

    const toggleAction = (actionId: string) => {
        setSelectedActionsState(prev =>
            prev.includes(actionId)
                ? prev.filter(id => id !== actionId)
                : [...prev, actionId]
        );
    };

    const handleContinue = () => {
        // Save selected actions to context
        setSelectedActions(selectedActions);

        if (route.params?.resultIntent === 'NEW_PLAN') {
            navigation.navigate({
                name: 'Onboarding7Closure',
                params: {
                    objective: objective as any,
                    resultIntent: 'NEW_PLAN'
                }
            } as any);
        } else {
            navigation.navigate({
                name: 'Onboarding4Account',
                params: {
                    intent: objective as any
                }
            } as any);
        }
    };

    const handleCreateCustom = () => {
        navigation.navigate({
            name: 'CreateHabit',
            params: {}
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
                    <ProgressBar currentStep={6} totalSteps={8} />
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
                        Estas acciones suelen ayudar
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        Tu eliges con cuales comenzar
                    </AppText>
                </View>

                {/* Actions */}
                <View style={styles.actionsContainer}>
                    {loading ? (
                        <View style={{ padding: 20, alignItems: 'center' }}>
                            <AppText color={colors.textSecondary}>Cargando acciones...</AppText>
                        </View>
                    ) : (
                        actions.map((action) => {
                            const isSelected = selectedActions.includes(action.id);
                            return (
                                <TouchableOpacity
                                    key={action.id}
                                    style={[
                                        styles.actionCard,
                                        isSelected && styles.actionCardSelected
                                    ]}
                                    onPress={() => toggleAction(action.id)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        isSelected && styles.iconContainerSelected
                                    ]}>
                                        <MaterialIcons
                                            name={action.icon as any}
                                            size={24}
                                            color={isSelected ? colors.primary : colors.textSecondary}
                                        />
                                    </View>
                                    <View style={styles.actionContent}>
                                        <AppText
                                            variant="subheading"
                                            style={[
                                                styles.actionName,
                                                isSelected && styles.actionNameSelected
                                            ]}
                                        >
                                            {action.name}
                                        </AppText>
                                        <AppText
                                            variant="caption"
                                            color={isSelected ? colors.primary : colors.textSecondary}
                                            style={styles.actionDescription}
                                        >
                                            {action.description}
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
                        })
                    )}

                    {/* Create Custom Action */}
                    {!loading && (
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={handleCreateCustom}
                            activeOpacity={0.7}
                        >
                            <MaterialIcons name="add-circle-outline" size={24} color={colors.primary} />
                            <AppText variant="subheading" style={styles.createButtonText}>
                                Crear mi propia acción
                            </AppText>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Microcopy */}
                <AppText variant="caption" centered color={colors.textSecondary} style={styles.microcopy}>
                    No tiene que ser perfecto. Se puede ajustar después.
                </AppText>

                {/* Bottom spacing */}
                <View style={{ height: 120 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Crear mi plan"
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
    actionsContainer: {
        gap: spacing.md,
    },
    actionCard: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    actionCardSelected: {
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
    actionContent: {
        flex: 1,
    },
    actionName: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    actionNameSelected: {
        color: colors.primary,
    },
    actionDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    checkbox: {
        marginLeft: spacing.sm,
    },
    createButton: {
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
    createButtonText: {
        color: colors.primary,
        fontWeight: '600',
    },
    microcopy: {
        marginTop: spacing.xl,
        fontStyle: 'italic',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
