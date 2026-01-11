import React from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Pressable } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../AppText';
import { PrimaryButton } from '../Buttons/PrimaryButton';
import { colors, spacing, radius, shadows } from '../../tokens';

export interface SuccessModalProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    buttonLabel?: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
    visible,
    title,
    message,
    onClose,
    buttonLabel = 'Entendido'
}) => {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.backdrop} onPress={onClose}>
                <Pressable style={styles.modalContainer} onPress={(e) => e.stopPropagation()}>
                    {/* Success Icon */}
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="check" size={32} color={colors.primary} />
                    </View>

                    {/* Title */}
                    <AppText variant="heading" centered style={styles.title}>
                        {title}
                    </AppText>

                    {/* Message */}
                    <AppText variant="body" centered color={colors.textSecondary} style={styles.message}>
                        {message}
                    </AppText>

                    {/* Button */}
                    <PrimaryButton
                        label={buttonLabel}
                        onPress={onClose}
                        style={styles.button}
                    />
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContainer: {
        backgroundColor: colors.surface,
        borderRadius: 24,
        padding: spacing.xl,
        width: '100%',
        maxWidth: 400,
        alignItems: 'center',
        ...shadows.md,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: spacing.sm,
    },
    message: {
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
    button: {
        width: '100%',
    }
});
