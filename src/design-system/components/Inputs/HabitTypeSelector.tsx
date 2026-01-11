import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Card } from '../Card';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

type HabitType = 'simple' | 'training';

interface HabitTypeSelectorProps {
    selectedType: HabitType;
    onSelect: (type: HabitType) => void;
}

export const HabitTypeSelector: React.FC<HabitTypeSelectorProps> = ({ selectedType, onSelect }) => {
    return (
        <View style={styles.container}>
            <Card
                style={[styles.option, selectedType === 'simple' && styles.selectedOption]}
                noPadding
            >
                <TouchableOpacity style={styles.content} onPress={() => onSelect('simple')} activeOpacity={0.8}>
                    <View style={styles.header}>
                        <View style={[styles.iconContainer, selectedType === 'simple' && styles.selectedIconContainer]}>
                            {selectedType === 'simple' && <MaterialIcons name="check" size={16} color={colors.surface} />}
                        </View>
                    </View>

                    <View style={styles.body}>
                        <View style={styles.iconPlaceholder}>
                            <MaterialIcons name="check-circle" size={24} color={colors.textSecondary} />
                        </View>
                        <AppText variant="subheading" style={styles.label}>Simple</AppText>
                        <AppText variant="caption" color={colors.textSecondary}>Check rápido</AppText>
                    </View>
                </TouchableOpacity>
            </Card>

            <Card
                style={[styles.option, selectedType === 'training' && styles.selectedOption]}
                noPadding
            >
                <TouchableOpacity style={styles.content} onPress={() => onSelect('training')} activeOpacity={0.8}>
                    <View style={styles.header}>
                        {selectedType === 'training' && (
                            <View style={styles.checkBadge}>
                                <MaterialIcons name="check" size={12} color={colors.surface} />
                            </View>
                        )}
                    </View>

                    <View style={styles.body}>
                        <View style={[styles.iconPlaceholder, { backgroundColor: '#2563EB' }]}>
                            <MaterialIcons name="fitness-center" size={24} color={colors.surface} />
                        </View>
                        <AppText variant="subheading" style={[styles.label, { color: '#2563EB' }]}>Entrenamiento</AppText>
                        <AppText variant="caption" style={{ color: '#2563EB' }}>Series y reps</AppText>
                    </View>
                </TouchableOpacity>
            </Card>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    option: {
        flex: 1,
        borderWidth: 1,
        borderColor: 'transparent',
        minHeight: 120,
    },
    selectedOption: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF', // Light blue bg
    },
    content: {
        padding: spacing.md,
        flex: 1,
    },
    header: {
        alignItems: 'flex-end',
        marginBottom: spacing.xs,
        height: 20,
    },
    checkBadge: {
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#2563EB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {
        // Placeholder for unselected logic if needed
    },
    selectedIconContainer: {
        // Logic for Simple check
    },
    body: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    iconPlaceholder: {
        width: 40,
        height: 40,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
    },
    label: {
        fontWeight: '700',
        marginBottom: 2,
    }
});
