import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, AppTextInput, ProgressBar } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { useOnboarding } from '../store/OnboardingContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding4Account'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding4Account'>;

export const Onboarding4AccountScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();
    const { data: onboardingData, resetOnboarding } = useOnboarding();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleCreateAccount = async () => {
        setError('');

        // Validation
        if (!email || !password || !confirmPassword) {
            setError('Por favor completa todos los campos');
            return;
        }

        if (!validateEmail(email)) {
            setError('Por favor ingresa un correo válido');
            return;
        }

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setLoading(true);

        try {
            // 1. Create Firebase account
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Create user profile in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                userId: user.uid,
                email: user.email,
                onboardingCompleted: false,
                createdAt: serverTimestamp()
            });

            // 3. Save objective to user_objectives
            if (onboardingData.objective) {
                const { collection, addDoc } = await import('firebase/firestore');
                const objectivesRef = collection(db, 'user_objectives');

                const objectiveDoc = await addDoc(objectivesRef, {
                    userId: user.uid,
                    objectiveType: onboardingData.objective,
                    active: true,
                    createdAt: serverTimestamp()
                });

                const objectiveId = objectiveDoc.id;

                // 4. Save progress signals
                if (onboardingData.signals.length > 0) {
                    const signalsRef = collection(db, 'progress_signals');

                    for (const signalId of onboardingData.signals) {
                        await addDoc(signalsRef, {
                            userId: user.uid,
                            objectiveId: objectiveId,
                            signalId: signalId,
                            signalType: signalId,
                            createdAt: serverTimestamp()
                        });
                    }
                }

                // 5. Save baseline
                if (onboardingData.baseline !== null) {
                    const baselinesRef = collection(db, 'baselines');

                    await addDoc(baselinesRef, {
                        userId: user.uid,
                        objectiveId: objectiveId,
                        value: onboardingData.baseline,
                        createdAt: serverTimestamp()
                    });
                }

                // 6. Save habits/actions
                if (onboardingData.selectedActions.length > 0) {
                    const habitsRef = collection(db, 'habits');

                    for (const actionId of onboardingData.selectedActions) {
                        let habitName = actionId;
                        let habitIcon = 'check-circle';

                        // Fetch definition from catalog
                        try {
                            const actionDocRef = doc(db, 'actions_catalog', actionId);
                            const actionSnap = await getDoc(actionDocRef); // Make sure getDoc is imported or use the one from import above
                            if (actionSnap.exists()) {
                                const data = actionSnap.data();
                                habitName = data.name;
                                habitIcon = data.icon || 'check-circle';
                            }
                        } catch (e) {
                            console.warn('Error fetching action details:', e);
                        }

                        await addDoc(habitsRef, {
                            userId: user.uid,
                            objectiveId: objectiveId,
                            name: habitName,
                            type: 'simple',
                            icon: habitIcon,
                            category: onboardingData.objective,
                            frequency: [0, 1, 2, 3, 4, 5, 6], // All days
                            isActive: true,
                            active: true,
                            createdAt: serverTimestamp()
                        });
                    }
                }
            }

            // 7. Clear onboarding data from context
            resetOnboarding();

            // 8. Continue to Closure screen
            navigation.navigate('Onboarding7Closure', {
                objective: onboardingData.objective || 'energy'
            });

        } catch (err: any) {
            console.error('Error creating account:', err);

            if (err.code === 'auth/email-already-in-use') {
                setError('Este correo ya está registrado');
            } else if (err.code === 'auth/weak-password') {
                setError('La contraseña es muy débil');
            } else if (err.code === 'auth/invalid-email') {
                setError('Correo inválido');
            } else {
                setError('Error al crear la cuenta. Intenta de nuevo.');
            }
        } finally {
            setLoading(false);
        }
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
                    <ProgressBar currentStep={7} totalSteps={8} />
                </View>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText variant="heading" centered style={styles.title}>
                            Guarda tu plan
                        </AppText>
                        <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                            Así podremos acompañarte, observar tu progreso y ajustar contigo cuando sea necesario.
                        </AppText>
                    </View>

                    {/* Form */}
                    <View style={styles.form}>
                        <AppTextInput
                            label="Correo electrónico"
                            value={email}
                            onChangeText={setEmail}
                            placeholder="tu@correo.com"
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                        />

                        <AppTextInput
                            label="Contraseña"
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Mínimo 6 caracteres"
                            secureTextEntry
                            autoComplete="password-new"
                        />

                        <AppTextInput
                            label="Confirmar contraseña"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Repite tu contraseña"
                            secureTextEntry
                            autoComplete="password-new"
                        />

                        {error ? (
                            <View style={styles.errorContainer}>
                                <AppText variant="caption" style={styles.errorText}>
                                    {error}
                                </AppText>
                            </View>
                        ) : null}
                    </View>

                    <View style={{ height: 180 }} />
                </ScrollView>

                {/* Footer */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label={loading ? "Creando cuenta..." : "Crear cuenta"}
                        onPress={handleCreateAccount}
                        disabled={loading}
                    />
                </View>
            </KeyboardAvoidingView>
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
    keyboardView: {
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
    form: {
        gap: spacing.lg,
    },
    errorContainer: {
        backgroundColor: '#FEE2E2',
        padding: spacing.md,
        borderRadius: 8,
    },
    errorText: {
        color: '#DC2626',
        textAlign: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
