import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { AppText } from '../AppText/AppText';
import { colors, spacing, radius } from '../../tokens';

interface ToastProps {
    visible: boolean;
    message: string;
    icon?: 'check-circle' | 'local-fire-department' | 'trending-up';
    onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ visible, message, icon, onDismiss }) => {
    const translateY = React.useRef(new Animated.Value(-100)).current;
    const opacity = React.useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (visible) {
            // Slide in
            Animated.parallel([
                Animated.spring(translateY, {
                    toValue: 0,
                    friction: 8,
                    tension: 40,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Auto dismiss after 1.5s
            const timer = setTimeout(() => {
                Animated.parallel([
                    Animated.timing(translateY, {
                        toValue: -100,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(opacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start(() => onDismiss());
            }, 1500);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View style={styles.content}>
                {icon && (
                    <MaterialIcons
                        name={icon}
                        size={20}
                        color={colors.success}
                        style={styles.icon}
                    />
                )}
                <AppText variant="body" style={styles.message}>
                    {message}
                </AppText>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: spacing.xl,
        left: spacing.lg,
        right: spacing.lg,
        zIndex: 1000,
        alignItems: 'center',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.md,
        borderRadius: 9999,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    icon: {
        marginRight: spacing.sm,
    },
    message: {
        fontWeight: '600',
        color: colors.textPrimary,
    },
});
