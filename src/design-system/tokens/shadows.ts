import { Platform, ViewStyle } from 'react-native';

// Standardized shadows for consistency across platforms
export const shadows = {
    sm: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
        },
        android: {
            elevation: 2,
        },
        default: {},
    }) as ViewStyle, // Casting as ViewStyle to simplify usage

    md: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
        },
        android: {
            elevation: 4,
        },
        default: {},
    }) as ViewStyle,

    none: {
        elevation: 0,
        shadowOpacity: 0,
    } as ViewStyle,
};

export type ShadowToken = keyof typeof shadows;
