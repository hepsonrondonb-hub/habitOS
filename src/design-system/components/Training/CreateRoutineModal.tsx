import React, { useState } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity } from 'react-native';
import { AppText } from '../AppText/AppText';
import { PrimaryButton } from '../Buttons/PrimaryButton';
import { SegmentedControl } from '../Inputs/SegmentedControl';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface CreateRoutineModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (data: { name: string; type: 'Fuerza' | 'Cardio'; focus: string; duration: string }) => void;
}

const DURATION_OPTIONS = ['30', '45', '60'];

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({ visible, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [typeIndex, setTypeIndex] = useState(0); // 0: Fuerza, 1: Cardio
    const [focus, setFocus] = useState('');
    const [duration, setDuration] = useState('45'); // Default to 45

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({
            name,
            type: typeIndex === 0 ? 'Fuerza' : 'Cardio',
            focus,
            duration
        });
        // Reset
        setName('');
        setFocus('');
        setDuration('45');
        setTypeIndex(0);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <AppText variant="subheading" style={{ fontWeight: '700', flex: 1, textAlign: 'center', marginRight: 24 }}>Crear rutina</AppText>
                </View>

                <View style={styles.content}>
                    {/* Name */}
                    <View style={styles.formItem}>
                        <AppText variant="caption" style={styles.label}>Nombre de la rutina</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Full Body"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    {/* Type */}
                    <View style={styles.formItem}>
                        <AppText variant="caption" style={styles.label}>Tipo de rutina</AppText>
                        <SegmentedControl
                            options={['Fuerza', 'Cardio']}
                            selectedIndex={typeIndex}
                            onChange={setTypeIndex}
                        />
                    </View>

                    {/* Focus */}
                    <View style={styles.formItem}>
                        <AppText variant="caption" style={styles.label}>Enfoque (Opcional)</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Hipertrofia / Resistencia / Técnica"
                            value={focus}
                            onChangeText={setFocus}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    {/* Duration */}
                    <View style={styles.formItem}>
                        <AppText variant="caption" style={styles.label}>Duración estimada (min)</AppText>
                        <View style={styles.durationRow}>
                            {DURATION_OPTIONS.map((opt) => {
                                const isSelected = duration === opt;
                                return (
                                    <TouchableOpacity
                                        key={opt}
                                        style={[styles.durationPill, isSelected && styles.durationPillSelected]}
                                        onPress={() => setDuration(opt)}
                                    >
                                        <AppText
                                            variant="body"
                                            style={[styles.durationText, isSelected && styles.durationTextSelected]}
                                        >
                                            {opt}
                                        </AppText>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                </View>

                <View style={styles.footer}>
                    <PrimaryButton
                        label="Guardar rutina"
                        onPress={handleSave}
                        disabled={!name.trim()}
                        icon="add"
                    />
                    <AppText variant="caption" color={colors.textSecondary} centered style={{ marginTop: spacing.md }}>
                        Podrás editar esto más tarde en Ajustes
                    </AppText>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: spacing.lg,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.md,
    },
    content: {
        flex: 1,
    },
    formItem: {
        marginBottom: spacing.xl,
    },
    label: {
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 16,
        padding: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
    },
    durationRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    durationPill: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    durationPillSelected: {
        backgroundColor: '#EFF6FF',
        borderColor: colors.primary,
    },
    durationText: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
    durationTextSelected: {
        color: colors.primary,
    },
    footer: {
        marginBottom: spacing.xl,
    }
});
