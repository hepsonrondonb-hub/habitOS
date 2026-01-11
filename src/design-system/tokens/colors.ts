export const colors = {
  // Main background
  background: '#F8FAFC', // Slate 50
  
  // Surface for cards and elements on top of background
  surface: '#FFFFFF',

  // Brand primary color (Blue)
  primary: '#2563EB', // Blue 600
  primarySoft: '#EFF6FF', // Blue 50 - backgrounds active

  // Text colors
  textPrimary: '#0F172A', // Slate 900 - Headings
  textSecondary: '#64748B', // Slate 500 - Body/Subtitles

  // Status colors
  success: '#10B981', // Emerald 500 - Checks, success states
  danger: '#EF4444', // Red 500 - Errors, logout

  // UI Elements
  disabled: '#CBD5E1', // Slate 300 - Disabled states
  divider: '#E2E8F0', // Slate 200 - Borders, dividers
} as const;

export type ColorToken = keyof typeof colors;
