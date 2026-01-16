import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, HabitTypeSelector, DaySelector } from '../design-system/components';
import { colors, radius, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../store/AuthContext';
import { db } from '../config/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { FrequencyType } from '../types/Action';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateHabit'>;
type RouteParams = RouteProp<RootStackParamList, 'CreateHabit'>;

interface UserObjective {
    id: string;
    objectiveType: string;
    label: string; // Derived for UI
}

const OBJECTIVE_LABELS: Record<string, string> = {
    energy: 'Energía',
    fitness: 'Cond. Física',
    calm: 'Calma',
    focus: 'Enfoque',
    sleep: 'Sueño',
    consistency: 'Constancia',
};

const getIconForType = (type: 'simple' | 'training', objectiveType?: string): string => {
    if (type === 'training') return 'fitness-center';

    switch (objectiveType) {
        case 'energy': return 'bolt';
        case 'calm': return 'spa';
        case 'focus': return 'center-focus-strong';
        case 'sleep': return 'bedtime';
        case 'fitness': return 'fitness-center';
        case 'consistency': return 'trending-up';
        default: return 'check-circle';
    }
};

export const CreateHabitScreen = () => {
    const navigation = useNavigation<NavigationProp>();
    const route = useRoute<RouteParams>();
    const { user } = useAuth();

    const habitId = route.params?.habitId;
    const initialObjectiveId = route.params?.objectiveId;
    const isEditMode = !!habitId;

    // Form State
    const [name, setName] = useState('');
    const [type, setType] = useState<'simple' | 'training'>('simple');

    // Objective State
    const [activeObjectives, setActiveObjectives] = useState<UserObjective[]>([]);
    const [selectedObjectiveId, setSelectedObjectiveId] = useState<string | null>(null);
    const [loadingObjectives, setLoadingObjectives] = useState(true);

    const [selectedDays, setSelectedDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]); // Default daily
    const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily'); // New State

    // Helper to toggle between Frequency Types
    const handleFrequencyTypeChange = (type: FrequencyType) => {
        setFrequencyType(type);
        // Reset specific days if not daily/weekly? 
        // For now, keep selectedDays as they are or default them.
        if (type === 'daily') setSelectedDays([0, 1, 2, 3, 4, 5, 6]);
    };
    const [loading, setLoading] = useState(false);
    const [loadingHabit, setLoadingHabit] = useState(isEditMode);

    // Initial Load: Objectives & Habit (if edit)
    useEffect(() => {
        if (!user) return;

        const loadData = async () => {
            try {
                // 1. Fetch user active objectives
                const q = query(
                    collection(db, 'user_objectives'),
                    where('userId', '==', user.uid),
                    where('active', '==', true)
                );
                const querySnapshot = await getDocs(q);
                const objectives = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        objectiveType: data.objectiveType,
                        label: OBJECTIVE_LABELS[data.objectiveType] || data.objectiveType
                    };
                });
                setActiveObjectives(objectives);

                // Set initial objective selection
                // Priority: param -> first objective
                if (!habitId && !selectedObjectiveId) {
                    if (initialObjectiveId && objectives.find(o => o.id === initialObjectiveId)) {
                        setSelectedObjectiveId(initialObjectiveId);
                    } else if (objectives.length > 0) {
                        setSelectedObjectiveId(objectives[0].id);
                    }
                }

                // 2. Load habit if editing
                if (habitId) {
                    const habitRef = doc(db, 'habits', habitId);
                    const habitSnap = await getDoc(habitRef);

                    if (habitSnap.exists()) {
                        const data = habitSnap.data();
                        setName(data.name || '');
                        setType(data.type || 'simple');
                        setSelectedDays(data.frequency || []);
                        setFrequencyType(data.frequency_type || 'daily'); // Load or Default

                        // If editing, use the stored objectiveID
                        // Ensure it exists in active list? Ideally yes, but if archived maybe not.
                        // For now assuming active.
                        if (data.objectiveId) {
                            setSelectedObjectiveId(data.objectiveId);
                        }
                    }
                }
            } catch (error) {
                console.error('Error loading data:', error);
                Alert.alert('Error', 'No se pudieron cargar los datos');
            } finally {
                setLoadingObjectives(false);
                setLoadingHabit(false);
            }
        };

        loadData();
    }, [user, habitId, initialObjectiveId]);


    const handleTypeChange = (newType: 'simple' | 'training') => {
        if (newType === 'training') {
            // Check if user has 'fitness' objective
            const fitnessObj = activeObjectives.find(o => o.objectiveType === 'fitness');
            if (fitnessObj) {
                setType(newType);
                setSelectedObjectiveId(fitnessObj.id);
            } else {
                Alert.alert(
                    "Objetivo no disponible",
                    "Los hábitos de entrenamiento solo están disponibles para el objetivo 'Mejorar Estado Físico'. Activa este objetivo primero."
                );
            }
        } else {
            setType(newType);
        }
    };

    const handleSave = async () => {
        if (!user) {
            Alert.alert('Error', 'Debes estar autenticado');
            return;
        }

        if (!name.trim()) {
            Alert.alert('Falta información', 'Por favor ingresa qué quieres lograr.');
            return;
        }

        if (selectedDays.length === 0) {
            Alert.alert('Frecuencia requerida', 'Selecciona al menos un día.');
            return;
        }

        if (!selectedObjectiveId) {
            Alert.alert('Falta objetivo', 'Debes tener un objetivo activo para crear acciones.');
            return;
        }

        const selectedObjective = activeObjectives.find(o => o.id === selectedObjectiveId);
        if (!selectedObjective) {
            Alert.alert('Error', 'Objetivo inválido');
            return;
        }

        // Validation for Training
        if (type === 'training' && selectedObjective.objectiveType !== 'fitness') {
            Alert.alert('Error', 'El tipo Entrenamiento solo es válido para el objetivo Estado Físico');
            return;
        }

        setLoading(true);

        try {
            const habitData = {
                name: name.trim(),
                type: type,
                objectiveId: selectedObjectiveId,
                category: selectedObjective.objectiveType,
                frequency: selectedDays, // Kept for legacy compatibility / daily specific days
                frequency_type: frequencyType, // New Field
                frequency_interval: 1, // Default
                icon: getIconForType(type, selectedObjective.objectiveType),
                updatedAt: serverTimestamp(),
            };

            if (isEditMode && habitId) {
                // Update existing habit
                const habitRef = doc(db, 'habits', habitId);
                await updateDoc(habitRef, habitData);
            } else {
                // Create new habit
                const habitsRef = collection(db, 'habits');
                const docRef = await addDoc(habitsRef, {
                    ...habitData,
                    userId: user.uid,
                    isActive: true,
                    status: 'active', // New Status Field
                    completed_count: 0,
                    createdAt: serverTimestamp()
                });
            }

            navigation.goBack();
        } catch (error) {
            console.error('Error saving habit:', error);
            Alert.alert('Error', 'No se pudo guardar la acción. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const toggleDay = (index: number) => {
        if (selectedDays.includes(index)) {
            setSelectedDays(prev => prev.filter(d => d !== index));
        } else {
            setSelectedDays(prev => [...prev, index]);
        }
    };

    if (loadingHabit || loadingObjectives) {
        return (
            <AppScreen backgroundColor={colors.background} safeArea>
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </AppScreen>
        );
    }

    return (
        <AppScreen backgroundColor={colors.background} safeArea>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
                    <MaterialIcons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <AppText variant="heading" style={styles.headerTitle}>
                    {isEditMode ? 'Editar acción' : 'Nueva acción'}
                </AppText>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                {/* Input */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.label}>¿Qué quieres lograr?</AppText>
                    <TextInput
                        style={styles.input}
                        placeholder="Entrenamiento de fuerza"
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={setName}
                    />
                </View>

                {/* Type Selector */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.label}>Tipo de acción</AppText>
                    <HabitTypeSelector selectedType={type} onSelect={handleTypeChange} />
                </View>

                {type === 'training' && (
                    <View style={styles.infoCard}>
                        <MaterialIcons name="lightbulb" size={20} color={colors.primary} style={{ marginRight: spacing.sm }} />
                        <AppText variant="caption" color={colors.textSecondary} style={{ flex: 1 }}>
                            Esta acción te permitirá adjuntar <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>rutinas de ejercicio</AppText> específicas y llevar un registro de tus pesos.
                        </AppText>
                    </View>
                )}

                {/* Objective Selector (Replaces Category) */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.label}>Objetivo</AppText>

                    {activeObjectives.length > 0 ? (
                        <View style={styles.pillsContainer}>
                            {activeObjectives.map((obj) => {
                                // Disable fitness-only objectives if in Training mode?
                                // Requirement: "habits of type training can only be visualized and selected for the objective Improved Physical Condition"
                                // Loop Logic: if type is training, and this obj is NOT fitness, disable it.
                                const isFitness = obj.objectiveType === 'fitness';
                                const isDisabled = type === 'training' && !isFitness;
                                const isSelected = selectedObjectiveId === obj.id;

                                return (
                                    <TouchableOpacity
                                        key={obj.id}
                                        style={[
                                            styles.pill,
                                            isSelected && styles.pillSelected,
                                            isDisabled && styles.pillDisabled
                                        ]}
                                        onPress={() => !isDisabled && setSelectedObjectiveId(obj.id)}
                                        disabled={isDisabled}
                                    >
                                        <MaterialIcons
                                            name={isSelected ? "check" : "radio-button-unchecked"}
                                            size={16}
                                            color={isSelected ? "#FFF" : isDisabled ? colors.disabled : colors.textSecondary}
                                            style={{ marginRight: 6 }}
                                        />
                                        <AppText style={[
                                            styles.pillText,
                                            isSelected && styles.pillTextSelected,
                                            isDisabled && styles.pillTextDisabled
                                        ]}>
                                            {obj.label}
                                        </AppText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.emptyObjectives}>
                            <AppText variant="caption" color={colors.textSecondary}>
                                No tienes objetivos activos. Crea uno primero.
                            </AppText>
                        </View>
                    )}
                </View>

                {/* Frequency */}
                <View style={styles.section}>
                    <AppText variant="subheading" style={styles.label}>Frecuencia</AppText>

                    {/* Frequency Type Tabs */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillsContainer}>
                        {(['daily', 'weekly', 'monthly', 'once'] as FrequencyType[]).map(ft => {
                            const labels: Record<string, string> = { daily: 'Diaria', weekly: 'Semanal', monthly: 'Mensual', once: 'Una vez' };
                            const isSelected = frequencyType === ft;
                            return (
                                <TouchableOpacity
                                    key={ft}
                                    style={[styles.pill, isSelected ? styles.pillSelected : null]}
                                    onPress={() => handleFrequencyTypeChange(ft)}
                                >
                                    <AppText style={[styles.pillText, isSelected ? styles.pillTextSelected : null]}>
                                        {labels[ft]}
                                    </AppText>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Show Day Selector only if Daily (Specific days) or Weekly (Specific days option) */}
                    {/* User Requirement: "Weekly: 1 (default)... days_of_week... In V1 leave null (not use)" - But we have a day selector already. */}
                    {/* Let's keep Day Selector visible only if Daily is selected, to allow "Mon/Wed/Fri" style daily habits. */}
                    {/* For Weekly, we assume "Once a week" for now as per requirements "frequency_interval: 1" */}

                    {frequencyType === 'daily' && (
                        <View style={{ marginTop: spacing.md }}>
                            <View style={styles.rowBetween}>
                                <AppText variant="caption" color={colors.textSecondary}>Días específicos</AppText>
                                <AppText variant="caption" color={colors.primary} style={{ fontWeight: '700' }}>
                                    {selectedDays.length} DÍAS
                                </AppText>
                            </View>
                            <DaySelector selectedDays={selectedDays} onToggleDay={toggleDay} />
                        </View>
                    )}
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer Button */}
            <View style={styles.footer}>
                <PrimaryButton
                    label={isEditMode ? 'Guardar cambios' : 'Guardar acción'}
                    onPress={handleSave}
                    loading={loading}
                    disabled={activeObjectives.length === 0}
                />
            </View>
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.sm,
        paddingBottom: spacing.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
    },
    content: {
        paddingHorizontal: spacing.lg,
    },
    section: {
        marginBottom: spacing.xl,
    },
    label: {
        fontWeight: '700',
        marginBottom: spacing.sm,
        fontSize: 16,
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.md,
        fontSize: 16,
        borderWidth: 1,
        borderColor: colors.divider,
        color: colors.textPrimary,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: colors.primarySoft, // Match brand
        padding: spacing.md,
        borderRadius: 12,
        marginBottom: spacing.xl,
        alignItems: 'flex-start',
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xs,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.background,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    pillsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    pill: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.divider,
        backgroundColor: colors.surface,
    },
    pillSelected: {
        borderColor: colors.primary,
        backgroundColor: colors.primary,
    },
    pillDisabled: {
        borderColor: colors.disabled,
        backgroundColor: '#F3F4F6',
        opacity: 0.6,
    },
    pillText: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    pillTextSelected: {
        color: '#FFF',
        fontWeight: '600',
    },
    pillTextDisabled: {
        color: colors.disabled,
    },
    emptyObjectives: {
        padding: spacing.md,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderStyle: 'dashed',
        alignItems: 'center',
    }
});
