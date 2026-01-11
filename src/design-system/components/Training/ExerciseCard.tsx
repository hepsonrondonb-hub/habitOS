import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { SetRow } from './SetRow';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { TrainingExercise } from '../../../store/HabitContext';

interface ExerciseCardProps {
    exercise: TrainingExercise;
    onUpdateSet: (exerciseId: string, setId: string, field: 'weight' | 'reps', value: string) => void;
    onToggleSet: (exerciseId: string, setId: string) => void;
    onAddSet: (exerciseId: string) => void;
    onEdit: (exerciseId: string) => void;
    onDelete: (exerciseId: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
    exercise,
    onUpdateSet,
    onToggleSet,
    onAddSet,
    onEdit,
    onDelete
}) => {
    const [expanded, setExpanded] = useState(false);

    // Derived state
    const completedSets = exercise.sets.filter(s => s.completed).length;

    // Colors based on Muscle Group (Simple mapping)
    const getColors = (mg: string) => {
        const lower = mg.toLowerCase();
        if (lower.includes('pierna') || lower.includes('glúteo')) return { bg: '#F3E8FF', icon: '#9333EA' }; // Purple
        if (lower.includes('espalda') || lower.includes('bíceps')) return { bg: '#D1FAE5', icon: '#059669' }; // Teal
        return { bg: '#FFEDD5', icon: '#EA580C' }; // Orange (Default/Push)
    };

    const cardColors = getColors(exercise.muscleGroup);

    if (!expanded) {
        return (
            <TouchableOpacity onPress={() => setExpanded(true)} activeOpacity={0.9}>
                <Card style={styles.collapsedCard}>
                    <View style={[styles.iconContainer, { backgroundColor: cardColors.bg }]}>
                        <MaterialIcons name={exercise.muscleGroup.toLowerCase().includes('pierna') ? 'directions-run' : 'fitness-center'} size={24} color={cardColors.icon} />
                    </View>
                    <View style={styles.info}>
                        <AppText variant="subheading" style={{ fontWeight: '700' }}>{exercise.name}</AppText>
                        <AppText variant="caption" color={colors.textSecondary}>{exercise.muscleGroup}</AppText>
                    </View>
                    <View style={styles.meta}>
                        <View style={styles.badge}>
                            <AppText variant="caption" style={{ fontWeight: '600', fontSize: 11 }}>
                                {exercise.sets.length} sets
                            </AppText>
                        </View>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color={colors.textSecondary} />
                    </View>
                </Card>
            </TouchableOpacity>
        );
    }

    return (
        <Card style={styles.expandedCard}>
            {/* Header */}
            <TouchableOpacity style={styles.header} onPress={() => setExpanded(false)}>
                <View style={[styles.iconContainer, { backgroundColor: cardColors.bg }]}>
                    <MaterialIcons name={exercise.muscleGroup.toLowerCase().includes('pierna') ? 'directions-run' : 'fitness-center'} size={24} color={cardColors.icon} />
                </View>
                <View style={styles.info}>
                    <AppText variant="subheading" style={{ fontWeight: '700', fontSize: 18 }}>{exercise.name}</AppText>
                    <AppText variant="caption" color={colors.textSecondary}>{exercise.muscleGroup}</AppText>
                </View>
                <TouchableOpacity onPress={() => onEdit(exercise.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <MaterialIcons name="more-horiz" size={24} color={colors.textSecondary} />
                </TouchableOpacity>
            </TouchableOpacity>

            {/* History Tip */}
            <View style={styles.historyTip}>
                <MaterialIcons name="history" size={16} color="#2563EB" style={{ marginRight: 6 }} />
                <View>
                    <AppText variant="caption" color={colors.textSecondary}>Último registro</AppText>
                    <AppText variant="caption" style={{ fontWeight: '600' }}>3 sets × 10 reps @ 60kg</AppText>
                </View>
            </View>

            {/* Table Header */}
            <View style={styles.tableHeader}>
                <AppText variant="caption" style={[styles.colLabel, { width: 40 }]}>SET</AppText>
                <AppText variant="caption" style={[styles.colLabel, { flex: 1 }]}>KG</AppText>
                <AppText variant="caption" style={[styles.colLabel, { flex: 1 }]}>REPS</AppText>
                <AppText variant="caption" style={[styles.colLabel, { width: 50 }]}>DONE</AppText>
            </View>

            {/* Sets */}
            {exercise.sets.map((set, index) => (
                <SetRow
                    key={set.id}
                    setNumber={index + 1}
                    data={set}
                    onChange={(id, f, v) => onUpdateSet(exercise.id, id, f, v)}
                    onToggle={(id) => onToggleSet(exercise.id, id)}
                />
            ))}

            {/* Add Set */}
            <TouchableOpacity style={styles.addSetButton} onPress={() => onAddSet(exercise.id)}>
                <MaterialIcons name="add" size={16} color="#2563EB" />
                <AppText variant="caption" color="#2563EB" style={{ fontWeight: '700', marginLeft: 4 }}>Agregar set</AppText>
            </TouchableOpacity>

        </Card>
    );
};

const styles = StyleSheet.create({
    collapsedCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    expandedCard: {
        padding: spacing.md,
        marginBottom: spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    info: {
        flex: 1,
    },
    meta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    badge: {
        backgroundColor: colors.background,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    historyTip: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        padding: spacing.sm,
        borderRadius: 12,
        marginBottom: spacing.lg,
    },
    tableHeader: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
        paddingHorizontal: spacing.xs,
    },
    colLabel: {
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 10,
        color: colors.textSecondary,
    },
    addSetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.md,
        marginTop: spacing.xs,
    }
});
