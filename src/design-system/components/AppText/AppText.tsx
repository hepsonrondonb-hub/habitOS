import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography, getTypographyStyle } from '../../tokens';

export interface AppTextProps extends TextProps {
    variant?: keyof typeof typography;
    color?: string;
    centered?: boolean;
}

export const AppText: React.FC<AppTextProps> = ({
    children,
    variant = 'body',
    color = colors.textPrimary,
    centered = false,
    style,
    ...props
}) => {
    const textStyle = {
        ...getTypographyStyle(variant),
        color,
        textAlign: centered ? 'center' : 'auto',
    } as const;

    return (
        <Text style={[textStyle, style]} {...props}>
            {children}
        </Text>
    );
};
