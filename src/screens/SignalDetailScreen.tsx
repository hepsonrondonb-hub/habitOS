import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, Card, PrimaryButton } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { TrendChart } from '../design-system/components/Charts/TrendChart';
import { SignalData } from '../hooks/useProgressData';

type DetailRouteProp = RouteProp<{ params: { signalData: SignalData; period: number; objectiveId: string } }, 'params'>;

export const SignalDetailScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<DetailRouteProp>();

    // Fallback if accessed incorrectly, though unlikely with strict typing
    if (!route.params?.signalData) return null;

    const { signalData, period } = route.params;

    // Mock frequency data (last 7 days of the period for the dots visualization)
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const frequencyMock = days.map((day, i) => ({
        day,
        active: i % 2 === 0 || i === 5 // Random pattern
    }));

    return (
        <AppScreen safeArea backgroundColor={colors.background}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <AppText variant="subheading" style={styles.headerTitle}>{signalData.name}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>Últimos {period} días</AppText>
                </View>
                <TouchableOpacity style={styles.menuButton}>
                    <MaterialIcons name="more-horiz" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Trend Section */}
                <View style={styles.section}>
                    <AppText variant="caption" color={colors.textSecondary} style={styles.label}>TENDENCIA</AppText>
                    <AppText variant="heading" style={styles.trendTitle}>
                        Evolución {signalData.trendType === 'improving' ? 'positiva' : 'estable'}
                    </AppText>

                    <TrendChart
                        data={signalData.chartData}
                        labels={['DIA 1', `DIA ${period}`]}
                        color={colors.primary}
                    />
                </View>

                {/* Frequency Section */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.subTitle}>Frecuencia de acciones</AppText>
                    <View style={styles.frequencyRow}>
                        {frequencyMock.map((item, index) => (
                            <View key={index} style={styles.freqItem}>
                                <View style={[styles.freqDot, item.active && styles.freqDotActive]}>
                                    {item.active && <View style={styles.freqDotInner} />}
                                </View>
                                <AppText variant="caption" color={colors.textSecondary} style={styles.freqLabel}>
                                    {item.day}
                                </AppText>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Correlation Card */}
                <Card style={styles.correlationCard} noPadding>
                    <View style={styles.correlationContent}>
                        <View style={styles.iconBox}>
                            <MaterialIcons name="insights" size={24} color={colors.primary} />
                        </View>
                        <View style={styles.correlationTextParams}>
                            <AppText variant="body" style={styles.correlationText}>
                                {signalData.insight}
                            </AppText>
                            <AppText variant="caption" color={colors.textSecondary} style={{ fontStyle: 'italic', marginTop: 4 }}>
                                Esto no implica causalidad directa, solo una posible relación.
                            </AppText>
                        </View>
                    </View>
                </Card>

                {/* Process State (Blue Card) */}
                <Card style={styles.processCard} noPadding>
                    <View style={styles.processContent}>
                        <MaterialIcons name="auto-awesome" size={24} color={colors.surface} style={{ marginBottom: spacing.md }} />
                        <AppText variant="heading" style={styles.processTitle} centered>
                            "{signalData.trendType === 'stable' ? 'Hubo presencia sin exigencia.' : 'El ritmo es constante.'}"
                        </AppText>
                        <AppText variant="caption" style={styles.processLabel} centered>
                            ESTADO DEL PROCESO
                        </AppText>
                    </View>
                </Card>

                {/* Adjustments (Optional) */}
                <View style={styles.adjustmentSection}>
                    <AppText variant="body" color={colors.textSecondary} centered style={{ marginBottom: spacing.md, lineHeight: 22 }}>
                        Tu ritmo ha sido constante. Podrías probar <AppText variant="body" style={{ color: colors.primary }}>simplificar tus acciones</AppText> para mantener esta inercia sin esfuerzo.
                    </AppText>
                    <PrimaryButton
                        label="Ajustar acciones"
                        onPress={() => navigation.navigate('CreateHabit', { objectiveId: route.params.objectiveId })}
                        variant="filled" // Assuming primary button exists
                    />
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
        marginBottom: spacing.lg,
    },
    backButton: {
        padding: spacing.xs,
        marginLeft: -spacing.xs
    },
    menuButton: {
        padding: spacing.xs,
        marginRight: -spacing.xs
    },
    headerTitle: {
        fontWeight: '700',
        fontSize: 16,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        letterSpacing: 1,
        fontSize: 10,
        fontWeight: '700',
        marginBottom: spacing.xs,
    },
    trendTitle: {
        fontSize: 24,
        marginBottom: spacing.md,
    },
    subTitle: {
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    frequencyRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    freqItem: {
        alignItems: 'center',
        gap: spacing.xs,
    },
    freqDot: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
    },
    freqDotActive: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    freqDotInner: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.surface,
    },
    freqLabel: {
        fontSize: 10,
    },
    correlationCard: {
        backgroundColor: '#F3F4F6', // Light gray background like image
        marginBottom: spacing.lg,
        borderWidth: 0,
    },
    correlationContent: {
        padding: spacing.lg,
        flexDirection: 'row',
        gap: spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#E0E7FF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    correlationTextParams: {
        flex: 1,
    },
    correlationText: {
        fontWeight: '500',
    },
    processCard: {
        backgroundColor: '#1E40AF', // Deep blue
        marginBottom: spacing.xxl,
        borderWidth: 0,
    },
    processContent: {
        padding: spacing.xxl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    processTitle: {
        color: colors.surface,
        fontSize: 20,
        marginBottom: spacing.md,
    },
    processLabel: {
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 1,
        fontSize: 10,
    },
    adjustmentSection: {
        alignItems: 'center',
    }
});
