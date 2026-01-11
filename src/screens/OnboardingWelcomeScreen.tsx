import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingWelcome'>;

export const OnboardingWelcomeScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { userProfile } = useAuth();

    // Get first name from user profile
    const firstName = userProfile?.firstName || userProfile?.name?.split(' ')[0] || '';
    const greeting = firstName ? `Buenos días, ${firstName}` : '';

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.container}>
                {/* Illustration placeholder (using Icon for now to verify Calm aesthetic) */}
                <View style={styles.illustrationContainer}>
                    <MaterialIcons name="self-improvement" size={120} color={colors.primary} />
                </View>

                <View style={styles.textContainer}>
                    {greeting && (
                        <AppText variant="subheading" centered color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
                            {greeting}
                        </AppText>
                    )}
                    <AppText variant="heading" centered style={styles.title}>Un día a la vez.</AppText>
                    <AppText variant="subheading" centered color={colors.textSecondary} style={styles.subtitle}>
                        Construye hábitos simples.{'\n'}Mide tu progreso.{'\n'}Sin presión.
                    </AppText>
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        label="Comenzar"
                        onPress={() => navigation.navigate('OnboardingHabits')}
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
        marginBottom: spacing.xl * 2,
        opacity: 0.8,
    },
    textContainer: {
        marginBottom: spacing.xl * 2,
    },
    title: {
        fontSize: 32,
        marginBottom: spacing.md,
    },
    subtitle: {
        lineHeight: 28,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
