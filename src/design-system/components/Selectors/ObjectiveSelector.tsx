import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText';
import { colors, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

export interface ProgressObjective {
    id: string;
    label: string;
    icon?: string;
}

interface ObjectiveSelectorProps {
    objectives: ProgressObjective[];
    selectedId: string;
    onSelect: (id: string) => void;
}

export const ObjectiveSelector: React.FC<ObjectiveSelectorProps> = ({
    objectives,
    selectedId,
    onSelect
}) => {
    if (objectives.length <= 1) return null;

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {objectives.map((obj) => {
                const isSelected = selectedId === obj.id;
                return (
                    <TouchableOpacity
                        key={obj.id}
                        style={[
                            styles.chip,
                            isSelected && styles.selectedChip
                        ]}
                        onPress={() => onSelect(obj.id)}
                        activeOpacity={0.7}
                    >
                        {/* 
                           Icon logic: material icons names.
                           If not provided, maybe no icon or default.
                        */}
                        {obj.icon && (
                            <MaterialIcons
                                name={obj.icon as any}
                                size={16}
                                color={isSelected ? colors.surface : colors.textSecondary}
                                style={{ marginRight: 4 }}
                            />
                        )}
                        <AppText
                            variant="caption"
                            style={[
                                styles.text,
                                isSelected && styles.selectedText
                            ]}
                        >
                            {obj.label}
                        </AppText>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.divider,
    },
    selectedChip: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    text: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    selectedText: {
        color: colors.surface,
        fontWeight: '600',
    }
});
