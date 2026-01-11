import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding6Welcome'>;

export const Onboarding6WelcomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const [loading, setLoading] = useState(false);

    const handleGoToHome = async () => {
        const user = auth.currentUser;

        if (!user) {
            console.error('No user found');
            return;
        }

        setLoading(true);

        try {
            // Mark onboarding as completed
            const userRef = doc(db, 'users', user.uid);
            await updateDoc(userRef, {
                onboardingCompleted: true
            });

            // Wait a moment for the AuthContext listener to pick up the change
            // The RootNavigator will automatically redirect to Main
            // once userProfile.onboardingCompleted is true
            setTimeout(() => {
                setLoading(false);
            }, 500);
        } catch (error) {
            console.error('Error marking onboarding complete:', error);
            setLoading(false);
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.container}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <MaterialIcons name="wb-sunny" size={100} color={colors.primary} />
                </View>

                {/* Content */}
                <View style={styles.textContainer}>
                    <AppText variant="heading" centered style={styles.title}>
                        Todo empieza hoy
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        No se trata de hacerlo perfecto. Se trata de hacerlo posible.
                    </AppText>
                </View>

                {/* CTA */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label={loading ? "Cargando..." : "Ir a mi día"}
                        onPress={handleGoToHome}
                        disabled={loading}
                    />
                </View>
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl * 2,
        opacity: 0.9,
    },
    textContainer: {
        marginBottom: spacing.xxl * 2,
    },
    title: {
        fontSize: 32,
        marginBottom: spacing.lg,
    },
    subtitle: {
        fontSize: 16,
        lineHeight: 24,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
