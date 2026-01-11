import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, SecondaryButton } from '../design-system/components';
import { colors, spacing, shadows } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const WelcomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.container}>

                {/* 1. Main Centered Content (Logo + Text) */}
                <View style={styles.contentContainer}>

                    {/* Icon with white background & shadow (Matches HTML p-5 rounded-3xl bg-white shadow) */}
                    <View style={styles.iconBackground}>
                        <MaterialIcons name="check-circle" size={56} color={colors.primary} />
                    </View>

                    {/* Title (Matches HTML text-[42px] font-extrabold) */}
                    <View style={styles.titleRow}>
                        <AppText variant="heading" style={styles.titleText}>Habit</AppText>
                        <AppText variant="heading" style={[styles.titleText, { color: colors.primary }]}>OS</AppText>
                    </View>

                    {/* Subtitle */}
                    <AppText variant="body" style={styles.subtitle}>
                        Construye hábitos,{'\n'}un día a la vez.
                    </AppText>

                </View>

                {/* 2. Bottom Section (Buttons + Footer) */}
                <View style={styles.bottomSection}>
                    <View style={styles.actionsContainer}>
                        <PrimaryButton
                            label="Registrarse"
                            onPress={() => navigation.navigate('Onboarding1Positioning')}
                            style={styles.button}
                        />

                        <View style={{ height: 16 }} />

                        <PrimaryButton
                            label="Iniciar sesión"
                            variant="surface"
                            onPress={() => navigation.navigate('EmailLogin')}
                            style={styles.button}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <AppText variant="caption" color={colors.textSecondary} centered>
                            Al continuar, aceptas nuestros{'\n'}
                            <AppText variant="caption" style={{ fontWeight: '600' }}>Términos y Privacidad</AppText>
                        </AppText>
                    </View>
                </View>

            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'space-between', // Push Content up, Buttons down
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        paddingBottom: spacing.xxl, // Visual offset to not center exactly, but slightly higher
    },
    iconBackground: {
        backgroundColor: colors.surface,
        borderRadius: 24, // rounded-3xl
        padding: 20, // p-5
        marginBottom: 32, // mb-8
        ...shadows.md,
    },
    titleRow: {
        flexDirection: 'row',
        marginBottom: 16, // mb-4
    },
    titleText: {
        fontSize: 42, // text-[42px]
        fontWeight: '800', // font-extrabold
        letterSpacing: -1,
        lineHeight: 44, // leading-tight
    },
    subtitle: {
        textAlign: 'center',
        fontSize: 20, // text-xl
        lineHeight: 30, // leading-relaxed
        color: colors.textSecondary,
        maxWidth: 280, // max-w-[280px]
    },
    bottomSection: {
        width: '100%',
        paddingBottom: 32, // pb-8
    },
    actionsContainer: {
        width: '100%',
        marginBottom: 32,
    },
    button: {
        width: '100%',
        height: 56, // h-14
    },
    footer: {
        alignItems: 'center',
        width: '100%',
    }
});
