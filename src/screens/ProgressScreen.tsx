import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText } from '../design-system/components';
import { colors, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

import { PeriodSelector, PeriodOption } from '../design-system/components/Selectors/PeriodSelector';
import { ObjectiveSelector } from '../design-system/components/Selectors/ObjectiveSelector';
import { TrendSummaryCard } from '../design-system/components/Composites/TrendSummaryCard';
import { SignalCard } from '../design-system/components/Composites/SignalCard';
import { useProgressData } from '../hooks/useProgressData';
import { InfoModal } from '../design-system/components/Modals';
import { TouchableOpacity } from 'react-native';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const ProgressScreen = () => {
    const navigation = useNavigation<NavigationProp>();

    // State
    const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(14);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string>('focus'); // Default, usually derived from context

    // Data Hook (Real)
    const { loading, trend, overview, signals, topInsight, objectives, selectedObjectiveId: hookSelectedId } = useProgressData(selectedPeriod, selectedObjectiveId);

    // Sync local selected ID if hook changes it (initial load)
    // Note: this might cause a render loop if not careful. 
    // Better to let the hook drive the selection if undefined.
    // But ObjectiveSelector needs explicit ID.
    // Let's use the one from hook if available.

    const handleSignalPress = (signalId: string) => {
        const signal = signals.find(s => s.id === signalId);
        if (signal) {
            navigation.navigate('SignalDetail', { signalData: signal, period: selectedPeriod, objectiveId: activeId });
        }
    };

    // Use the ID from hook as truth if we haven't selected one manually? 
    // Or just treat the hook's return as the source of truth for "active".
    const activeId = selectedObjectiveId && objectives.find(o => o.id === selectedObjectiveId) ? selectedObjectiveId : (hookSelectedId || '');

    const [showHelp, setShowHelp] = useState(false);

    return (
        <AppScreen safeArea backgroundColor={colors.background}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <AppText variant="heading" style={styles.title}>Progreso</AppText>
                    <AppText variant="body" color={colors.textSecondary}>
                        Entiende cómo va tu proceso
                    </AppText>
                </View>
                <TouchableOpacity onPress={() => setShowHelp(true)}>
                    <MaterialIcons name="help-outline" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Objective Selector */}
            <View style={styles.objectiveContainer}>
                <ObjectiveSelector
                    objectives={objectives}
                    selectedId={activeId}
                    onSelect={setSelectedObjectiveId}
                />
            </View>

            {/* Period Selector */}
            <View style={styles.periodContainer}>
                <PeriodSelector
                    selectedPeriod={selectedPeriod}
                    onSelect={setSelectedPeriod}
                />
            </View>

            {/* Content */}
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : (
                    <>
                        {/* Trend Summary */}
                        {trend && (
                            <TrendSummaryCard
                                title={trend.summary}
                                description={trend.description}
                                progress={overview?.objectiveProgress}
                            />
                        )}

                        {/* Top Insight Highlight */}
                        {topInsight && (
                            <View style={styles.insightHighlight}>
                                <View style={styles.insightIconContainer}>
                                    <MaterialIcons name="insights" size={20} color={colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700', marginBottom: 2 }}>
                                        INSIGHT CLAVE: {topInsight.signalName.toUpperCase()}
                                    </AppText>
                                    <AppText variant="body" style={{ fontSize: 13 }}>
                                        {topInsight.text}
                                    </AppText>
                                </View>
                            </View>
                        )}

                        {/* Empty State for Signals */}
                        {signals.length === 0 && (
                            <View style={styles.emptyState}>
                                <AppText color={colors.textSecondary} centered>
                                    No hay señales configuradas para este objetivo.
                                </AppText>
                            </View>
                        )}

                        {/* Signals List */}
                        {signals.length > 0 && (
                            <View style={styles.signalsSection}>
                                <AppText variant="caption" color={colors.textSecondary} style={styles.sectionTitle}>
                                    SEÑALES REGISTRADAS
                                </AppText>

                                {signals.map((signal) => (
                                    <SignalCard
                                        key={signal.id}
                                        name={signal.name}
                                        outcome={signal.formattedStatus}
                                        context={`Registrado ${signal.coverage} veces`}
                                        data={signal.chartData}
                                        onPress={() => handleSignalPress(signal.id)}
                                    />
                                ))}
                            </View>
                        )}

                        <View style={{ height: 80 }} />
                    </>
                )}
            </ScrollView>

            <InfoModal
                visible={showHelp}
                onClose={() => setShowHelp(false)}
                title="Cómo leer tu progreso"
                content={`Este módulo no evalúa resultados ni cumplimiento.

Aquí observamos tendencias, no días individuales.

Las acciones muestran lo que intentas hacer.
Las señales muestran si algo empieza a cambiar con el tiempo.

Cuando ves mensajes como 'aún sin patrón claro',
significa que todavía estamos reuniendo información,
no que estés fallando.

No ver cambios también es información útil.
Sirve para ajustar el proceso, no para exigirte más.

Usa este espacio para entender tu camino,
no para juzgarlo.`}
            />
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        marginBottom: spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    objectiveContainer: {
        marginBottom: spacing.xs,
    },
    periodContainer: {
        paddingHorizontal: spacing.lg,
        marginBottom: spacing.lg,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    loadingContainer: {
        paddingVertical: spacing.xxl,
        alignItems: 'center',
    },
    signalsSection: {
        marginTop: spacing.md,
    },
    sectionTitle: {
        letterSpacing: 1,
        marginBottom: spacing.md,
        fontWeight: '700',
        fontSize: 10,
    },
    emptyState: {
        padding: spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: spacing.xl,
    },
    insightHighlight: {
        flexDirection: 'row',
        backgroundColor: colors.primarySoft,
        padding: spacing.md,
        borderRadius: spacing.md,
        marginBottom: spacing.lg,
        alignItems: 'flex-start',
        gap: spacing.md,
        borderWidth: 1,
        borderColor: colors.brandMint,
    },
    insightIconContainer: {
        backgroundColor: colors.surface,
        padding: 6,
        borderRadius: 8,
    }
});
