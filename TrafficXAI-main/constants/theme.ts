// TRAFFICX AI — Design Tokens
export const Colors = {
  // Base
  background: '#0a0c10',
  surface: '#111520',
  surfaceElevated: '#161b28',
  border: '#1e2535',
  borderLight: '#252d3d',

  // Brand
  primary: '#00d4aa',
  primaryDim: '#00d4aa22',
  primaryMuted: '#00a688',

  // Text
  textPrimary: '#f0f4ff',
  textSecondary: '#8892a4',
  textMuted: '#4a5568',

  // Status
  green: '#22c55e',
  greenBg: '#22c55e18',
  yellow: '#f59e0b',
  yellowBg: '#f59e0b18',
  orange: '#f97316',
  orangeBg: '#f97316 18',
  red: '#ef4444',
  redBg: '#ef444418',
  blue: '#3b82f6',
  blueBg: '#3b82f618',

  // Special
  emergency: '#ff3b5c',
  emergencyBg: '#ff3b5c18',
  gold: '#fbbf24',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 48,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  full: 999,
};

export const FontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  hero: 34,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};
