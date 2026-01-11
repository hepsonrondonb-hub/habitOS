import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface CategorySelectorProps {
    selectedCategory: string;
    onSelect: (category: string) => void;
}

const CATEGORIES = [
    { id: 'Energía', icon: 'bolt', color: '#F59E0B' }, // Amber
    { id: 'Calma', icon: 'spa', color: '#8B5CF6' }, // Purple
    { id: 'Enfoque', icon: 'center-focus-strong', color: '#3B82F6' }, // Blue
    { id: 'Sueño', icon: 'bedtime', color: '#6366F1' }, // Indigo
    { id: 'Estado físico', icon: 'fitness-center', color: '#EF4444' }, // Red
    { id: 'Constancia', icon: 'trending-up', color: '#10B981' }, // Green
];

export const CategorySelector: React.FC<CategorySelectorProps> = ({ selectedCategory, onSelect }) => {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                        <TouchableOpacity
                            key={cat.id}
                            style={[
                                styles.chip,
                                isSelected && styles.selectedChip,
                                isSelected && { backgroundColor: cat.color, borderColor: cat.color }
                            ]}
                            onPress={() => onSelect(cat.id)}
                        >
                            <MaterialIcons
                                name={cat.icon as any}
                                size={16}
                                color={isSelected ? colors.surface : colors.textPrimary}
                                style={{ marginRight: 6 }}
                            />
                            <AppText
                                variant="caption"
                                style={[
                                    styles.text,
                                    isSelected && styles.selectedText
                                ]}
                            >
                                {cat.id}
                            </AppText>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 9999,
        borderWidth: 1,
        borderColor: colors.divider,
        marginRight: spacing.sm,
        backgroundColor: colors.surface,
    },
    selectedChip: {
        // Dynamic color applied inline
    },
    text: {
        fontWeight: '600',
    },
    selectedText: {
        color: colors.surface,
    }
});
