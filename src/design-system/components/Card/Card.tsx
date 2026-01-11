import React from 'react';
import { View, ViewProps, StyleSheet, TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { colors, radius, shadows, spacing } from '../../tokens';

interface CardProps extends ViewProps {
    children: React.ReactNode;
    noPadding?: boolean;
    onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({
    children,
    style,
    noPadding = false,
    onPress,
    ...props
}) => {
    const cardStyles = [
        styles.card,
        !noPadding && styles.padding,
        style
    ];

    if (onPress) {
        return (
            <TouchableOpacity
                style={cardStyles}
                onPress={onPress}
                activeOpacity={0.7}
                {...(props as TouchableOpacityProps)}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View
            style={cardStyles}
            {...props}
        >
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        ...shadows.sm,
        overflow: 'visible', // Needed for shadows on Android/iOS sometimes
    },
    padding: {
        padding: spacing.md,
    }
});
