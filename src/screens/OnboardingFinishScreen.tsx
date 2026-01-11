import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { useHabitContext } from '../store/HabitContext';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingFinish'>;

export const OnboardingFinishScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const { userHabits } = useHabitContext();

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.container}>
                <MaterialIcons name="check-circle" size={80} color={colors.success} style={{ marginBottom: spacing.xl }} />

                <AppText variant="heading" centered style={styles.title}>¡Todo listo!</AppText>
                <AppText variant="body" centered color={colors.textSecondary}>
                    Has seleccionado {userHabits.length} hábitos para comenzar tu camino.
                </AppText>

                <View style={styles.footer}>
                    <PrimaryButton
                        label="Ir al Inicio"
                        onPress={() => navigation.replace('Main')}
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
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    title: {
        marginBottom: spacing.md,
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
