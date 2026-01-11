import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Onboarding1Message'>;

export const Onboarding1MessageScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleContinue = () => {
        navigation.navigate({
            name: 'Onboarding2Identity',
            params: {}
        } as any);
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Progress Indicator */}
            <View style={styles.progressContainer}>
                <AppText variant="caption" color={colors.textSecondary}>Paso 1 de 6</AppText>
            </View>

            <View style={styles.container}>
                {/* Illustration */}
                <View style={styles.illustrationContainer}>
                    <MaterialIcons name="self-improvement" size={120} color={colors.primary} />
                </View>

                {/* Content */}
                <View style={styles.textContainer}>
                    <AppText variant="heading" centered style={styles.headline}>
                        Los hábitos no cambian tu vida de golpe
                    </AppText>
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.subtitle}>
                        La cambian día a día, con pequeñas decisiones sostenidas.
                    </AppText>
                </View>


                // CTA
                <View style={styles.footer}>
                    <PrimaryButton
                        label="Continuar"
                        onPress={handleContinue}
                    />
                </View>
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    progressContainer: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: spacing.lg,
    },
    illustrationContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
        opacity: 0.9,
    },
    textContainer: {
        marginBottom: spacing.xxl * 2,
    },
    headline: {
        fontSize: 28,
        lineHeight: 36,
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
