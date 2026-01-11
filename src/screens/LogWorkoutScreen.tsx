import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { AppScreen, AppText, PrimaryButton, SegmentedControl, Card, ExerciseCard, CreateRoutineModal, ExerciseModal, SuccessModal } from '../design-system/components';
import { colors, radius, spacing } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { useHabitContext, Routine, TrainingExercise, TrainingSet } from '../store/HabitContext';
import { db } from '../config/firebase';
type LogWorkoutRouteProp = RouteProp<RootStackParamList, 'LogWorkout'>;

// Mock Avatar
const AVATAR_URI = 'https://i.pravatar.cc/150?u=a042581f4e29026704d';

export const LogWorkoutScreen = () => {
    const navigation = useNavigation();
    const route = useRoute<LogWorkoutRouteProp>();
    const { habitId } = route.params;
    const { getRoutine, saveRoutine } = useHabitContext();

    // Context & State
    const today = new Date().toISOString().split('T')[0];
    const existingRoutine = getRoutine(habitId, today);

    const [exercises, setExercises] = useState<TrainingExercise[]>([]);

    // UI State
    const [routineModalVisible, setRoutineModalVisible] = useState(false);
    const [exerciseModalVisible, setExerciseModalVisible] = useState(false);
    const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Sync state with context
    useEffect(() => {
        if (existingRoutine) {
            setExercises(existingRoutine.exercises);
        }
    }, [existingRoutine]);

    const handleCreateRoutine = (data: { name: string; type: 'Fuerza' | 'Cardio'; focus: string; duration: string }) => {
        const newRoutine: Routine = {
            id: Date.now().toString(),
            habitId,
            date: today,
            name: data.name,
            type: data.type,
            focus: data.focus,
            durationMinutes: data.duration,
            exercises: [] // Start empty
        };
        saveRoutine(newRoutine);
    };

    // --- Exercise Management ---

    const handleOpenAddExercise = () => {
        setEditingExerciseId(null);
        setExerciseModalVisible(true);
    };

    const handleSaveExercise = (name: string, muscleGroup?: string) => {
        if (editingExerciseId) {
            // Edit
            setExercises(prev => prev.map(ex => ex.id === editingExerciseId ? { ...ex, name, muscleGroup: muscleGroup || ex.muscleGroup } : ex));
        } else {
            // Add
            const newEx: TrainingExercise = {
                id: Date.now().toString(),
                name,
                muscleGroup: muscleGroup || 'General',
                sets: [{ id: Date.now().toString() + 's', reps: '', weight: '', completed: false }]
            };
            setExercises(prev => [...prev, newEx]);
        }
        setEditingExerciseId(null);
        setExerciseModalVisible(false);
    };

    const handleExerciseAction = (exId: string) => {
        Alert.alert(
            'Opciones',
            '¿Qué deseas hacer con este ejercicio?',
            [
                {
                    text: 'Editar nombre', onPress: () => {
                        setEditingExerciseId(exId);
                        setExerciseModalVisible(true);
                    }
                },
                { text: 'Eliminar ejercicio', onPress: () => handleDeleteExercise(exId), style: 'destructive' },
                { text: 'Cancelar', style: 'cancel' }
            ]
        );
    };

    const handleDeleteExercise = (exId: string) => {
        Alert.alert('Eliminar ejercicio', '¿Estás seguro?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar', style: 'destructive', onPress: () => {
                    setExercises(prev => prev.filter(ex => ex.id !== exId));
                }
            }
        ]);
    };

    const handleUpdateSet = (exId: string, setId: string, field: 'weight' | 'reps', value: string) => {
        const updated = exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
            };
        });
        setExercises(updated);
    };

    const handleToggleSet = (exId: string, setId: string) => {
        const updated = exercises.map(ex => {
            if (ex.id !== exId) return ex;
            return {
                ...ex,
                sets: ex.sets.map(s => s.id === setId ? { ...s, completed: !s.completed } : s)
            };
        });
        setExercises(updated);
    };

    const handleAddSet = (exId: string) => {
        const updated = exercises.map(ex => {
            if (ex.id !== exId) return ex;
            const newSet: TrainingSet = { id: Date.now().toString(), reps: '', weight: '', completed: false };
            return { ...ex, sets: [...ex.sets, newSet] };
        });
        setExercises(updated);
    };

    const handleSaveWorkout = () => {
        if (!existingRoutine) return;

        const updatedRoutine: Routine = {
            ...existingRoutine,
            exercises
        };
        saveRoutine(updatedRoutine);

        setShowSuccessModal(true);
    };

    // --- RENDER ---

    if (!existingRoutine) {
        return (
            <AppScreen backgroundColor="#F3F4F6" safeArea>
                <View style={[styles.header, { padding: spacing.lg }]}>
                    <View>
                        <AppText variant="caption" color={colors.textSecondary} style={{ textTransform: 'uppercase' }}>Hoy</AppText>
                        <AppText variant="heading">Rutina de hoy</AppText>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name="close" size={28} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                <View style={{ padding: spacing.lg, flex: 1, justifyContent: 'center' }}>
                    <Card style={{ alignItems: 'center', padding: spacing.xl, paddingVertical: 48 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg }}>
                            <MaterialIcons name="edit-calendar" size={40} color={colors.primary} />
                        </View>
                        <AppText variant="subheading" style={{ fontWeight: '700', marginBottom: spacing.sm, fontSize: 18 }} centered>
                            Sin rutina asignada
                        </AppText>
                        <AppText variant="body" color={colors.textSecondary} centered style={{ marginBottom: spacing.xl, paddingHorizontal: spacing.md }}>
                            Aún no has creado tu rutina de hoy. Define tus objetivos para comenzar.
                        </AppText>
                        <PrimaryButton
                            label="Crear rutina"
                            onPress={() => setRoutineModalVisible(true)}
                            icon="add"
                        />
                    </Card>
                </View>

                <CreateRoutineModal
                    visible={routineModalVisible}
                    onClose={() => setRoutineModalVisible(false)}
                    onSave={handleCreateRoutine}
                />
            </AppScreen>
        );
    }

    const currentEditingExercise = exercises.find(e => e.id === editingExerciseId);

    return (
        <AppScreen backgroundColor="#F3F4F6" safeArea>
            <ScrollView contentContainerStyle={styles.content}>
                {/* Header */}
                <View style={[styles.header, { padding: spacing.lg }]}>
                    <View>
                        <AppText variant="caption" color={colors.textSecondary} style={{ textTransform: 'uppercase' }}>Hoy</AppText>
                        <AppText variant="heading">Rutina de hoy</AppText>
                    </View>
                    <TouchableOpacity onPress={() => navigation.goBack()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name="close" size={28} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Routine Summary */}
                <View style={styles.summaryContainer}>
                    <Card style={styles.summaryCard}>
                        <View style={styles.summaryIcon}>
                            <MaterialIcons name="fitness-center" size={24} color="#2563EB" />
                        </View>
                        <View style={{ flex: 1 }}>
                            <AppText variant="subheading" style={{ color: '#2563EB', fontWeight: '700' }}>
                                {existingRoutine.name}
                            </AppText>
                            <AppText variant="caption" color="#60A5FA">
                                Enfoque: {existingRoutine.focus || 'General'} • {existingRoutine.durationMinutes || 0} min
                            </AppText>
                        </View>
                        {/* Optional Edit Button */}
                        <TouchableOpacity onPress={() => setRoutineModalVisible(true)}>
                            <MaterialIcons name="edit" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </Card>
                </View>

                {/* Exercise List */}
                {exercises.map(ex => (
                    <ExerciseCard
                        key={ex.id}
                        exercise={ex}
                        onUpdateSet={handleUpdateSet}
                        onToggleSet={handleToggleSet}
                        onAddSet={handleAddSet}
                        onEdit={() => handleExerciseAction(ex.id)}
                        onDelete={() => handleDeleteExercise(ex.id)}
                    />
                ))}

                {/* Add Exercise */}
                <TouchableOpacity style={styles.addExercise} onPress={handleOpenAddExercise}>
                    <MaterialIcons name="add-circle-outline" size={24} color={colors.textSecondary} />
                    <AppText variant="body" color={colors.textSecondary} style={{ marginLeft: 8, fontWeight: '600' }}>Agregar Ejercicio</AppText>
                </TouchableOpacity>

                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Footer */}
            <View style={styles.footer}>
                <PrimaryButton label="Guardar entrenamiento" onPress={handleSaveWorkout} />
            </View>

            {/* Modals */}
            <CreateRoutineModal
                visible={routineModalVisible}
                onClose={() => setRoutineModalVisible(false)}
                onSave={handleCreateRoutine}
            />

            <ExerciseModal
                visible={exerciseModalVisible}
                onClose={() => setExerciseModalVisible(false)}
                onSave={handleSaveExercise}
                initialName={currentEditingExercise?.name}
                initialMuscleGroup={currentEditingExercise?.muscleGroup}
                isEditing={!!editingExerciseId}
            />

            {/* Success Modal */}
            <SuccessModal
                visible={showSuccessModal}
                title="¡Entrenamiento guardado!"
                message="Tus registros han sido actualizados correctamente."
                onClose={() => {
                    setShowSuccessModal(false);
                    navigation.goBack();
                }}
            />
        </AppScreen>
    );
};

const styles = StyleSheet.create({
    content: {
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E5E7EB',
    },
    segmentContainer: {
        marginBottom: spacing.lg,
    },
    summaryContainer: {
        marginBottom: spacing.lg,
    },
    summaryCard: {
        backgroundColor: '#EFF6FF', // Blue 50
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderRadius: 16,
        borderWidth: 0,
    },
    summaryIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    addExercise: {
        borderWidth: 2,
        borderColor: colors.divider,
        borderStyle: 'dashed',
        borderRadius: 16,
        padding: spacing.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.xl,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: colors.surface,
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
        borderTopWidth: 1,
        borderColor: colors.divider,
    }
});
