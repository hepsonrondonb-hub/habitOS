import { TextStyle } from 'react-native';

// Defining font weight types for clarity
type FontWeight = '400' | '600' | '700';

export interface TypographyVariant {
    fontSize: number;
    fontWeight: FontWeight;
    lineHeight: number;
}

export const typography: Record<string, TypographyVariant> = {
    heading: {
        fontSize: 24,
        fontWeight: '700',
        lineHeight: 32,
    },
    subheading: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 26,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        lineHeight: 24,
    },
    caption: {
        fontSize: 14, // Adjusted from 12 for better readability on native
        fontWeight: '400',
        lineHeight: 20,
    },
    small: {
        fontSize: 12,
        fontWeight: '400',
        lineHeight: 16,
    }
};

// Helper utility to get style object
export const getTypographyStyle = (variant: keyof typeof typography): TextStyle => {
    return typography[variant];
};
