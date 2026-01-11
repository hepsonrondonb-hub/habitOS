import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, Card, PrimaryButton } from '../design-system/components';
import { colors, radius, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { doc, getDoc, updateDoc, collection, query, where, getDocs, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useSignalsCatalog } from '../hooks/useCatalog';

type EditPlanRouteProp = RouteProp<RootStackParamList, 'EditPlan'>;

export const EditPlanScreen = () => {
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const route = useRoute<EditPlanRouteProp>();
    const { planId, objectiveName } = route.params; // Plan ID is the User Objective ID
    const { user } = useAuth();

    // Data State
    const [planActive, setPlanActive] = useState(true);
    const [objectiveType, setObjectiveType] = useState<string | null>(null);

    // Sub-collections
    const [signals, setSignals] = useState<any[]>([]);
    const [actions, setActions] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);

    // Catalog for signal names
    const { signals: catalogSignals } = useSignalsCatalog(objectiveType);

    useEffect(() => {
        if (!user || !planId) return;

        setLoading(true);

        // 1. Fetch Plan Details (Real-time not strictly necessary for self-edit but good practice)
        const planRef = doc(db, 'user_objectives', planId);
        const unsubPlan = onSnapshot(planRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setPlanActive(data.active);
                setObjectiveType(data.objectiveType);
            }
        });

        // 2. Fetch Signals (Real-time)
        const signalsQ = query(
            collection(db, 'progress_signals'),
            where('objectiveId', '==', planId),
            where('userId', '==', user.uid)
        );
        const unsubSignals = onSnapshot(signalsQ, (snapshot) => {
            setSignals(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        }, (error) => {
            console.error("Error fetching signals:", error);
        });

        // 3. Fetch Actions (Real-time)
        const actionsQ = query(
            collection(db, 'habits'),
            where('objectiveId', '==', planId),
            where('userId', '==', user.uid)
        );
        const unsubActions = onSnapshot(actionsQ, (snapshot) => {
            setActions(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        }, (error) => {
            console.error("Error fetching actions:", error);
            setLoading(false);
        });

        return () => {
            unsubPlan();
            unsubSignals();
            unsubActions();
        };

    }, [user, planId]);

    // Merge catalog signals with user signals
    const mergedSignals = React.useMemo(() => {
        if (!catalogSignals || catalogSignals.length === 0) return [];

        return catalogSignals.map(catalogSig => {
            // Find if user already has an instance of this signal
            const userSig = signals.find(s => s.signalId === catalogSig.id);
            return {
                catalogId: catalogSig.id,
                name: catalogSig.name,
                // If user has it, use their doc ID and active status. 
                // If not, it's inactive and waiting to be created.
                firestoreId: userSig ? userSig.id : null,
                active: userSig ? userSig.active : false
            };
        });
    }, [catalogSignals, signals]);

    // Handlers
    const togglePlanActive = async (val: boolean) => {
        try {
            await updateDoc(doc(db, 'user_objectives', planId), { active: val });
        } catch (e) {
            console.error("Error toggling plan", e);
            Alert.alert("Error", "No se pudo actualizar el estado del plan.");
        }
    };

    const toggleSignal = async (item: { catalogId: string, firestoreId: string | null, active: boolean }) => {
        const { catalogId, firestoreId, active } = item;

        try {
            if (firestoreId) {
                // Existing signal: update status
                await updateDoc(doc(db, 'progress_signals', firestoreId), { active: !active });
            } else {
                // New signal: create it
                // We need the user ID. We have it from `user` context but need to be sure.
                if (!user) return;

                await addDoc(collection(db, 'progress_signals'), {
                    userId: user.uid,
                    objectiveId: planId,
                    signalId: catalogId,
                    active: true,
                    createdAt: serverTimestamp() // Import this if needed, or new Date()
                });
            }
        } catch (e) {
            console.error("Error toggling signal", e);
            Alert.alert("Error", "No se pudo actualizar la señal.");
        }
    };

    const toggleAction = async (actionId: string, currentVal: boolean) => {
        try {
            await updateDoc(doc(db, 'habits', actionId), { isActive: !currentVal });
        } catch (e) {
            console.error("Error toggling action", e);
        }
    };

    const handleEditAction = (habitId: string) => {
        navigation.navigate('CreateHabit', { habitId, objectiveId: planId });
    };

    const handleAddAction = () => {
        // Pass objectiveId to auto-link
        navigation.navigate('CreateHabit', { objectiveId: planId, objectiveType: objectiveType || undefined });
    };

    if (loading) {
        return (
            <AppScreen backgroundColor={colors.background} safeArea>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </AppScreen>
        );
    }

    return (
        <AppScreen backgroundColor="#F8FAFC" safeArea>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <View>
                    <AppText variant="heading" style={styles.headerTitle}>{objectiveName}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>EDITAR PLAN</AppText>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.content}>

                {/* Plan Status */}
                <Card style={styles.card}>
                    <View style={styles.row}>
                        <View style={{ flex: 1 }}>
                            <AppText variant="subheading" style={{ fontWeight: '700' }}>Objetivo activo</AppText>
                            <AppText variant="caption" color={colors.textSecondary}>
                                {planActive
                                    ? "Puedes pausar este plan sin perder tu historial."
                                    : "Plan pausado. Reactívalo cuando estés listo."}
                            </AppText>
                        </View>
                        <Switch
                            value={planActive}
                            onValueChange={togglePlanActive}
                            trackColor={{ false: colors.disabled, true: colors.primary }}
                        />
                    </View>
                </Card>

                {/* Objective Description Card */}
                <Card style={[styles.card, { borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
                    <AppText variant="subheading" style={{ fontWeight: '700', marginBottom: 4 }}>
                        {objectiveName}
                    </AppText>
                    <AppText variant="body" color={colors.textSecondary}>
                        Este es el cambio que estás buscando.
                    </AppText>
                </Card>

                {/* Signals Section */}
                <View style={styles.sectionHeader}>
                    <AppText variant="subheading" style={styles.sectionTitle}>Señales de progreso</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>Estas señales nos ayudan a leer tu avance.</AppText>
                </View>

                <Card style={styles.listCard} noPadding>
                    {mergedSignals.map((signal, index) => (
                        <View key={signal.catalogId} style={[
                            styles.listItem,
                            index < mergedSignals.length - 1 && styles.borderBottom
                        ]}>
                            <View style={{ flex: 1, paddingRight: spacing.md }}>
                                <AppText variant="body" style={{ fontWeight: '500', color: signal.active ? colors.textPrimary : colors.textSecondary }}>
                                    {signal.name}
                                </AppText>
                            </View>
                            <Switch
                                value={signal.active}
                                onValueChange={() => toggleSignal(signal)}
                                trackColor={{ false: colors.disabled, true: colors.primary }}
                                thumbColor={'#FFFFFF'}
                                ios_backgroundColor={colors.disabled}
                            />
                        </View>
                    ))}
                </Card>

                {/* Actions Section */}
                <View style={styles.sectionHeader}>
                    <AppText variant="subheading" style={styles.sectionTitle}>Acciones</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>Puedes ajustar acciones sin culpa. El plan se adapta.</AppText>
                </View>

                {actions.map((action) => (
                    <Card key={action.id} style={styles.actionCard}>
                        <View style={styles.actionIconBox}>
                            <MaterialIcons name={action.icon as any || 'check-circle'} size={24} color={action.isActive ? colors.primary : colors.disabled} />
                        </View>
                        <View style={styles.actionContent}>
                            <AppText variant="body" style={{ fontWeight: '700', color: action.isActive ? colors.textPrimary : colors.textSecondary }}>
                                {action.name}
                            </AppText>
                            <AppText variant="caption" color={colors.textSecondary} style={{ fontSize: 10 }}>
                                {action.frequency?.length === 7 ? 'DIARIO' : (action.frequency?.length + ' DIAS/SEM')} • {action.time || 'CUALQUIER HORA'}
                            </AppText>
                        </View>
                        <View style={styles.actionControls}>
                            <TouchableOpacity onPress={() => handleEditAction(action.id)} style={{ padding: 4 }}>
                                <MaterialIcons name="edit" size={20} color={colors.textSecondary} />
                            </TouchableOpacity>
                            <Switch
                                value={action.isActive}
                                onValueChange={() => toggleAction(action.id, action.isActive)}
                                trackColor={{ false: colors.disabled, true: colors.primary }}
                                thumbColor={'#FFFFFF'}
                                ios_backgroundColor={colors.disabled}
                            />
                        </View>
                    </Card>
                ))}

                <TouchableOpacity style={styles.addActionButton} onPress={handleAddAction}>
                    <MaterialIcons name="add" size={20} color={colors.primary} />
                    <AppText variant="body" color={colors.primary} style={{ fontWeight: '700' }}>Agregar acción</AppText>
                </TouchableOpacity>

                <View style={{ height: 40 }} />
            </ScrollView>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        backgroundColor: colors.background, // sticky header feel
    },
    backButton: {
        marginRight: spacing.md,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    content: {
        padding: spacing.lg,
    },
    card: {
        marginBottom: spacing.lg,
        padding: spacing.lg,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionHeader: {
        marginBottom: spacing.md,
        marginTop: spacing.sm,
    },
    sectionTitle: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 2,
    },
    listCard: {
        marginBottom: spacing.xl,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.lg,
        backgroundColor: colors.surface,
    },
    borderBottom: {
        borderBottomWidth: 1,
        borderBottomColor: colors.divider,
    },
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        paddingTop: spacing.md,
        gap: spacing.xs,
    },
    actionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    actionIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#F3F4F6', // light gray
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    actionContent: {
        flex: 1,
    },
    actionControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    addActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingVertical: spacing.md,
        gap: spacing.xs,
    }
});
