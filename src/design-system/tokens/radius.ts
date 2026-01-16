export const radius = {
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32, // New super round
    full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
