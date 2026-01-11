import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Modal, Animated, TouchableOpacity } from 'react-native';
import { AppText, PrimaryButton } from '../design-system/components';
import { colors, spacing, radius } from '../design-system/tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface StreakCompletionModalProps {
    visible: boolean;
    streakDays: number;
    onClose: () => void;
}

interface StreakContent {
    title: string;
    mainMessage: string;
    secondaryMessage: string;
    showEmoji?: boolean;
}

const getStreakContent = (days: number): StreakContent => {
    // Hitos grandes
    if ([365, 180, 90, 60, 30, 21].includes(days)) {
        return {
            title: `${days} días`,
            mainMessage: 'Es parte de quién eres.',
            secondaryMessage: 'Sigue construyendo.',
        };
    }

    // 7 días (primer hito)
    if (days === 7) {
        return {
            title: '7 días seguidos 🎉',
            mainMessage: 'Una semana cumplida.',
            secondaryMessage: 'Lo difícil ya pasó.',
            showEmoji: true,
        };
    }

    // 8 a 20 días
    if (days >= 8 && days <= 20) {
        return {
            title: `Racha de ${days} días`,
            mainMessage: 'Parte de tu día.',
            secondaryMessage: 'El progreso es inevitable.',
        };
    }

    // 4 a 6 días
    if (days >= 4 && days <= 6) {
        return {
            title: `${days} días seguidos`,
            mainMessage: 'Consistencia en acción.',
            secondaryMessage: 'Solo sigue apareciendo.',
        };
    }

    // 2 a 3 días
    if (days >= 2 && days <= 3) {
        return {
            title: `Racha de ${days} días`,
            mainMessage: 'Empieza a ser un patrón.',
            secondaryMessage: 'Mañana repite lo simple.',
        };
    }

    // Primer día (default)
    return {
        title: 'Racha de 1 día',
        mainMessage: 'Hoy cumpliste contigo.',
        secondaryMessage: 'Sin este día no hay otros.',
    };
};

export const StreakCompletionModal: React.FC<StreakCompletionModalProps> = ({
    visible,
    streakDays,
    onClose,
}) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    const content = getStreakContent(streakDays);

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.9);
        }
    }, [visible]);

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            onRequestClose={onClose}
        >
            <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
                <TouchableOpacity
                    style={StyleSheet.absoluteFill}
                    activeOpacity={1}
                    onPress={onClose}
                />
                <Animated.View
                    style={[
                        styles.modalContainer,
                        {
                            opacity: fadeAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <MaterialIcons name="military-tech" size={32} color="#FFFFFF" />
                    </View>

                    {/* Title */}
                    <AppText variant="heading" centered style={styles.title}>
                        {content.title}
                    </AppText>

                    {/* Main Message */}
                    <AppText variant="subheading" centered style={styles.mainMessage}>
                        {content.mainMessage}
                    </AppText>

                    {/* Secondary Message */}
                    <AppText variant="body" color={colors.textSecondary} centered style={styles.secondaryMessage}>
                        {content.secondaryMessage}
                    </AppText>

                    {/* CTA Button */}
                    <PrimaryButton
                        label="Continuar"
                        onPress={onClose}
                    />
                </Animated.View>
            </Animated.View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.lg,
    },
    modalContainer: {
        backgroundColor: colors.surface,
        borderRadius: 32, // More rounded (was radius.xl which is usually smaller)
        padding: spacing.xl, // Slightly less padding for cleaner look
        width: '100%',
        maxWidth: 340,
        alignItems: 'center',
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 9999,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '700',
        marginBottom: spacing.md,
    },
    mainMessage: {
        fontSize: 16,
        fontWeight: '600',
        lineHeight: 24,
        marginBottom: spacing.sm,
    },
    secondaryMessage: {
        fontSize: 14,
        lineHeight: 22,
        marginBottom: spacing.xl,
    },
});
