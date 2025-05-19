const tintColorLight = '#2563EB'; // Blue 600
const tintColorDark = '#3B82F6'; // Blue 500

export default {
  light: {
    text: '#000000',
    textSecondary: '#64748B', // Slate 500
    background: '#F8FAFC', // Slate 50
    tint: tintColorLight,
    tintLight: 'rgba(37, 99, 235, 0.1)',
    tabIconDefault: '#CBD5E1', // Slate 300
    tabIconSelected: tintColorLight,
    card: '#FFFFFF',
    border: '#E2E8F0', // Slate 200
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#94A3B8', // Slate 400
    background: '#0F172A', // Slate 900
    tint: tintColorDark,
    tintLight: 'rgba(59, 130, 246, 0.2)',
    tabIconDefault: '#475569', // Slate 600
    tabIconSelected: tintColorDark,
    card: '#1E293B', // Slate 800
    border: '#334155', // Slate 700
  },
  success: '#22C55E', // Green 500
  error: '#EF4444',   // Red 500
  warning: '#F59E0B', // Amber 500
  info: '#3B82F6',    // Blue 500
};