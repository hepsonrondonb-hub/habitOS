import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing } from '../../tokens';

interface IconButtonProps extends TouchableOpacityProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    size?: number;
    color?: string;
    rounded?: boolean;
}

export const IconButton: React.FC<IconButtonProps> = ({
    icon,
    size = 24,
    color = colors.textPrimary,
    style,
    rounded = false,
    ...props
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                rounded && styles.rounded,
                style
            ]}
            activeOpacity={0.7}
            {...props}
        >
            <MaterialIcons name={icon} size={size} color={color} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: spacing.xs,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rounded: {
        backgroundColor: colors.primarySoft,
        borderRadius: 999,
        padding: spacing.sm,
    }
});
