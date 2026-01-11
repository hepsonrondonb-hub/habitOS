import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding3Expectations'>;
type RoutePropType = RouteProp<RootStackParamList, 'Onboarding3Expectations'>;

export const Onboarding3ExpectationsScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RoutePropType>();

    const handleContinue = () => {
        const objective = route.params?.objective || 'energy';
        navigation.navigate('Onboarding4ProgressSignals', {
            objective,
            resultIntent: route.params?.resultIntent // Propagate
        } as any);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Bar */}
            <View style={styles.progressContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={styles.progressBarWrapper}>
                    <ProgressBar currentStep={3} totalSteps={8} />
                </View>
            </View>
            <View style={styles.container}>
                {/* Icon */}
                {/* Icon removed to match design */}
                <View style={{ marginBottom: spacing.lg }} />

                {/* Main Text */}
                <AppText variant="heading" style={styles.mainText}>
                    Los cambios reales no ocurren de un día para otro.
                </AppText>

                {/* Secondary Text */}
                <AppText variant="body" color={colors.textSecondary} style={styles.secondaryText}>
                    Vamos a observar señales de progreso y ajustar el camino.
                </AppText>

                {/* CTA */}
                <View style={styles.footer}>
                    <PrimaryButton
                        label="Tiene sentido"
                        onPress={handleContinue}
                        icon="check"
                        iconPosition="right"
                    />
                </View>
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        gap: spacing.md,
    },
    backButton: {
        padding: spacing.xs,
    },
    progressBarWrapper: {
        flex: 1,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        justifyContent: 'center',
        // alignItems: 'center', // Removed to allow left alignment
    },
    iconContainer: {
        marginBottom: spacing.xl,
    },
    mainText: {
        fontSize: 32, // Larger as per design
        fontWeight: '700',
        lineHeight: 40,
        marginBottom: spacing.md,
        // maxWidth: 320, // Let it flow naturally or keep if needed, design shows full width
    },
    secondaryText: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: spacing.xxl,
        maxWidth: 300,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
