import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, SecondaryButton, ProgressBar } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingExamples'>;

const EXAMPLES = [
    {
        id: 'travel',
        title: 'Ahorrar para un viaje',
        period: '6 meses',
        icon: 'savings',
        badges: ['Criterios medibles', 'Acciones semanales y mensuales'],
        color: '#3B82F6' // Blue
    },
    {
        id: 'fitness',
        title: 'Mejorar condición física',
        period: '3 meses',
        icon: 'fitness-center',
        badges: ['Métricas claras de avance', 'Acciones 2–4 veces por semana'],
        color: '#10B981' // Emerald
    },
    {
        id: 'project',
        title: 'Crear un proyecto personal',
        period: '12 meses',
        icon: 'rocket-launch',
        badges: ['Entregables medibles', 'Acciones semanales y mensuales'],
        color: '#8B5CF6' // Violet
    }
];

export const OnboardingExamplesScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    const handleContinue = () => {
        navigation.navigate('Onboarding2Identity' as any);
    };

    const handleExamplePress = (exampleId: string) => {
        navigation.navigate('OnboardingExampleDetail' as any, { exampleId });
    };

    const handleBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginLeft: 16 }}>
                    {/* Showing step 1.5 visually as it is between 1 and 2 */}
                    <ProgressBar currentStep={1} totalSteps={6} />
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                    <AppText variant="heading" style={styles.title}>
                        Así se ve un proceso real en la app
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
                        Un ejemplo para entender cómo se define un objetivo, cómo se mide el avance y qué acciones se prueban.
                    </AppText>

                    <View style={styles.noticeContainer}>
                        <MaterialIcons name="visibility" size={16} color={colors.textSecondary} style={{ marginRight: 6 }} />
                        <AppText variant="caption" color={colors.textSecondary} style={{ fontStyle: 'italic' }}>
                            No estás eligiendo todavía. Solo observa.
                        </AppText>
                    </View>
                </View>

                {/* Cards List */}
                <View style={styles.cardsContainer}>
                    {EXAMPLES.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.card}
                            onPress={() => handleExamplePress(item.id)}
                            activeOpacity={0.9}
                        >
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1 }}>
                                    <AppText variant="subheading" style={styles.cardTitle}>{item.title}</AppText>
                                    <AppText variant="caption" color={colors.textSecondary}>{item.period}</AppText>
                                </View>
                                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                                    <MaterialIcons name={item.icon as any} size={20} color={item.color} />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            <View style={styles.badgesContainer}>
                                {item.badges.map((badge, index) => (
                                    <View key={index} style={styles.badge}>
                                        <MaterialIcons
                                            name={index === 0 ? "show-chart" : "calendar-today"}
                                            size={14}
                                            color={colors.textSecondary}
                                            style={{ marginRight: 4 }}
                                        />
                                        <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 12 }}>
                                            {badge}
                                        </AppText>
                                    </View>
                                ))}
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Space for FAB/Footer */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Continuar"
                    onPress={handleContinue}
                />
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.sm,
    },
    backButton: {
        padding: spacing.xs,
        marginLeft: -spacing.xs,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
    },
    header: {
        marginTop: spacing.sm,
        marginBottom: spacing.xxl,
    },
    title: {
        marginBottom: spacing.md,
    },
    subtitle: {
        marginBottom: spacing.md,
        lineHeight: 22,
    },
    noticeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardsContainer: {
        gap: spacing.md,
    },
    card: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg, // 16
        padding: spacing.lg,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
    },
    iconBox: {
        width: 36,
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider, // Changed from border
        marginBottom: spacing.md,
        opacity: 0.5,
    },
    badgesContainer: {
        gap: spacing.sm,
    },
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: spacing.xxl,
        left: spacing.lg,
        right: spacing.lg,
    }
});
