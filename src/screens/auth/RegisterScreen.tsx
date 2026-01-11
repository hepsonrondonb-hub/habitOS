import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { AppScreen, AppText, PrimaryButton, AppTextInput } from '../../design-system/components';
import { colors, spacing, radius } from '../../design-system/tokens';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export const RegisterScreen = () => {
    const navigation = useNavigation();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [gender, setGender] = useState<'Masculino' | 'Femenino' | 'Otro' | 'Prefiero no decir'>('Prefiero no decir');

    // UI State
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string; confirm?: string; general?: string }>({});

    const handleRegister = async () => {
        setErrors({});

        // 1. Validations
        let newErrors: typeof errors = {};

        if (!email.includes('@')) newErrors.email = 'Correo electrónico inválido';
        if (password.length < 6) newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
        if (password !== confirmPassword) newErrors.confirm = 'Las contraseñas no coinciden';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // 2. Auth Logic
        setLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create user profile in Firestore with gender
            const avatarId = gender === 'Femenino' ? 'balance' : 'focus';
            await setDoc(doc(db, 'users', user.uid), {
                userId: user.uid,
                name: 'Usuario',
                email: user.email || '',
                gender,
                avatarId,
                createdAt: serverTimestamp(),
                onboardingCompleted: false,
            });

            console.log('Register Success with gender:', gender, 'avatar:', avatarId);
        } catch (error: any) {
            console.error('Register Error:', error);
            let errorMessage = 'Error al registrarse';

            if (error.code === 'auth/email-already-in-use') {
                newErrors.email = 'El correo ya está registrado';
            } else if (error.code === 'auth/weak-password') {
                newErrors.password = 'La contraseña es muy débil';
            } else if (error.code === 'auth/invalid-email') {
                newErrors.email = 'Formato de correo inválido';
            } else {
                newErrors.general = errorMessage;
            }
            setErrors(newErrors);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="subheading" style={styles.headerTitle}>Registrarse</AppText>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                <View style={styles.heroContainer}>
                    <AppText variant="heading" style={styles.title}>Empieza tu cambio</AppText>
                    <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        Guarda tu progreso desde hoy y construye nuevos hábitos.
                    </AppText>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    <AppTextInput
                        label="Correo electrónico"
                        placeholder="ejemplo@correo.com"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        error={errors.email}
                    />

                    <AppTextInput
                        label="Contraseña"
                        placeholder="••••••••"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        error={errors.password}
                    />

                    <AppTextInput
                        label="Confirmar contraseña"
                        placeholder="••••••••"
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        error={errors.confirm}
                    />

                    {/* Gender Selection */}
                    <View style={{ marginTop: spacing.md }}>
                        <AppText variant="body" style={{ fontWeight: '600', marginBottom: spacing.sm, color: colors.textPrimary }}>
                            Género
                        </AppText>
                        <View style={styles.genderContainer}>
                            {(['Masculino', 'Femenino', 'Otro', 'Prefiero no decir'] as const).map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={styles.genderOption}
                                    onPress={() => setGender(option)}
                                >
                                    <View style={[
                                        styles.radioOuter,
                                        gender === option && styles.radioOuterSelected
                                    ]}>
                                        {gender === option && <View style={styles.radioInner} />}
                                    </View>
                                    <AppText variant="body" style={{ marginLeft: spacing.sm }}>
                                        {option}
                                    </AppText>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {errors.general && (
                        <AppText variant="caption" color={colors.danger} centered style={{ marginBottom: spacing.md }}>
                            {errors.general}
                        </AppText>
                    )}

                    <View style={{ marginTop: spacing.lg }}>
                        <PrimaryButton
                            label="Registrarse"
                            onPress={handleRegister}
                            loading={loading}
                        />
                    </View>
                </View>

                {/* Social Placeholder (UI Intacta) */}
                <View style={styles.socialSection}>
                    <View style={styles.dividerRow}>
                        <View style={styles.divider} />
                        <AppText variant="caption" color={colors.textTertiary} style={styles.orText}>o continúa con</AppText>
                        <View style={styles.divider} />
                    </View>

                    <View style={styles.socialButtons}>
                        <TouchableOpacity style={styles.socialBtn}>
                            <AppText variant="body" style={{ fontWeight: '600' }}>  Apple</AppText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.socialBtn}>
                            <MaterialIcons name="language" size={20} color={colors.textPrimary} style={{ marginRight: 8 }} />
                            <AppText variant="body" style={{ fontWeight: '600' }}>Google</AppText>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.footer}>
                    <AppText variant="caption" color={colors.textSecondary}>
                        ¿Ya tienes cuenta? <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }} onPress={() => navigation.navigate('EmailLogin' as any)}>Inicia sesión</AppText>
                    </AppText>

                    <AppText variant="caption" color={colors.textTertiary} centered style={{ marginTop: spacing.lg }}>
                        Al registrarte, aceptas nuestros <AppText variant="caption" style={{ textDecorationLine: 'underline' }}>Términos de Servicio</AppText> y <AppText variant="caption" style={{ textDecorationLine: 'underline' }}>Política de Privacidad</AppText>.
                    </AppText>
                </View>

            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        marginBottom: spacing.md,
    },
    closeButton: {
        padding: 4,
    },
    headerTitle: {
        fontWeight: '700',
    },
    content: {
        paddingHorizontal: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    heroContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        textAlign: 'center',
        marginBottom: spacing.xs,
    },
    subtitle: {
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
    form: {
        marginBottom: spacing.xl,
    },
    socialSection: {
        marginBottom: spacing.xl,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#E5E7EB',
    },
    orText: {
        marginHorizontal: spacing.md,
    },
    socialButtons: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    socialBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: 50,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: colors.surface,
    },
    footer: {
        alignItems: 'center',
    },
    genderContainer: {
        gap: spacing.sm,
    },
    genderOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.sm,
    },
    radioOuter: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E5E7EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    radioOuterSelected: {
        borderColor: colors.primary,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    }
});
