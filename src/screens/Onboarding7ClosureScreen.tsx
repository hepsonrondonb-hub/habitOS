import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../store/AuthContext';
import { useOnboarding } from '../store/OnboardingContext';
import { useActionsCatalog, useSignalsCatalog } from '../hooks/useCatalog';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding7Closure'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding7Closure'>;

export const Onboarding7ClosureScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const { user } = useAuth();
    const { data } = useOnboarding();
    const [saving, setSaving] = useState(false);

    // Fetch catalogs to hydrate data before saving
    // Note: This relies on data.objective being set. 
    // If null, hooks return empty.
    const objectiveType = data.objective || 'energy';
    const { actions: catalogActions } = useActionsCatalog(objectiveType);
    const { signals: catalogSignals } = useSignalsCatalog(objectiveType);

    const handleContinue = async () => {
        setSaving(true);
        try {
            if (route.params?.resultIntent === 'NEW_PLAN') {
                if (!user) {
                    console.error("No user found for NEW_PLAN");
                    return;
                }

                // CHECK FOR CUSTOM PLAN (AI FLOW)
                if (data.customPlan) {
                    const plan = data.customPlan;

                    // A) Save Objective
                    const objectivesRef = collection(db, 'user_objectives');
                    const objectiveDoc = await addDoc(objectivesRef, {
                        userId: user.uid,
                        objectiveType: 'custom',
                        title: plan.objective,
                        active: true,
                        periodMonths: data.periodMonths || 3,
                        startDate: data.startDate ? new Date(data.startDate) : serverTimestamp(),
                        endDate: data.endDate ? new Date(data.endDate) : null,
                        createdAt: serverTimestamp()
                    });
                    const objectiveId = objectiveDoc.id;

                    // B) Save Actions (AI Suggested)
                    const habitsRef = collection(db, 'habits');
                    const saveActions = plan.actions.map((action: any) =>
                        addDoc(habitsRef, {
                            userId: user.uid,
                            objectiveId: objectiveId,
                            name: action.name,
                            type: 'simple',
                            frequency_type: (action.frequency || 'daily').toLowerCase(),
                            frequency_days: [],
                            icon: action.icon || 'star',
                            isActive: true,
                            active: true,
                            createdAt: serverTimestamp()
                        })
                    );

                    // C) Save Signals (AI Criteria)
                    const signalsRef = collection(db, 'progress_signals');
                    const saveSignals = plan.measurableCriteria.map((criteria: string) =>
                        addDoc(signalsRef, {
                            userId: user.uid,
                            objectiveId: objectiveId,
                            name: criteria,
                            signalId: 'custom_ai',
                            signalType: 'custom',
                            active: true,
                            createdAt: serverTimestamp()
                        })
                    );

                    await Promise.all([...saveActions, ...saveSignals]);

                } else {
                    // --- STANDARD PLAN SAVING ---
                    // 1. Create User Objective
                    const objectiveRef = await addDoc(collection(db, 'user_objectives'), {
                        userId: user.uid,
                        objectiveType: data.objective,
                        active: true,
                        createdAt: serverTimestamp()
                    });

                    // 2. Create Habits (Actions)
                    // Filter catalog actions by selected IDs
                    const selectedHabits = catalogActions.filter(a => data.selectedActions.includes(a.id));
                    const habitPromises = selectedHabits.map(action => {
                        return addDoc(collection(db, 'habits'), {
                            userId: user.uid,
                            objectiveId: objectiveRef.id,
                            habitId: action.id,
                            name: action.name,
                            icon: action.icon,
                            type: 'simple',
                            frequency: [0, 1, 2, 3, 4, 5, 6],
                            isActive: true,
                            createdAt: serverTimestamp()
                        });
                    });

                    // 3. Create Progress Signals
                    const selectedSignals = catalogSignals.filter(s => data.signals.includes(s.id));
                    const signalPromises = selectedSignals.map(signal => {
                        return addDoc(collection(db, 'progress_signals'), {
                            userId: user.uid,
                            objectiveId: objectiveRef.id,
                            signalId: signal.id,
                            active: true,
                            createdAt: serverTimestamp()
                        });
                    });

                    // 4. Save Baseline
                    const baselinePromise = data.baseline ? addDoc(collection(db, 'baselines'), {
                        userId: user.uid,
                        objectiveId: objectiveRef.id,
                        value: data.baseline,
                        createdAt: serverTimestamp()
                    }) : Promise.resolve();

                    await Promise.all([...habitPromises, ...signalPromises, baselinePromise]);
                }

                // Navigate home
                navigation.navigate('Main');

            } else {
                // Default: Mark onboarding as completed (Auth Flow)
                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        onboardingCompleted: true
                    });
                }
                navigation.navigate('Main');
            }
        } catch (error) {
            console.error('Error saving plan/onboarding:', error);
        } finally {
            setSaving(false);
        }
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
                    <ProgressBar currentStep={8} totalSteps={8} />
                </View>
            </View>
            <View style={styles.container}>
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <MaterialIcons name="check-circle" size={72} color={colors.primary} />
                </View>

                {/* Main Text */}
                <AppText variant="heading" centered style={styles.mainText}>
                    Perfecto. Ya tenemos un plan.
                </AppText>

                {/* Secondary Text */}
                <AppText variant="body" centered color={colors.textSecondary} style={styles.secondaryText}>
                    Observaremos juntos si estas acciones están generando el cambio que buscas.
                </AppText>

                {/* Key Phrase Box */}
                <View style={styles.keyPhraseBox}>
                    <AppText variant="subheading" centered style={styles.keyPhrase}>
                        Si algo no funciona, no fallaste: ajustamos.
                    </AppText>
                </View>

                {/* CTA */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label={saving ? "Guardando..." : "Ir a mi plan"}
                        onPress={handleContinue}
                        loading={saving}
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
        paddingTop: spacing.sm,
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
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: spacing.xxl,
    },
    mainText: {
        fontSize: 28,
        lineHeight: 36,
        marginBottom: spacing.lg,
        maxWidth: 300,
    },
    secondaryText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: spacing.xxl,
        maxWidth: 320,
    },
    keyPhraseBox: {
        backgroundColor: colors.primarySoft,
        borderRadius: 16,
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderWidth: 2,
        borderColor: colors.primary,
        marginBottom: spacing.xxl,
    },
    keyPhrase: {
        color: colors.primary,
        fontWeight: '700',
        fontSize: 17,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg
    }
});
