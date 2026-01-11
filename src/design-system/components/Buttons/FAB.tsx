import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text, Platform, LayoutAnimation, UIManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, shadows, spacing } from '../../tokens';
import { AppText } from '../AppText';

if (
    Platform.OS === 'android' &&
    UIManager.setLayoutAnimationEnabledExperimental
) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface FABProps {
    onAddAction: () => void;
    onCreatePlan: () => void;
}

export const FAB: React.FC<FABProps> = ({ onAddAction, onCreatePlan }) => {
    const [expanded, setExpanded] = useState(false);
    const animation = useRef(new Animated.Value(0)).current;

    const toggle = () => {
        const toValue = expanded ? 0 : 1;

        // Use LayoutAnimation for layout changes (container size)
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);

        Animated.spring(animation, {
            toValue,
            useNativeDriver: true,
            friction: 6,
            tension: 40
        }).start();

        setExpanded(!expanded);
    };

    const rotation = animation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '45deg']
    });

    return (
        <View style={[styles.wrapper, expanded && styles.wrapperExpanded]}>
            {expanded && (
                <View style={styles.optionsContainer}>
                    {/* Option: Create New Plan */}
                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => {
                            toggle();
                            onCreatePlan();
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <MaterialIcons name="adjust" size={24} color="#FFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <AppText style={styles.optionTitle}>Crear nuevo objetivo</AppText>
                            <AppText style={styles.optionSubtitle}>Iniciar un nuevo proceso</AppText>
                        </View>
                    </TouchableOpacity>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Option: Add Action */}
                    <TouchableOpacity
                        style={styles.optionRow}
                        onPress={() => {
                            toggle();
                            onAddAction();
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: colors.primary }]}>
                            <MaterialIcons name="add" size={24} color="#FFF" />
                        </View>
                        <View style={styles.textContainer}>
                            <AppText style={styles.optionTitle}>Agregar acción</AppText>
                            <AppText style={styles.optionSubtitle}>Ajustar un objetivo existente</AppText>
                        </View>
                    </TouchableOpacity>
                </View>
            )}

            <TouchableOpacity
                style={[styles.container, expanded && styles.containerExpanded]}
                activeOpacity={0.9}
                onPress={toggle}
            >
                <Animated.View style={{ transform: [{ rotate: rotation }] }}>
                    <MaterialIcons name="add" size={32} color={colors.surface} />
                </Animated.View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        bottom: spacing.sm, // Keep consistent with previous positioning
        right: spacing.xl,
        alignItems: 'flex-end',
        zIndex: 100,
    },
    wrapperExpanded: {
        bottom: spacing.md,
    },
    container: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...shadows.md,
    },
    containerExpanded: {
        // Red for closing (X) state? Or keep primary? User said "X". Blue X is fine too.
        // Let's keep primary but rotate to X.
        backgroundColor: colors.primary,
    },
    optionsContainer: {
        marginBottom: spacing.sm,
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: spacing.sm,
        width: 260,
        ...shadows.md,
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.sm,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    textContainer: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    optionSubtitle: {
        fontSize: 11,
        color: colors.textSecondary,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginHorizontal: spacing.sm,
    }
});
