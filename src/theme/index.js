export const colors = {
  // Core aurora palette (Sleek Cyber-Dark Wellness)
  primary: '#8B5CF6',       // Electric Violet
  primaryLight: '#C084FC',  // Neon Lavender
  primaryDark: '#5B21B6',   // Deep Amethyst
  accent: '#10B981',        // Emerald Mint
  accentBlue: '#3B82F6',    // Cyber Blue
  accentPink: '#F43F5E',    // Neon Rose
  accentGold: '#F59E0B',    // Amber Gold

  // Backgrounds (Glassmorphic dark UI)
  bg: '#050308',            // Deep Space Black
  bgCard: '#110D1D',        // Dark Velvet Card
  bgElevated: '#1A142D',    // Elevated Velvet Card
  bgInput: '#161125',       // Dark Input Field

  // Text
  text: '#FAFAFF',          // Pure Off-White
  textSecondary: '#A78BFA',  // Soft Lavender Subtext
  textMuted: '#6D6B8F',      // Muted Slate

  // UI Borders
  border: 'rgba(139, 92, 246, 0.15)',      // Muted violet border
  borderLight: 'rgba(192, 132, 252, 0.25)', // Bright lavender border

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',

  // Gradients
  gradientPrimary: ['#8B5CF6', '#C084FC'],
  gradientAurora: ['#8B5CF6', '#EC4899', '#10B981'],
  gradientCard: ['#120E21', '#1A1430'],
  gradientMint: ['#10B981', '#059669'],
  gradientBlue: ['#3B82F6', '#2563EB'],
  gradientPink: ['#F43F5E', '#D946EF'],
  gradientGold: ['#F59E0B', '#D97706'],
  gradientNight: ['#050308', '#110D1D'],
};

export const fonts = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
    xxxl: 36,
    hero: 46,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  full: 999,
};

export const shadows = {
  card: {
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: {
    shadowColor: '#C084FC',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 24,
    elevation: 12,
  },
  mintGlow: {
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  blueGlow: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  goldGlow: {
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
};
