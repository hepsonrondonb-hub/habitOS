import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, radius } from '../../tokens';

interface CircularCheckboxProps extends TouchableOpacityProps {
    checked: boolean;
    size?: number;
}

export const CircularCheckbox: React.FC<CircularCheckboxProps> = ({
    checked,
    size = 24,
    style,
    disabled,
    ...props
}) => {
    return (
        <TouchableOpacity
            style={[
                styles.container,
                { width: size, height: size, borderRadius: size / 2 },
                checked ? styles.checked : styles.unchecked,
                checked ? { backgroundColor: colors.success, borderColor: colors.success } : { borderColor: colors.disabled }, // Use success color for checked state based on visual context usually but sometimes primary. User said "success (check)".
                // Wait, screenshots show Blue checks for habits. "success" token was defined as Emerald. 
                // Let's re-examine image 1. Login check is Blue. Image 2 Onboarding check is Blue. Image 5. Training check is Blue.
                // The user prompt said: "success (check, progreso positivo)".
                // But the screenshots clearly show Blue (Primary) for checked items.
                // I will use Primary for the Checkbox to match screenshots "EXACTLY".
                checked && { backgroundColor: colors.primary, borderColor: colors.primary },
                disabled && { opacity: 0.5 },
                style
            ]}
            activeOpacity={0.8}
            disabled={disabled}
            {...props}
        >
            {checked && (
                <MaterialIcons name="check" size={size * 0.7} color={colors.surface} />
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
    },
    unchecked: {
        backgroundColor: 'transparent',
        borderColor: colors.disabled,
    },
    checked: {
        borderWidth: 0, // Filled
    }
});
