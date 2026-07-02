// Design tokens — matches the HomeServe web reference (light theme, blue accent)
export const colors = {
  // Brand blue
  primary: '#1A5FE8',
  primaryDark: '#1448B8',
  primaryLight: '#EAF1FE',
  gradientStart: '#1A5FE8',
  gradientEnd: '#3B7BFF',

  // Surfaces
  background: '#F5F7FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F4FA',

  // Text
  textPrimary: '#0F1A2B',
  textSecondary: '#5B6B82',
  textMuted: '#94A1B5',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#E7ECF3',
  borderLight: '#F0F3F8',

  // Status
  success: '#19A463',
  successLight: '#E7F8EF',
  warning: '#E8910A',
  warningLight: '#FEF4E3',
  danger: '#E5484D',
  dangerLight: '#FCEAEB',
  info: '#1A5FE8',

  // Misc
  star: '#F5A623',
  overlay: 'rgba(15, 26, 43, 0.45)',
  white: '#FFFFFF',
  black: '#000000',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

export const fontSize = {
  xs: 12,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  display: 32,
};

export const fontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const shadow = {
  card: {
    shadowColor: '#0F1A2B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  raised: {
    shadowColor: '#0F1A2B',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 6,
  },
  subtle: {
    shadowColor: '#0F1A2B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
};

export const theme = { colors, spacing, radius, fontSize, fontWeight, shadow };
export default theme;
