import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../../tokens';
import { AppText } from '../AppText';

interface SecondaryButtonProps extends TouchableOpacityProps {
    label: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
    label,
    style,
    ...props
}) => {
    return (
        <TouchableOpacity
            style={[styles.container, style]}
            activeOpacity={0.7}
            {...props}
        >
            <AppText variant="body" style={styles.text}>{label}</AppText>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: colors.textSecondary,
        fontWeight: '500',
    }
});
