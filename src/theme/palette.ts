import { PaletteOptions } from '@mui/material/styles';

const palette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#6C63FF',
    light: '#9D97FF',
    dark: '#4B45CB',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#FF6584',
    light: '#FF8DA3',
    dark: '#D14D69',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#111827',
    paper: '#1F2937',
  },
  error: {
    main: '#F87171',
    light: '#FCA5A5',
    dark: '#DC2626',
  },
  warning: {
    main: '#FBBF24',
    light: '#FCD34D',
    dark: '#D97706',
  },
  info: {
    main: '#60A5FA',
    light: '#93C5FD',
    dark: '#2563EB',
  },
  success: {
    main: '#34D399',
    light: '#6EE7B7',
    dark: '#059669',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#D1D5DB',
    disabled: '#6B7280',
  },
  divider: 'rgba(209, 213, 219, 0.12)',
  action: {
    active: '#F9FAFB',
    hover: 'rgba(249, 250, 251, 0.08)',
    selected: 'rgba(249, 250, 251, 0.16)',
    disabled: 'rgba(249, 250, 251, 0.3)',
    disabledBackground: 'rgba(249, 250, 251, 0.12)',
    focus: 'rgba(249, 250, 251, 0.12)',
  },
};

export default palette;
