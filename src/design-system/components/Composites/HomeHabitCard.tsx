import React from 'react';
import { View, StyleSheet, TouchableOpacity, Pressable } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { CircularCheckbox } from '../Inputs/CircularCheckbox';
import { colors, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface HomeHabitCardProps {
    name: string;
    type: 'simple' | 'training' | 'exercise';
    icon: string;
    description?: string; // e.g. "15 min • Durante el día"
    completed: boolean;
    readOnly?: boolean;
    onToggle: () => void;
    onPress?: () => void; // General press, e.g. for details/routine
    onEdit?: () => void;
}

export const HomeHabitCard = React.memo((props: HomeHabitCardProps) => {
    const {
        name,
        type,
        icon,
        description,
        completed,
        readOnly = false,
        onToggle,
        onPress,
        onEdit
    } = props;

    return (
        <Card style={styles.container} onPress={readOnly ? undefined : onPress}>
            {/* Left Icon */}
            <View style={[styles.iconContainer, { backgroundColor: completed ? colors.primary : '#DBEAFE' }]}>
                <MaterialIcons
                    name={icon as any}
                    size={24}
                    color={completed ? colors.surface : colors.primary}
                />
            </View>

            {/* Middle Text */}
            <View style={styles.textContainer}>
                <AppText
                    variant="subheading"
                    style={[
                        styles.name,
                        completed && styles.nameCompleted
                    ]}
                >
                    {name}
                </AppText>
                {description && (
                    <AppText variant="caption" color={colors.textSecondary}>
                        {description}
                    </AppText>
                )}
            </View>

            {/* Right Actions - Completion Toggle */}
            <View style={styles.actions}>
                {/* Edit Action (for Training types) */}
                {onEdit && (
                    <TouchableOpacity
                        onPress={onEdit}
                        activeOpacity={0.7}
                        disabled={readOnly}
                        style={{ marginRight: spacing.sm, padding: 4 }}
                    >
                        <MaterialIcons name="edit" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                )}

                <Pressable
                    onPress={(e) => {
                        e.stopPropagation && e.stopPropagation(); // Try to stop propagation if supported
                        onToggle();
                    }}
                    disabled={readOnly}
                    hitSlop={20} // Generous hit area
                    style={({ pressed }) => ({
                        opacity: pressed ? 0.7 : 1,
                        padding: 4, // Visual padding
                        zIndex: 10, // Ensure it sits on top
                    })}
                >
                    <CircularCheckbox checked={completed} disabled={readOnly} />
                </Pressable>
            </View>
        </Card>
    );
});

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        marginBottom: spacing.sm,
        minHeight: 72,
        borderRadius: 24, // Rounder cards as per design
        borderWidth: 0, // Clean
        shadowOpacity: 0.05, // Subtle shadow
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24, // Circle
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
        paddingRight: spacing.sm,
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 2,
    },
    nameCompleted: {
        color: colors.textSecondary,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});
