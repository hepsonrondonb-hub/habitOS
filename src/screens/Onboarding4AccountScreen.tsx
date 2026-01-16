import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, AppTextInput, ProgressBar } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword, GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth'; // Added providers
import { doc, setDoc, serverTimestamp, getDoc, collection, addDoc } from 'firebase/firestore'; // Consolidated imports
import { auth, db } from '../config/firebase';
import { useOnboarding } from '../store/OnboardingContext';

// Social Auth Imports
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

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

    // --- Social Auth Config ---
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: '767887801604-otrciamfcj4240lte0k67ksnq69tlqn1.apps.googleusercontent.com',
        webClientId: '1005567233426-oauvec04kaj4mttfaflk55du5jntdnal.apps.googleusercontent.com',
        androidClientId: '1005567233426-f6g2co1tr9ivkq09pgdugqo2v1cas7i9.apps.googleusercontent.com',
        // Explicitly match the URI whitelisted in Google Cloud Console.
        // We use a String here because makeRedirectUri({ useProxy: true }) is deprecated/typed incorrectly in newer SDKs
        // and we need to ensure exact matching with Google Console.
        // explicit redirectUri removed to allow native scheme usage
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            handleSocialSignIn(credential, 'google');
        } else if (response?.type === 'error') {
            console.error('Google Auth Error Response:', response.error);
        }
    }, [response]);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // --- Shared Logic: Finalize Onboarding (Save Data) ---
    const finalizeOnboarding = async (user: any, additionalData: { name?: string | null, gender?: string } = {}) => {
        // 1. Create/Update user profile in Firestore
        // Usage of setDoc allows merge if user already existed (Social Login)
        // But for onboarding flow, we usually treat them as new or updating profile.
        await setDoc(doc(db, 'users', user.uid), {
            userId: user.uid,
            email: user.email,
            name: additionalData.name || user.displayName || 'Usuario', // Use provided name or Auth name
            gender: additionalData.gender || 'Prefiero no decir',
            photoURL: user.photoURL || null,
            onboardingCompleted: false, // Will be set to true at the very end or via Welcome screen
            createdAt: serverTimestamp() // Only if new? setDoc with merge: true protects existing fields
        }, { merge: true });

        // 2. Save objective to user_objectives
        // 2. Save Objective (Handle both Custom AI Plan and Standard Plan)
        let objectiveId = '';

        if (onboardingData.customPlan) {
            // --- AI CUSTOM PLAN SAVING ---
            const plan = onboardingData.customPlan;

            // A) Save Objective
            const objectivesRef = collection(db, 'user_objectives');
            const objectiveDoc = await addDoc(objectivesRef, {
                userId: user.uid,
                objectiveType: 'custom',
                title: plan.objective,
                active: true,
                periodMonths: onboardingData.periodMonths || 3,
                startDate: onboardingData.startDate ? new Date(onboardingData.startDate) : serverTimestamp(),
                endDate: onboardingData.endDate ? new Date(onboardingData.endDate) : null,
                createdAt: serverTimestamp()
            });
            objectiveId = objectiveDoc.id;

            // B) Save Actions (AI Suggested)
            const habitsRef = collection(db, 'habits');
            const saveActions = plan.actions.map((action: any) =>
                addDoc(habitsRef, {
                    userId: user.uid,
                    objectiveId: objectiveId,
                    name: action.name,
                    type: 'simple',
                    frequency_type: action.frequency.toLowerCase(),
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

        } else if (onboardingData.objective) {
            // --- STANDARD PLAN SAVING ---
            const objectivesRef = collection(db, 'user_objectives');
            const objectiveDoc = await addDoc(objectivesRef, {
                userId: user.uid,
                objectiveType: onboardingData.objective,
                active: true,
                periodMonths: onboardingData.periodMonths || 3,
                startDate: onboardingData.startDate ? new Date(onboardingData.startDate) : serverTimestamp(),
                endDate: onboardingData.endDate ? new Date(onboardingData.endDate) : null,
                createdAt: serverTimestamp()
            });

            objectiveId = objectiveDoc.id;

            // 3. Save progress signals (Standard)
            if (onboardingData.signals.length > 0) {
                const signalsRef = collection(db, 'progress_signals');
                for (const signalId of onboardingData.signals) {
                    await addDoc(signalsRef, {
                        userId: user.uid,
                        objectiveId: objectiveId,
                        signalId: signalId,
                        signalType: signalId,
                        active: true,
                        createdAt: serverTimestamp()
                    });
                }
            }

            // 4. Save baseline (Standard)
            if (onboardingData.baseline !== null) {
                const baselinesRef = collection(db, 'baselines');
                await addDoc(baselinesRef, {
                    userId: user.uid,
                    objectiveId: objectiveId,
                    value: onboardingData.baseline,
                    createdAt: serverTimestamp()
                });
            }

            // 5. Save habits/actions (Standard)
            if (onboardingData.selectedActions.length > 0) {
                const habitsRef = collection(db, 'habits');

                for (const actionId of onboardingData.selectedActions) {
                    let habitName = actionId;
                    let habitIcon = 'check-circle';
                    let frequencyType = 'daily'; // Default for catalog items

                    try {
                        const actionDocRef = doc(db, 'actions_catalog', actionId);
                        const actionSnap = await getDoc(actionDocRef);
                        if (actionSnap.exists()) {
                            const data = actionSnap.data();
                            habitName = data.name;
                            habitIcon = data.icon || 'check-circle';
                            // Catalog items usually don't have frequency yet, defaulting to daily
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
                        frequency_type: frequencyType,
                        frequency_days: [],
                        isActive: true,
                        active: true,
                        createdAt: serverTimestamp()
                    });
                }
            }
        }

        // 6. Clear onboarding context
        resetOnboarding();

        // 7. Navigate
        if (onboardingData.objective) {
            navigation.navigate('Onboarding7Closure', {
                objective: onboardingData.objective || 'energy',
                signals: onboardingData.signals,
                baseline: onboardingData.baseline,
                actions: onboardingData.selectedActions
            });
        } else {
            // Fallback if no objective found? Should not happen in this flow.
            navigation.navigate('Onboarding7Closure', {
                objective: 'energy',
                signals: [],
                baseline: null,
                actions: []
            });
        }
    };

    // --- Auth Handlers ---

    const handleCreateAccount = async () => {
        setError('');

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
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            await finalizeOnboarding(user);
        } catch (err: any) {
            console.error('Error creating account:', err);
            if (err.code === 'auth/email-already-in-use') setError('Este correo ya está registrado');
            else if (err.code === 'auth/weak-password') setError('La contraseña es muy débil');
            else if (err.code === 'auth/invalid-email') setError('Correo inválido');
            else setError('Error al crear la cuenta. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    const handleSocialSignIn = async (credential: any, providerName: string, additionalData?: any) => {
        setLoading(true);
        setError('');
        try {
            const userCredential = await signInWithCredential(auth, credential);
            const user = userCredential.user;
            await finalizeOnboarding(user, additionalData);
        } catch (err: any) {
            console.error(`${providerName} Sign-In Error:`, err);
            setError(`Error al iniciar sesión con ${providerName}.`);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // promptAsync triggers the browser flow
        promptAsync();
    };

    const handleAppleLogin = async () => {
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            // credential.fullName might be available ONLY on first sign in
            // We capture it here
            const name = credential.fullName ? `${credential.fullName.givenName} ${credential.fullName.familyName}`.trim() : null;

            const provider = new OAuthProvider('apple.com');
            const authCredential = provider.credential({
                idToken: credential.identityToken!,
                // rawNonce removed as it creates Type issue and often not needed for simple Auth
            });

            handleSocialSignIn(authCredential, 'Apple', { name });

        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // User canceled, do nothing
            } else {
                console.error('Apple Login Error:', e);
                setError('Error al iniciar con Apple.');
            }
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

                    <PrimaryButton
                        label={loading ? "Creando cuenta..." : "Crear cuenta"}
                        onPress={handleCreateAccount}
                        disabled={loading}
                    />

                    {/* Social Login Divider */}
                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <AppText variant="caption" color={colors.textSecondary} style={styles.orText}>o continúa con</AppText>
                        <View style={styles.divider} />
                    </View>

                    {/* Social Buttons */}
                    <View style={styles.socialButtonsContainer}>
                        {Platform.OS === 'ios' && (
                            <AppleAuthentication.AppleAuthenticationButton
                                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                                cornerRadius={12}
                                style={styles.appleButton}
                                onPress={handleAppleLogin}
                            />
                        )}

                        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin} disabled={!request}>
                            <MaterialIcons name="language" size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
                            <AppText variant="body" style={{ fontWeight: '600' }}>Google</AppText>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 100 }} />
                </ScrollView>
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
        marginBottom: spacing.lg,
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
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    orText: {
        marginHorizontal: spacing.md,
    },
    socialButtonsContainer: {
        gap: spacing.md,
    },
    appleButton: {
        width: '100%',
        height: 50,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: colors.surface,
        width: '100%',
    }
});
