import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { AppScreen, AppText, PrimaryButton, AppTextInput } from '../../design-system/components';
import { colors, spacing, radius } from '../../design-system/tokens';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { MaterialIcons } from '@expo/vector-icons';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';

export const EmailLoginScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    // UI State
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [resetSent, setResetSent] = useState(false);

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
    footer: {
        alignItems: 'center',
        marginTop: 'auto', // Push to bottom if space permits
        paddingBottom: spacing.lg,
    }
});
