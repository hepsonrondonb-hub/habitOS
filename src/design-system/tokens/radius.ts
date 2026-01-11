export const radius = {
    sm: 8,
    md: 12,
    lg: 16,
    full: 9999,
} as const;

export type RadiusToken = keyof typeof radius;
