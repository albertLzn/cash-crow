import { createTheme, responsiveFontSizes, Theme } from '@mui/material/styles';
import typography from './typography';
import palette from './palette';

// Augment the theme to include custom properties
declare module '@mui/material/styles' {
  interface Theme {
    customShadows: {
      card: string;
      dialog: string;
      button: string;
      dropdown: string;
    };
    animation: {
      shortest: number;
      shorter: number;
      short: number;
      standard: number;
      complex: number;
      enteringScreen: number;
      leavingScreen: number;
    };
  }

  interface ThemeOptions {
    customShadows?: {
      card?: string;
      dialog?: string;
      button?: string;
      dropdown?: string;
    };
    animation?: {
      shortest?: number;
      shorter?: number;
      short?: number;
      standard?: number;
      complex?: number;
      enteringScreen?: number;
      leavingScreen?: number;
    };
  }
}

const baseTheme = createTheme({
  palette,
  typography,
  shape: {
    borderRadius: 12,
  },
  customShadows: {
    card: '0 4px 20px 0 rgba(0,0,0,0.12)',
    dialog: '0 8px 24px 0 rgba(0,0,0,0.16)',
    button: '0 4px 12px 0 rgba(108, 99, 255, 0.3)',
    dropdown: '0 8px 16px 0 rgba(0,0,0,0.16)',
  },
  animation: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          boxShadow: '0 4px 12px 0 rgba(108, 99, 255, 0.3)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px 0 rgba(0,0,0,0.12)',
          backdropFilter: 'blur(4px)',
          background: 'rgba(31, 41, 55, 0.8)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: 24,
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
  },
});

const theme: Theme = responsiveFontSizes(baseTheme);

export default theme;
