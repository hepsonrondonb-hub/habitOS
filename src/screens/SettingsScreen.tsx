import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Switch, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AppScreen, AppText, Card, FAB, PrimaryButton } from '../design-system/components';
import { colors, radius, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { getAvatarSource } from '../utils/avatars';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

interface Plan {
    id: string; // user_objective id
    objectiveType: string;
    active: boolean;
    createdAt: any;
}

const OBJECTIVE_LABELS: Record<string, string> = {
    energy: 'Energía',
    fitness: 'Condición Física',
    calm: 'Calma',
    focus: 'Enfoque Profundo',
    sleep: 'Sueño Reparador',
    consistency: 'Constancia'
};

// --- SUB-COMPONENTS ---

const SectionHeader = ({ title, actionLabel, onAction }: { title: string; actionLabel?: string; onAction?: () => void }) => (
    <View style={styles.sectionHeader}>
        <AppText variant="subheading" style={{ fontWeight: '700', fontSize: 16 }}>{title}</AppText>
        {actionLabel && (
            <TouchableOpacity onPress={onAction}>
                <AppText variant="caption" color={colors.primary} style={{ fontWeight: '600' }}>{actionLabel}</AppText>
            </TouchableOpacity>
        )}
    </View>
);

const PlanItem = ({
    plan,
    onToggle,
    onEdit
}: {
    plan: Plan;
    onToggle: () => void;
    onEdit: () => void;
}) => {
    const label = OBJECTIVE_LABELS[plan.objectiveType] || plan.objectiveType;

    return (
        <Card style={styles.planCard} noPadding>
            <TouchableOpacity style={styles.planContent} onPress={onEdit}>
                <View style={styles.planHeader}>
                    <View style={styles.planTitleRow}>
                        <View style={[styles.dot, { backgroundColor: plan.active ? colors.success : colors.disabled }]} />
                        <AppText variant="body" style={{ fontWeight: '700', fontSize: 16, marginRight: 8 }}>{label}</AppText>
                        <View style={[styles.statusBadge, { backgroundColor: plan.active ? '#DCFCE7' : '#F3F4F6' }]}>
                            <AppText variant="caption" style={{ color: plan.active ? '#166534' : colors.textSecondary, fontWeight: '700', fontSize: 10 }}>
                                {plan.active ? 'ACTIVO' : 'PAUSADO'}
                            </AppText>
                        </View>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                </View>

                <View style={styles.planFooter}>
                    <AppText variant="caption" color={colors.textSecondary} style={{ fontStyle: 'italic', flex: 1 }}>
                        {plan.active ? 'Pausar no borra tu progreso.' : 'Reanuda cuando estés listo.'}
                    </AppText>
                    <Switch
                        value={plan.active}
                        onValueChange={onToggle}
                        trackColor={{ false: colors.disabled, true: colors.primary }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor={colors.disabled}
                    />
                </View>
            </TouchableOpacity>
        </Card>
    );
};

export const SettingsScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { user, userProfile, logout } = useAuth();

    const [plans, setPlans] = useState<Plan[]>([]);
    const [loading, setLoading] = useState(true);
    const [dailyReminders, setDailyReminders] = useState(true);
    const [summaryTime, setSummaryTime] = useState('20:00');

    // Load plans from Firestore
    useFocusEffect(
        React.useCallback(() => {
            if (!user) return;

            const loadPlans = async () => {
                try {
                    setLoading(true);
                    const q = query(
                        collection(db, 'user_objectives'),
                        where('userId', '==', user.uid)
                    );
                    const snapshot = await getDocs(q);
                    const loadedPlans = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Plan[];

                    // Sort active first, then by date
                    loadedPlans.sort((a, b) => (Number(b.active) - Number(a.active)));

                    setPlans(loadedPlans);
                } catch (error) {
                    console.error('Error loading plans:', error);
                } finally {
                    setLoading(false);
                }
            };

            loadPlans();
        }, [user])
    );

    // Toggle plan active state
    const handleTogglePlan = async (planId: string, currentState: boolean) => {
        try {
            const planRef = doc(db, 'user_objectives', planId);
            await updateDoc(planRef, {
                active: !currentState
            });

            // Optimistic update
            setPlans(prev => prev.map(p =>
                p.id === planId ? { ...p, active: !currentState } : p
            ));
        } catch (error) {
            console.error('Error toggling plan:', error);
            Alert.alert('Error', 'No se pudo actualizar el plan');
        }
    };

    const handleEditPlan = (plan: Plan) => {
        const label = OBJECTIVE_LABELS[plan.objectiveType] || plan.objectiveType;
        navigation.navigate('EditPlan', { planId: plan.id, objectiveName: label });
    };

    const handleCreateObjective = () => {
        // Navigate to Onboarding flow with intent
        navigation.navigate('Onboarding1Positioning', { resultIntent: 'NEW_PLAN' });
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Error', 'No se pudo cerrar sesión. Intenta nuevamente.');
        }
    };

    return (
        <AppScreen backgroundColor="#F8FAFC" safeArea>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <AppText variant="heading" style={{ fontSize: 28 }}>Configuración</AppText>
                        <AppText variant="body" color={colors.textSecondary}>Gestiona tu cuenta y preferencias</AppText>
                    </View>
                    <Image source={getAvatarSource(userProfile?.avatarId as any)} style={styles.headerAvatar} />
                </View>

                {/* Profile Section */}
                <AppText variant="subheading" style={styles.sectionTitle}>Perfil</AppText>
                <TouchableOpacity activeOpacity={0.8} onPress={() => navigation.navigate('EditProfile')}>
                    <Card style={styles.profileCard}>
                        <Image source={getAvatarSource(userProfile?.avatarId as any)} style={styles.profileAvatar} />
                        <View style={styles.profileEditBadge}>
                            <MaterialIcons name="edit" size={12} color="#FFFFFF" />
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
                            <AppText variant="body" style={{ fontWeight: '700', fontSize: 16 }}>
                                {userProfile?.name || 'Usuario'}
                            </AppText>
                            <AppText variant="caption" color={colors.textSecondary}>
                                {userProfile?.email || user?.email || ''}
                            </AppText>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.textSecondary} />
                    </Card>
                </TouchableOpacity>

                {/* Plans Section */}
                <SectionHeader
                    title="Tus planes"
                // actionLabel="Crear nuevo"
                // onAction={handleCreateObjective}
                />

                <AppText variant="caption" color={colors.textSecondary} style={{ marginBottom: spacing.md }}>
                    Gestiona objetivos, señales y acciones.
                </AppText>

                {loading ? (
                    <AppText variant="body" color={colors.textSecondary} style={{ padding: spacing.lg }}>
                        Cargando...
                    </AppText>
                ) : (
                    <>
                        {plans.map(plan => (
                            <PlanItem
                                key={plan.id}
                                plan={plan}
                                onToggle={() => handleTogglePlan(plan.id, plan.active)}
                                onEdit={() => handleEditPlan(plan)}
                            />
                        ))}
                    </>
                )}

                {/* Create New Objective Button */}
                <TouchableOpacity style={styles.createButton} onPress={handleCreateObjective}>
                    <MaterialIcons name="add-circle" size={20} color={colors.primary} />
                    <AppText variant="body" color={colors.primary} style={{ fontWeight: '700' }}>
                        Crear nuevo objetivo
                    </AppText>
                </TouchableOpacity>

                {/* Notifications Section */}
                <AppText variant="subheading" style={[styles.sectionTitle, { marginTop: spacing.xl }]}>Notificaciones</AppText>
                <Card style={styles.settingCard}>
                    <View style={[styles.iconBox, { backgroundColor: '#F3E8FF' }]}>
                        <MaterialIcons name="notifications" size={20} color="#9333EA" />
                    </View>
                    <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
                        <AppText variant="body" style={{ fontWeight: '600' }}>Recordatorios Diarios</AppText>
                        <AppText variant="caption" color={colors.textSecondary}>Te avisaremos para que no olvides</AppText>
                    </View>
                    <Switch
                        value={dailyReminders}
                        onValueChange={setDailyReminders}
                        trackColor={{ false: colors.disabled, true: colors.primary }}
                        thumbColor={'#FFFFFF'}
                        ios_backgroundColor={colors.disabled}
                    />
                </Card>
                {dailyReminders && (
                    <Card style={[styles.settingCard, { marginTop: spacing.sm }]}>
                        <View style={[styles.iconBox, { backgroundColor: '#F3F4F6' }]}>
                            <MaterialIcons name="schedule" size={20} color={colors.textSecondary} />
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: spacing.md }}>
                            <AppText variant="body" style={{ fontWeight: '600' }}>Hora del resumen</AppText>
                            <AppText variant="caption" color={colors.textSecondary}>Resumen de tu día</AppText>
                        </View>
                        <View style={styles.timeBadge}>
                            <AppText variant="caption" color="#2563EB" style={{ fontWeight: '700' }}>{summaryTime}</AppText>
                        </View>
                    </Card>
                )}

                {/* Account Section */}
                <AppText variant="subheading" style={styles.sectionTitle}>Cuenta</AppText>
                <Card style={styles.accountCard}>
                    <View style={styles.accountRow}>
                        <AppText variant="body" style={{ fontWeight: '600' }}>Sincronización en la nube</AppText>
                        <MaterialIcons name="cloud-done" size={20} color={colors.success} />
                    </View>
                    <View style={styles.divider} />
                    <TouchableOpacity style={styles.accountRow} onPress={handleLogout}>
                        <AppText variant="body" style={{ fontWeight: '600', color: colors.danger }}>Cerrar sesión</AppText>
                        <MaterialIcons name="logout" size={20} color={colors.danger} />
                    </TouchableOpacity>
                </Card>

                <View style={{ height: 100 }} />
            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.lg,
        paddingBottom: 80,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    headerAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E5E7EB',
    },
    sectionTitle: {
        fontWeight: '700',
        marginBottom: spacing.md,
        marginTop: spacing.sm,
        fontSize: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
        marginTop: spacing.lg,
    },
    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    profileAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#E5E7EB',
    },
    profileEditBadge: {
        position: 'absolute',
        bottom: 16,
        left: 56,
        backgroundColor: colors.primary,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.surface,
    },
    planCard: {
        marginBottom: spacing.md,
    },
    planContent: {
        padding: spacing.lg,
    },
    planHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    planTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: spacing.sm,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    planFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing.lg,
        backgroundColor: '#F0F9FF',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#BAE6FD',
        borderStyle: 'dashed',
        marginTop: spacing.sm,
        gap: spacing.sm,
    },
    settingCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconBox: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timeBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    accountCard: {
        padding: 0,
        overflow: 'hidden'
    },
    accountRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
    },
    divider: {
        height: 1,
        backgroundColor: colors.divider,
        marginLeft: spacing.lg,
    }
});
