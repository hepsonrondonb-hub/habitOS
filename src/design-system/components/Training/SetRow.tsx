import React from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';
import { TrainingSet } from '../../../store/HabitContext';

interface SetRowProps {
    setNumber: number;
    data: TrainingSet;
    onChange: (id: string, field: 'weight' | 'reps', value: string) => void;
    onToggle: (id: string) => void;
}

export const SetRow: React.FC<SetRowProps> = ({ setNumber, data, onChange, onToggle }) => {
    return (
        <View style={styles.container}>
            <View style={styles.colSet}>
                <View style={styles.setBadge}>
                    <AppText variant="caption" style={styles.setText}>{setNumber}</AppText>
                </View>
            </View>

            <View style={styles.colInput}>
                <TextInput
                    style={styles.input}
                    value={data.weight}
                    onChangeText={(t) => onChange(data.id, 'weight', t)}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            <View style={styles.colInput}>
                <TextInput
                    style={styles.input}
                    value={data.reps}
                    onChangeText={(t) => onChange(data.id, 'reps', t)}
                    keyboardType="numeric"
                    placeholder="-"
                    placeholderTextColor={colors.textSecondary}
                />
            </View>

            <View style={styles.colAction}>
                <TouchableOpacity
                    style={[styles.checkButton, data.completed && styles.checkButtonActive]}
                    onPress={() => onToggle(data.id)}
                >
                    <MaterialIcons
                        name="check"
                        size={16}
                        color={data.completed ? colors.surface : colors.textSecondary}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    colSet: {
        width: 40,
        alignItems: 'center',
    },
    setBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setText: {
        fontWeight: '600',
        fontSize: 12,
        color: colors.textSecondary,
    },
    colInput: {
        flex: 1,
        alignItems: 'center',
    },
    input: {
        width: 60,
        height: 36,
        backgroundColor: '#F9FAFB',
        borderRadius: 12,
        textAlign: 'center',
        fontWeight: '700',
        fontSize: 16,
        color: colors.textPrimary,
    },
    colAction: {
        width: 50,
        alignItems: 'center',
    },
    checkButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.divider,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surface,
    },
    checkButtonActive: {
        backgroundColor: '#2563EB',
        borderColor: '#2563EB',
    }
});
