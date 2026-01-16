import { Platform, ViewStyle } from 'react-native';
import { colors } from './colors';

// Standardized shadows for consistency across platforms
export const shadows = {
    sm: Platform.select({
        ios: {
            shadowColor: colors.iosShadow,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1, // Subtle color hint
            shadowRadius: 6,
        },
        android: {
            elevation: 3,
        },
        default: {},
    }) as ViewStyle,

    md: Platform.select({
        ios: {
            shadowColor: colors.iosShadow,
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.15, // Stronger pop
            shadowRadius: 20,
        },
        android: {
            elevation: 8,
        },
        default: {},
    }) as ViewStyle,

    none: {
        elevation: 0,
        shadowOpacity: 0,
    } as ViewStyle,
};

export type ShadowToken = keyof typeof shadows;
