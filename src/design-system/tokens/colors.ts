export const colors = {
  // Main background
  background: '#F8FAFC', // Slate 50

  // Surface for cards and elements on top of background
  surface: '#FFFFFF',

  // Brand primary color (Avitio Sage)
  primary: '#5F8D7F', // Sage Green
  primarySoft: '#F0F9F6', // Sage 50
  primaryGradientStart: '#749688', // Sage 500
  primaryGradientEnd: '#4B6E64', // Sage 700

  // Brand Specific
  brandDark: '#0F172A', // Dark Navy (Logo Background)
  brandMint: '#A7C7BD', // Light Mint

  // Accent (Warmth - Coral/Orange)
  accent: '#F97316', // Orange 500
  accentSoft: '#FFF7ED', // Orange 50

  // Text colors
  textPrimary: '#1E293B', // Slate 800 - Softer than pure black
  textSecondary: '#64748B', // Slate 500

  // Status colors
  success: '#10B981', // Emerald 500
  danger: '#EF4444', // Red 500

  // UI Elements
  disabled: '#CBD5E1', // Slate 300
  divider: '#E2E8F0', // Slate 200
  iosShadow: '#4F46E5', // Colored shadow
} as const;

export type ColorToken = keyof typeof colors;
