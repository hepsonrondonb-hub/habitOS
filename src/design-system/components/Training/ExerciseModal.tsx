import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { AppText } from '../AppText';
import { PrimaryButton } from '../Buttons';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface ExerciseModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (name: string, muscleGroup?: string) => void;
    initialName?: string;
    initialMuscleGroup?: string;
    isEditing?: boolean;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
    visible,
    onClose,
    onSave,
    initialName = '',
    initialMuscleGroup = '',
    isEditing = false
}) => {
    const [name, setName] = useState(initialName);
    const [muscleGroup, setMuscleGroup] = useState(initialMuscleGroup);

    useEffect(() => {
        if (visible) {
            setName(initialName);
            setMuscleGroup(initialMuscleGroup);
        }
    }, [visible, initialName, initialMuscleGroup]);

    const handleSave = () => {
        if (!name.trim()) return;
        onSave(name, muscleGroup);
        onClose();
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.overlay}
            >
                <View style={styles.container}>
                    {/* Header */}
                    <View style={styles.header}>
                        <AppText variant="subheading" style={{ fontWeight: '700' }}>
                            {isEditing ? 'Editar Ejercicio' : 'Nuevo Ejercicio'}
                        </AppText>
                        <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <MaterialIcons name="close" size={24} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>

                    {/* Form */}
                    <View style={styles.formItem}>
                        <AppText variant="caption" style={styles.label}>NOMBRE DEL EJERCICIO</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Press de Banca"
                            value={name}
                            onChangeText={setName}
                            placeholderTextColor={colors.textSecondary}
                            autoFocus
                        />
                    </View>

                    <View style={styles.formItem}>
                        <AppText variant="caption" style={styles.label}>GRUPO MUSCULAR (OPCIONAL)</AppText>
                        <TextInput
                            style={styles.input}
                            placeholder="Ej: Pectoral"
                            value={muscleGroup}
                            onChangeText={setMuscleGroup}
                            placeholderTextColor={colors.textSecondary}
                        />
                    </View>

                    <View style={styles.footer}>
                        <PrimaryButton
                            label={isEditing ? 'Guardar cambios' : 'Agregar ejercicio'}
                            onPress={handleSave}
                            disabled={!name.trim()}
                        />
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    container: {
        backgroundColor: colors.background,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: spacing.lg,
        paddingBottom: spacing.xxl + 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    formItem: {
        marginBottom: spacing.lg,
    },
    label: {
        fontWeight: '700',
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: spacing.md,
        fontSize: 16,
        color: colors.textPrimary,
    },
    footer: {
        marginTop: spacing.md,
    }
});
