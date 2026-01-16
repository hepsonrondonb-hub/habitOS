import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing, shadows, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import * as AppleAuthentication from 'expo-apple-authentication';
import { GoogleAuthProvider, OAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // --- Google Auth ---
    const [request, response, promptAsync] = Google.useAuthRequest({
        iosClientId: '767887801604-otrciamfcj4240lte0k67ksnq69tlqn1.apps.googleusercontent.com',
        webClientId: '1005567233426-oauvec04kaj4mttfaflk55du5jntdnal.apps.googleusercontent.com',
        androidClientId: '1005567233426-f6g2co1tr9ivkq09pgdugqo2v1cas7i9.apps.googleusercontent.com', // Update with actual ID
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
        setError('');
        promptAsync();
    };

    // --- Apple Auth ---
    const handleAppleLogin = async () => {
        setError('');
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
                // rawNonce is optional for simple Firebase Auth flows often
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

    // --- Common Auth Handler ---
    const handleSocialSignIn = async (credential: any, providerName: string) => {
        setLoading(true);
        try {
            await signInWithCredential(auth, credential);
            console.log(`Firebase ${providerName} Login Success`);
            // AuthContext will handle state change
        } catch (err: any) {
            console.error('Firebase Login Error:', err);
            setError(`Error al iniciar sesión con ${providerName}.`);
            setLoading(false);
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.container}>

                {/* Header Icon */}
                <View style={styles.iconContainer}>
                    <View style={styles.iconBackground}>
                        <MaterialIcons name="check" size={40} color={colors.surface} />
                    </View>
                </View>

                {/* Branding */}
                <View style={styles.brandContainer}>
                    <View style={styles.titleRow}>
                        <AppText variant="heading" style={styles.titleText}>Habit</AppText>
                        <AppText variant="heading" style={[styles.titleText, { color: colors.primary }]}>OS</AppText>
                    </View>
                    <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>Un día a la vez.</AppText>
                </View>

                {/* Spacer */}
                <View style={styles.spacer} />

                {/* CTA Container */}
                <View style={styles.ctaContainer}>

                    {Platform.OS === 'ios' && (
                        <AppleAuthentication.AppleAuthenticationButton
                            buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                            cornerRadius={radius.full} // Match new rounded style if possible, or use closest 
                            style={styles.appleButton}
                            onPress={handleAppleLogin}
                        />
                    )}

                    <TouchableOpacity
                        style={[styles.googleButton, Platform.OS === 'ios' && styles.googleButtonMargin]}
                        onPress={handleGoogleLogin}
                        disabled={!request || loading}
                    >
                        {/* Using MaterialIons 'language' as generic globe or 'google' if mapped */}
                        <MaterialIcons name="language" size={24} color={colors.textPrimary} style={{ marginRight: spacing.sm }} />
                        <AppText variant="subheading" style={{ fontWeight: '600' }}>Continuar con Google</AppText>
                    </TouchableOpacity>

                    {/* Error Message */}
                    {error ? (
                        <View style={styles.errorContainer}>
                            <MaterialIcons name="error" size={16} color={colors.danger} />
                            <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                                {error}
                            </AppText>
                        </View>
                    ) : null}
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <AppText variant="caption" color={colors.disabled} centered>
                        Al continuar, aceptas nuestros{'\n'}
                        <AppText variant="caption" color={colors.textSecondary} style={{ fontWeight: '600' }}>Términos y Privacidad</AppText>
                    </AppText>
                </View>

            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    iconBackground: {
        width: 80,
        height: 80,
        backgroundColor: colors.primary, // Using primary for icon bg for better branding pop
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.md,
    },
    brandContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    titleRow: {
        flexDirection: 'row',
    },
    titleText: {
        fontSize: 32,
        lineHeight: 40,
    },
    subtitle: {
        marginTop: spacing.sm,
    },
    spacer: {
        height: spacing.xl,
    },
    ctaContainer: {
        width: '100%',
        marginBottom: spacing.xl,
    },
    appleButton: {
        width: '100%',
        height: 56, // Match PrimaryButton height
        marginBottom: spacing.md,
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
    googleButtonMargin: {
        // iOS will have Apple Button above, so no margin needed on top if strictly following 'gap' logic, 
        // but here we use manual margin
        // If Apple button is present, we might want consistent spacing
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.md,
    },
    errorText: {
        marginLeft: spacing.xs,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: 0,
        right: 0,
        alignItems: 'center',
    }
});
