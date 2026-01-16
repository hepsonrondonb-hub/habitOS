import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { AppScreen, AppText, PrimaryButton, AppTextInput } from '../../design-system/components';
import { colors, spacing, radius, shadows } from '../../design-system/tokens';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../config/firebase';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';

WebBrowser.maybeCompleteAuthSession();

export const EmailLoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);

    // --- Social Auth Config ---
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: '767887801604-otrciamfcj4240lte0k67ksnq69tlqn1.apps.googleusercontent.com',
        webClientId: '1005567233426-oauvec04kaj4mttfaflk55du5jntdnal.apps.googleusercontent.com',
        androidClientId: '1005567233426-f6g2co1tr9ivkq09pgdugqo2v1cas7i9.apps.googleusercontent.com',
        // explicit redirectUri removed to allow native scheme usage
    });

    useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            handleSocialSignIn(credential, 'Google');
        } else if (response?.type === 'error') {
            console.error('Google Auth Error:', response.error);
            setError('Error en autenticación con Google');
        }
    }, [response]);

    const handleGoogleLogin = () => {
        setError(null);
        promptAsync();
    };

    const handleAppleLogin = async () => {
        setError(null);
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ],
            });

            const provider = new OAuthProvider('apple.com');
            const authCredential = provider.credential({
                idToken: credential.identityToken!,
            });

            handleSocialSignIn(authCredential, 'Apple');

        } catch (e: any) {
            if (e.code === 'ERR_REQUEST_CANCELED') {
                // User canceled
            } else {
                console.error('Apple Login Error:', e);
                setError('Error al iniciar con Apple.');
            }
        }
    };

    const handleSocialSignIn = async (credential: any, providerName: string) => {
        setLoading(true);
        try {
            await signInWithCredential(auth, credential);
            // Success handled by AuthContext
        } catch (err: any) {
            console.error('Firebase Social Login Error:', err);
            setError(`Error al iniciar sesión con ${providerName}.`);
            setLoading(false);
        }
    };

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Por favor ingresa correo y contraseña');
            return;
        }

        setError(null);
        setLoading(true);

        try {
            await signInWithEmailAndPassword(auth, email, password);
            // Success! AuthContext listener will update state, 
            // and RootNavigator will redirect to Onboarding or Main based on profile.
        } catch (err: any) {
            console.error('Login Error:', err);
            let msg = 'Error al iniciar sesión';
            if (err.code === 'auth/invalid-email') msg = 'Correo electrónico inválido';
            if (err.code === 'auth/user-not-found') msg = 'Usuario no encontrado';
            if (err.code === 'auth/wrong-password') msg = 'Contraseña incorrecta';
            if (err.code === 'auth/invalid-credential') msg = 'Credenciales incorrectas';
            setError(msg);
            setLoading(false);
        }
    };

    const handleForgotPassword = async () => {
        if (!email) {
            setError('Ingresa tu correo para restablecer la contraseña');
            return;
        }

        try {
            await sendPasswordResetEmail(auth, email);
            setResetSent(true);
            setError(null);
            Alert.alert('Correo enviado', 'Te enviamos un correo para restablecer tu contraseña');
        } catch (err: any) {
            console.error('Reset Error:', err);
            if (err.code === 'auth/user-not-found') {
                setError('No existe cuenta con este correo');
            } else {
                setError('Error al enviar correo de recuperación');
            }
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.heroContainer}>
                    <AppText variant="heading" style={styles.title}>Bienvenido de nuevo</AppText>
                    <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        Es un gusto verte otra vez. Ingresa tus datos para continuar con tu progreso.
                    </AppText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <AppTextInput
                        label="Correo electrónico"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChangeText={(text) => {
                            setEmail(text);
                            setError(null);
                        }}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={error && error.includes('correo') ? error : undefined}
                    />

                    <AppTextInput
                        label="Contraseña"
                        placeholder="••••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            setError(null);
                        }}
                        error={error && (error.includes('Contraseña') || error.includes('Credenciales')) ? error : undefined}
                    />

                    <TouchableOpacity
                        style={styles.forgotButton}
                        onPress={handleForgotPassword}
                        activeOpacity={0.7}
                    >
                        <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>
                            {resetSent ? 'Reenviar correo' : '¿Olvidaste tu contraseña?'}
                        </AppText>
                    </TouchableOpacity>

                    {/* Generic Error Message if not attached to field */}
                    {error && !error.includes('correo') && !error.includes('Contraseña') && (
                        <AppText variant="caption" color={colors.danger} centered style={{ marginBottom: spacing.md }}>
                            {error}
                        </AppText>
                    )}

                    <View style={{ marginTop: spacing.md }}>
                        <PrimaryButton
                            label="Iniciar Sesión"
                            onPress={handleLogin}
                            loading={loading}
                        />
                    </View>

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
                                cornerRadius={radius.full}
                                style={styles.appleButton}
                                onPress={handleAppleLogin}
                            />
                        )}

                        <TouchableOpacity
                            style={[styles.googleButton]}
                            onPress={handleGoogleLogin}
                            disabled={!request || loading}
                        >
                            <MaterialIcons name="language" size={24} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />
                            <AppText variant="subheading" style={{ fontWeight: '600' }}>Google</AppText>
                        </TouchableOpacity>
                    </View>

                </View>

                <View style={styles.footer}>
                    <AppText variant="caption" color={colors.textSecondary}>
                        ¿Aún no tienes una cuenta? <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }} onPress={() => navigation.navigate('Register')}>Regístrate</AppText>
                    </AppText>
                </View>

            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        marginBottom: spacing.md,
    },
    backButton: {
        padding: 4,
        marginLeft: -4,
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    heroContainer: {
        marginBottom: spacing.xl,
    },
    title: {
        marginBottom: spacing.xs,
        fontSize: 28, // Matches visual strength of design
    },
    subtitle: {
        lineHeight: 22,
    },
    form: {
        marginBottom: spacing.xxl,
    },
    forgotButton: {
        alignSelf: 'flex-end',
        marginTop: -spacing.sm, // Pull up closer to input
        marginBottom: spacing.lg,
        paddingVertical: spacing.xs,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: colors.divider,
    },
    orText: {
        marginHorizontal: spacing.md,
    },
    socialButtonsContainer: {
        gap: spacing.md,
    },
    appleButton: {
        width: '100%',
        height: 56,
        marginBottom: spacing.sm,
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 56,
        borderRadius: radius.full,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
        ...shadows.sm,
    },
    footer: {
        alignItems: 'center',
        marginTop: 'auto', // Push to bottom if space permits
        paddingBottom: spacing.lg,
    }
});
