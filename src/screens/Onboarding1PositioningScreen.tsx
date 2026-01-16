import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding1Positioning'>;

export const Onboarding1PositioningScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<any>();

    const handleContinue = () => {
        navigation.navigate({
            name: 'OnboardingExamples',
            params: {}
        } as any);
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            // If we can't go back, we are at the start of the stack, so go to Welcome
            navigation.navigate('Welcome');
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <ProgressBar currentStep={1} totalSteps={6} />
                </View>
            </View>
            <View style={styles.container}>
                {/* Icon */}
                {/* Icon */}
                <View style={styles.iconContainer}>
                    <MaterialIcons name="rocket-launch" size={48} color={colors.primary} />
                </View>

                {/* Headline */}
                <AppText variant="heading" centered style={styles.headline}>
                    Construyamos tu plan de cambio
                </AppText>

                {/* Subheadline */}
                <AppText variant="body" centered color={colors.textSecondary} style={styles.subheadline}>
                    Te acompañamos a definir un objetivo, observar tu progreso y ajustar en el camino
                </AppText>

                {/* CTA */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label="Empezar mi plan"
                        onPress={handleContinue}
                        icon="arrow-forward"
                        iconPosition="right"
                    />
                </View>
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
        marginLeft: -spacing.xs, // Visual alignment
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: -60, // Visual adjustment to center content nicely
    },
    iconContainer: {
        marginBottom: spacing.xxl,
        width: 100,
        height: 100,
        borderRadius: 24,
        backgroundColor: '#EFF6FF', // Light blue (primary soft)
        alignItems: 'center',
        justifyContent: 'center',
    },
    headline: {
        fontSize: 32, // Larger as per design
        fontWeight: '700',
        lineHeight: 40,
        marginBottom: spacing.md,
        maxWidth: 300,
    },
    subheadline: {
        fontSize: 16,
        lineHeight: 24,
        maxWidth: 280,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
