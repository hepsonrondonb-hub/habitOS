import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Platform } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, Card, PrimaryButton } from '../design-system/components';
import { colors, spacing, radius, shadows } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { TrendChart } from '../design-system/components/Charts/TrendChart';
import { SignalData } from '../hooks/useProgressData';
import { db } from '../config/firebase'; // Make sure this path is correct
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../store/AuthContext';

type DetailRouteProp = RouteProp<{ params: { signalData: SignalData; period: number; objectiveId: string } }, 'params'>;

export const SignalDetailScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<DetailRouteProp>();
    const { user } = useAuth();

    // Fallback if accessed incorrectly
    if (!route.params?.signalData) return null;

    const { signalData, period, objectiveId } = route.params;

    // Check-in State
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Mock frequency data (last 7 days of the period for the dots visualization)
    const days = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
    const frequencyMock = days.map((day, i) => ({
        day,
        active: i % 2 === 0 || i === 5 // Random pattern
    }));

    const handleSaveCheckIn = async () => {
        if (selectedValue === null || !user) return;
        setSaving(true);
        try {
            await addDoc(collection(db, 'check_ins'), {
                userId: user.uid,
                objectiveId: objectiveId,
                signalId: signalData.signalId, // Use the catalog ID (e.g. 'energy_level')
                value: selectedValue,
                date: new Date().toISOString().split('T')[0], // Today's date YYYY-MM-DD
                timestamp: serverTimestamp()
            });
            setSuccess(true);
            setSelectedValue(null);
        } catch (error) {
            console.error("Error saving check-in:", error);
            Alert.alert("Error", "No se pudo guardar el registro.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppScreen safeArea backgroundColor={colors.background}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <AppText variant="subheading" style={styles.headerTitle} numberOfLines={1}>
                        {signalData.name}
                    </AppText>
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

                {/* Actions Footer */}
                <View style={styles.footerSection}>
                    <PrimaryButton
                        label="Registrar avance"
                        onPress={() => setModalVisible(true)}
                        variant="filled"
                        fullWidth
                        style={{ marginBottom: spacing.md }}
                    />

                    <TouchableOpacity
                        onPress={() => navigation.navigate('CreateHabit', { objectiveId: route.params.objectiveId })}
                        style={styles.secondaryButton}
                    >
                        <AppText color={colors.primary} style={{ fontWeight: '600' }}>Ajustar acciones</AppText>
                    </TouchableOpacity>

                    <AppText variant="caption" color={colors.textSecondary} centered style={{ marginTop: spacing.md, paddingHorizontal: spacing.lg }}>
                        Tu ritmo es constante. Si lo deseas, puedes simplificar tus acciones.
                    </AppText>
                </View>

                <View style={{ height: 40 }} />
            </ScrollView>

            {/* Check-In / Success Modal */}
            <Modal
                transparent={true}
                visible={modalVisible}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setModalVisible(false)}>
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        {success ? (
                            <View style={{ alignItems: 'center', paddingVertical: spacing.lg }}>
                                <MaterialIcons name="check-circle" size={64} color={colors.primary} style={{ marginBottom: spacing.md }} />
                                <AppText variant="heading" style={{ marginBottom: spacing.sm }}>¡Registrado!</AppText>
                                <AppText variant="body" color={colors.textSecondary} centered>
                                    Tu progreso ha sido guardado correctamente.
                                </AppText>
                                <PrimaryButton
                                    label="Continuar"
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSuccess(false);
                                    }}
                                    variant="filled"
                                    style={{ marginTop: spacing.xl, width: '100%' }}
                                />
                            </View>
                        ) : (
                            <>
                                <AppText variant="heading" style={{ marginBottom: spacing.xs }}>Registrar Progreso</AppText>
                                <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.lg }}>
                                    ¿Cómo calificarías "{signalData.name}" hoy?
                                </AppText>

                                {/* Scale 1-5 */}
                                <View style={styles.scaleContainer}>
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <TouchableOpacity
                                            key={val}
                                            style={[
                                                styles.scaleItem,
                                                selectedValue === val && styles.scaleItemActive
                                            ]}
                                            onPress={() => setSelectedValue(val)}
                                        >
                                            <AppText
                                                style={[
                                                    styles.scaleText,
                                                    selectedValue === val && styles.scaleTextActive
                                                ]}
                                            >
                                                {val.toString()}
                                            </AppText>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <View style={styles.labels}>
                                    <AppText variant="caption" color={colors.textSecondary}>Bajo</AppText>
                                    <AppText variant="caption" color={colors.textSecondary}>Alto</AppText>
                                </View>

                                <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalBtnCancel}>
                                        <AppText color={colors.textSecondary}>Cancelar</AppText>
                                    </TouchableOpacity>
                                    <PrimaryButton
                                        label={saving ? "Guardando..." : "Guardar Registro"}
                                        onPress={handleSaveCheckIn}
                                        disabled={selectedValue === null || saving}
                                        style={{ flex: 1 }}
                                    />
                                </View>
                            </>
                        )}
                    </View>
                </TouchableOpacity>
            </Modal>
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
        backgroundColor: colors.brandDark, // Deep brand color
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
    footerSection: {
        marginTop: spacing.xl,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
    },
    secondaryButton: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.lg,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContent: {
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        padding: spacing.xl,
        width: '100%',
        ...shadows.lg,
    },
    scaleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.xs,
    },
    scaleItem: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#F3F4F6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scaleItemActive: {
        backgroundColor: colors.primary,
    },
    scaleText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    scaleTextActive: {
        color: colors.surface,
    },
    labels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: spacing.lg,
        paddingHorizontal: 4,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: spacing.md,
        marginTop: spacing.md
    },
    modalBtnCancel: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
    }
});
