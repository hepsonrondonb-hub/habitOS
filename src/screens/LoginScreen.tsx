import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, radius, spacing, shadows } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../config/firebase';

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    // Auth Request Config
    const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
        iosClientId: '41297635832-f9uu045a9h3h2uii3ub589fotkf8udj5.apps.googleusercontent.com',
        androidClientId: '41297635832-f9uu045a9h3h2uii3ub589fotkf8udj5.apps.googleusercontent.com',
        webClientId: '41297635832-f9uu045a9h3h2uii3ub589fotkf8udj5.apps.googleusercontent.com',
        redirectUri: 'https://auth.expo.io/@hepson/eternal-crater',
    });

    React.useEffect(() => {
        if (request) {
            console.log('🔗 PROXY URI:', request.redirectUri);
        }
    }, [request]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (response?.type === 'success') {
            const { id_token } = response.params;
            const credential = GoogleAuthProvider.credential(id_token);
            setLoading(true);
            signInWithCredential(auth, credential)
                .then(() => {
                    // Success is handled by AuthContext listener
                    console.log('Firebase Login Success');
                })
                .catch((err) => {
                    console.error('Firebase Login Error:', err);
                    setError('Error al iniciar sesión con Google.');
                    setLoading(false);
                });
        } else if (response?.type === 'error') {
            setError('La autenticación falló.');
        }
    }, [response]);

    const handleLogin = () => {
        setError('');
        promptAsync();
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

                {/* CTA */}
                <View style={styles.ctaContainer}>
                    <PrimaryButton
                        label="Continuar con Google"
                        variant="surface"
                        icon="account-circle"
                        onPress={handleLogin}
                        loading={loading || !request}
                        disabled={!request}
                    />

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
        backgroundColor: colors.surface,
        borderRadius: 24, // Looks very rounded
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
        fontSize: 32, // Larger than standard heading for Logo
        lineHeight: 40,
    },
    subtitle: {
        marginTop: spacing.sm,
    },
    spacer: {
        height: spacing.xxl,
    },
    ctaContainer: {
        width: '100%',
        marginBottom: spacing.xl,
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
