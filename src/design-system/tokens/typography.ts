import { TextStyle } from 'react-native';

// Defining font weight types for clarity
type FontWeight = '400' | '500' | '600' | '700';

export interface TypographyVariant {
    fontSize: number;
    fontWeight: FontWeight;
    fontFamily?: string;
    lineHeight: number;
}

export const typography: Record<string, TypographyVariant> = {
    heading: {
        fontSize: 28, // Larger
        fontWeight: '700',
        fontFamily: 'PlusJakartaSans-Bold',
        lineHeight: 34,
    },
    subheading: {
        fontSize: 20,
        fontWeight: '600',
        fontFamily: 'PlusJakartaSans-SemiBold',
        lineHeight: 28,
    },
    body: {
        fontSize: 16,
        fontWeight: '400',
        fontFamily: 'PlusJakartaSans-Regular',
        lineHeight: 24,
    },
    caption: {
        fontSize: 14,
        fontWeight: '500', // Slightly bolder for small text validation
        fontFamily: 'PlusJakartaSans-Medium',
        lineHeight: 20,
    },
    small: {
        fontSize: 12,
        fontWeight: '400',
        fontFamily: 'PlusJakartaSans-Regular',
        lineHeight: 16,
    }
};

// Helper utility to get style object
export const getTypographyStyle = (variant: keyof typeof typography): TextStyle => {
    // We strip fontFamily locally if we haven't loaded fonts yet to prevent crash, 
    // but in AppText we will assume loading is handled.
    return typography[variant];
};
