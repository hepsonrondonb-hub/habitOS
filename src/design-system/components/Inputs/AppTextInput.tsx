import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TextInputProps, TouchableOpacity, ViewStyle } from 'react-native';
import { AppText } from '../AppText';
import { colors, radius, spacing } from '../../tokens';
import { MaterialIcons } from '@expo/vector-icons';

interface AppTextInputProps extends TextInputProps {
    label?: string;
    error?: string;
    containerStyle?: ViewStyle;
}

export const AppTextInput: React.FC<AppTextInputProps> = ({
    label,
    error,
    secureTextEntry,
    containerStyle,
    style,
    ...props
}) => {
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPassword = !!secureTextEntry; // Original intent
    const shouldSecure = isPassword && !isPasswordVisible;

    return (
        <View style={[styles.container, containerStyle]}>
            {label && (
                <AppText variant="caption" style={styles.label}>
                    {label}
                </AppText>
            )}

            <View style={[styles.inputContainer, error ? styles.errorBorder : null]}>
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={colors.textTertiary || '#9CA3AF'}
                    secureTextEntry={shouldSecure}
                    {...props}
                />

                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                        style={styles.iconContainer}
                    >
                        <MaterialIcons
                            name={isPasswordVisible ? 'visibility' : 'visibility-off'}
                            size={20}
                            color={colors.textSecondary}
                        />
                    </TouchableOpacity>
                )}
            </View>

            {error && (
                <AppText variant="caption" color={colors.danger} style={styles.errorText}>
                    {error}
                </AppText>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: spacing.md,
    },
    label: {
        marginBottom: spacing.xs,
        fontWeight: '600',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3F4F6', // Light gray standard
        borderRadius: 12,
        paddingHorizontal: spacing.md,
        height: 50,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    input: {
        flex: 1,
        fontSize: 16,
        color: colors.textPrimary,
        height: '100%',
    },
    iconContainer: {
        padding: spacing.xs,
    },
    errorBorder: {
        borderColor: colors.danger,
        backgroundColor: '#FEF2F2', // Light red bg
    },
    errorText: {
        marginTop: spacing.xs,
    }
});
