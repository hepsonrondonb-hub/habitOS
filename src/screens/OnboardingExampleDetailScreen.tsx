import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, SecondaryButton } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'OnboardingExampleDetail'>;
type RouteParams = RouteProp<RootStackParamList, 'OnboardingExampleDetail'>;

// Data Definition
const EXAMPLE_DETAILS: Record<string, any> = {
    travel: {
        title: 'Ahorrar para un viaje',
        period: '6 meses',
        currentStatus: 'Semana 2 de 24',
        contextText: 'Aún es temprano. Lo importante es tener criterios claros y acciones sostenibles.',
        icon: 'savings',
        color: '#3B82F6',
        criterios: [
            'Ahorrar USD 50 por mes',
            'Reducir 10% de gastos no esenciales (vs. mes 1)',
            'Mantener 3 meses consecutivos cumpliendo el ahorro mensual',
            'Definir el presupuesto del viaje antes del mes 3'
        ],
        acciones: [
            { name: 'Registrar gastos', freq: 'Semanal', icon: 'edit-note' },
            { name: 'Revisar gastos no esenciales', freq: 'Semanal', icon: 'manage-search' },
            { name: 'Automatizar ahorro', freq: 'Mensual', icon: 'account-balance-wallet' },
            { name: 'Definir presupuesto', freq: 'Una vez', icon: 'map' }
        ]
    },
    fitness: {
        title: 'Mejorar condición física',
        period: '3 meses',
        currentStatus: 'Semana 1 de 12',
        contextText: 'El avance se observa en métricas consistentes, no en perfección.',
        icon: 'fitness-center',
        color: '#10B981',
        criterios: [
            'Completar ≥ 3 sesiones de actividad por semana durante 8 de 12 semanas',
            'Acumular ≥ 150 minutos de actividad moderada por semana (promedio mensual)',
            'Aumentar +10% una carga base al mes 3',
            'Reducir 2–4 cm de perímetro de cintura al mes 3 (si aplica)'
        ],
        acciones: [
            { name: 'Caminar 30 min', freq: '3x por semana', icon: 'directions-walk' },
            { name: 'Entrenamiento de fuerza 45 min', freq: '2x por semana', icon: 'fitness-center' },
            { name: 'Movilidad / estiramientos 10 min', freq: '3x por semana', icon: 'accessibility-new' },
            { name: 'Planificar comidas base', freq: 'Semanal', icon: 'restaurant-menu' }
        ]
    },
    project: {
        title: 'Crear un proyecto personal',
        period: '12 meses',
        currentStatus: 'Mes 1 de 12',
        contextText: 'El avance se mide por entregables, no por motivación.',
        icon: 'rocket-launch',
        color: '#8B5CF6',
        criterios: [
            'Publicar 1 entregable mensual durante 6 meses',
            'Completar 40 horas de trabajo enfocado por mes',
            'Conseguir 20 usuarios o 10 entrevistas en 8 semanas',
            'Lanzar una versión v1 antes del mes 3'
        ],
        acciones: [
            { name: 'Bloque de foco 90 min', freq: '3x por semana', icon: 'bolt' },
            { name: 'Revisión y planificación', freq: 'Semanal', icon: 'calendar-view-week' },
            { name: 'Hablar con 2 usuarios', freq: 'Semanal', icon: 'chat' },
            { name: 'Publicar avance', freq: 'Mensual', icon: 'publish' }
        ]
    }
};

export const OnboardingExampleDetailScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteParams>();
    const { exampleId } = route.params;

    const data = EXAMPLE_DETAILS[exampleId];

    if (!data) return null; // Should prevent crash if ID invalid

    const handleContinue = () => {
        navigation.navigate('Onboarding2Identity' as any);
    };

    const handleBack = () => {
        navigation.goBack();
    };

    return (
        <AppScreen backgroundColor={colors.surface} safeArea>
            {/* Header Section */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.headerBack}>
                    <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Title & Period */}
                <View style={styles.heroSummary}>
                    <View style={{ flex: 1 }}>
                        <AppText variant="heading" style={styles.title}>{data.title}</AppText>
                        <AppText variant="body" color={colors.textSecondary}>Período: {data.period}</AppText>
                    </View>
                    <View style={[styles.heroIcon, { backgroundColor: data.color + '20' }]}>
                        <MaterialIcons name={data.icon as any} size={24} color={data.color} />
                    </View>
                </View>

                {/* Timeline Visual Status */}
                <View style={styles.timelineContainer}>
                    <View style={styles.timelineHeader}>
                        <AppText variant="caption" style={{ fontWeight: '700', textTransform: 'uppercase' }} color={colors.textSecondary}>{data.currentStatus}</AppText>
                        <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>AHORA</AppText>
                    </View>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '10%' }]} />
                    </View>

                    {/* Context Quote */}
                    <View style={styles.quoteContainer}>
                        <View style={styles.quoteBar} />
                        <AppText variant="body" style={{ fontStyle: 'italic', color: colors.textSecondary }}>
                            "{data.contextText}"
                        </AppText>
                    </View>
                </View>

                {/* Criterios Section */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.sectionTitle}>Cómo notar que voy avanzando</AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
                        Criterios medibles para saber si el proyecto avanza.
                    </AppText>

                    <View style={styles.listContainer}>
                        {data.criterios.map((crit: string, i: number) => (
                            <View key={i} style={styles.listItem}>
                                <MaterialIcons name="check-circle" size={20} color={colors.primary + '80'} style={{ marginTop: 2 }} />
                                <AppText variant="body" style={styles.listText}>{crit}</AppText>
                            </View>
                        ))}
                    </View>
                </View>

                <View style={styles.divider} />

                {/* Acciones Section */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.sectionTitle}>Acciones que estoy probando</AppText>
                    <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
                        Acciones que generan evidencia, no solo intención.
                    </AppText>

                    <View style={styles.actionList}>
                        {data.acciones.map((action: any, i: number) => (
                            <View key={i} style={styles.actionCard}>
                                <View style={{ flex: 1 }}>
                                    <AppText variant="body" style={{ fontWeight: '600', marginBottom: 4 }}>{action.name}</AppText>
                                    <AppText variant="caption" color={colors.textSecondary} style={{ textTransform: 'uppercase' }}>{action.freq}</AppText>
                                </View>
                                <MaterialIcons name={action.icon as any} size={20} color={colors.textSecondary} />
                            </View>
                        ))}
                    </View>
                </View>

                {/* Footer Spacer */}
                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <PrimaryButton
                    label="Continuar"
                    onPress={handleContinue}
                    style={{ marginBottom: spacing.sm }}
                />
                <TouchableOpacity onPress={handleBack} style={styles.secondaryBtn}>
                    <AppText variant="body" color={colors.textSecondary} centered>Volver a ejemplos</AppText>
                </TouchableOpacity>
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.xs,
        alignItems: 'flex-end',
    },
    headerBack: {
        padding: spacing.xs,
    },
    scrollContent: {
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
    },
    heroSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 24,
        lineHeight: 30,
        marginBottom: 4,
    },
    heroIcon: {
        width: 48,
        height: 48,
        borderRadius: radius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.md,
    },
    timelineContainer: {
        marginBottom: spacing.xl,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    progressBar: {
        height: 4,
        backgroundColor: colors.divider,
        borderRadius: 2,
        marginBottom: spacing.lg,
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 2,
    },
    quoteContainer: {
        flexDirection: 'row',
        backgroundColor: colors.background, // Slightly distinct
        padding: spacing.md,
        borderRadius: radius.md,
        alignItems: 'center',
    },
    quoteBar: {
        width: 4,
        height: '100%',
        backgroundColor: colors.primary + '40', // Semi-transp
        marginRight: spacing.md,
        borderRadius: 2,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: 18,
        marginBottom: 4,
    },
    listContainer: {
        gap: spacing.md,
    },
    listItem: {
        flexDirection: 'row',
        gap: spacing.sm,
        paddingRight: spacing.lg,
    },
    listText: {
        flex: 1,
        lineHeight: 22,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginBottom: spacing.xl,
        opacity: 0.5,
    },
    actionList: {
        gap: spacing.sm,
    },
    actionCard: {
        backgroundColor: colors.background,
        padding: spacing.md,
        borderRadius: radius.md,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.divider,
    },
    secondaryBtn: {
        paddingVertical: spacing.sm,
    }
});
