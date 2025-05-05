import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, Theme } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import baseTheme from '../theme';

interface ThemeContextType {
  mode: PaletteMode;
  theme: Theme;
  toggleColorMode: () => void;
  animationIntensity: 'low' | 'medium' | 'high';
  setAnimationIntensity: (intensity: 'low' | 'medium' | 'high') => void;
  typographyScale: 'normal' | 'bold' | 'extra-bold';
  setTypographyScale: (scale: 'normal' | 'bold' | 'extra-bold') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useAppTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
};

// Récupérer les préférences utilisateur du localStorage
const getStoredThemePreferences = () => {
  try {
    const storedMode = localStorage.getItem('themeMode') as PaletteMode | null;
    const storedAnimationIntensity = localStorage.getItem('animationIntensity') as 'low' | 'medium' | 'high' | null;
    const storedTypographyScale = localStorage.getItem('typographyScale') as 'normal' | 'bold' | 'extra-bold' | null;
    
    return {
      mode: storedMode || 'dark',
      animationIntensity: storedAnimationIntensity || 'medium',
      typographyScale: storedTypographyScale || 'bold'
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des préférences de thème:', error);
    return {
      mode: 'dark',
      animationIntensity: 'medium',
      typographyScale: 'bold'
    };
  }
};

// Fonction pour créer un thème avec les préférences utilisateur
const createCustomTheme = (
  mode: PaletteMode, 
  animationIntensity: 'low' | 'medium' | 'high',
  typographyScale: 'normal' | 'bold' | 'extra-bold'
): Theme => {
  // Facteurs d'échelle pour la typographie
  const typographyScaleFactor = {
    'normal': 1,
    'bold': 1.15,
    'extra-bold': 1.3
  };
  
  // Facteurs d'animation
  const animationSpeedFactor = {
    'low': 1.5,
    'medium': 1,
    'high': 0.7
  };
  
  // Créer un thème personnalisé basé sur le thème de base
  return createTheme({
    ...baseTheme,
    palette: {
      ...baseTheme.palette,
      mode,
      // Ajuster les couleurs en fonction du mode
      ...(mode === 'dark' 
        ? {
            background: {
              default: '#111827',
              paper: '#1F2937',
            }
          } 
        : {
            background: {
              default: '#F9FAFB',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#111827',
              secondary: '#4B5563',
            }
          }
      )
    },
    typography: {
      ...baseTheme.typography,
      // Ajuster la taille de la typographie en fonction de l'échelle
      h1: {
        ...baseTheme.typography.h1,
        fontSize: `${3.5 * typographyScaleFactor[typographyScale]}rem`,
        fontWeight: typographyScale === 'extra-bold' ? 900 : 800,
      },
      h2: {
        ...baseTheme.typography.h2,
        fontSize: `${2.75 * typographyScaleFactor[typographyScale]}rem`,
        fontWeight: typographyScale === 'normal' ? 700 : 800,
      },
      h3: {
        ...baseTheme.typography.h3,
        fontSize: `${2.25 * typographyScaleFactor[typographyScale]}rem`,
        fontWeight: typographyScale === 'normal' ? 600 : 700,
      },
      h4: {
        ...baseTheme.typography.h4,
        fontSize: `${1.75 * typographyScaleFactor[typographyScale]}rem`,
      },
      h5: {
        ...baseTheme.typography.h5,
        fontSize: `${1.5 * typographyScaleFactor[typographyScale]}rem`,
      },
      h6: {
        ...baseTheme.typography.h6,
        fontSize: `${1.25 * typographyScaleFactor[typographyScale]}rem`,
      },
      subtitle1: {
        ...baseTheme.typography.subtitle1,
        fontSize: `${1.125 * typographyScaleFactor[typographyScale]}rem`,
      },
      subtitle2: {
        ...baseTheme.typography.subtitle2,
        fontSize: `${0.875 * typographyScaleFactor[typographyScale]}rem`,
      },
      body1: {
        ...baseTheme.typography.body1,
        fontSize: `${1 * typographyScaleFactor[typographyScale]}rem`,
      },
      body2: {
        ...baseTheme.typography.body2,
        fontSize: `${0.875 * typographyScaleFactor[typographyScale]}rem`,
      },
    },
    // Ajuster les vitesses d'animation
    animation: {
      shortest: baseTheme.animation.shortest * animationSpeedFactor[animationIntensity],
      shorter: baseTheme.animation.shorter * animationSpeedFactor[animationIntensity],
      short: baseTheme.animation.short * animationSpeedFactor[animationIntensity],
      standard: baseTheme.animation.standard * animationSpeedFactor[animationIntensity],
      complex: baseTheme.animation.complex * animationSpeedFactor[animationIntensity],
      enteringScreen: baseTheme.animation.enteringScreen * animationSpeedFactor[animationIntensity],
      leavingScreen: baseTheme.animation.leavingScreen * animationSpeedFactor[animationIntensity],
    },
  });
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const AppThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  // Récupérer les préférences stockées
  const storedPreferences = getStoredThemePreferences();
  

  const [mode, setMode] = useState<PaletteMode>(storedPreferences.mode as PaletteMode);
  const [animationIntensity, setAnimationIntensity] = useState<'low' | 'medium' | 'high'>(
    storedPreferences.animationIntensity as 'low' | 'medium' | 'high'
  );
  const [typographyScale, setTypographyScale] = useState<'normal' | 'bold' | 'extra-bold'>(
    storedPreferences.typographyScale as 'normal' | 'bold' | 'extra-bold'
  );
  
  // Créer le thème avec les préférences actuelles
  const theme = createCustomTheme(mode, animationIntensity, typographyScale);
  
  // Mettre à jour le localStorage quand les préférences changent
  useEffect(() => {
    localStorage.setItem('themeMode', mode);
  }, [mode]);
  
  useEffect(() => {
    localStorage.setItem('animationIntensity', animationIntensity);
  }, [animationIntensity]);
  
  useEffect(() => {
    localStorage.setItem('typographyScale', typographyScale);
  }, [typographyScale]);
  
  // Basculer entre les modes clair et sombre
  const toggleColorMode = () => {
    setMode(prevMode => (prevMode === 'light' ? 'dark' : 'light'));
  };
  
  // Définir l'intensité des animations
  const handleSetAnimationIntensity = (intensity: 'low' | 'medium' | 'high') => {
    setAnimationIntensity(intensity);
  };
  
  // Définir l'échelle de la typographie
  const handleSetTypographyScale = (scale: 'normal' | 'bold' | 'extra-bold') => {
    setTypographyScale(scale);
  };
  
  const value = {
    mode,
    theme,
    toggleColorMode,
    animationIntensity,
    setAnimationIntensity: handleSetAnimationIntensity,
    typographyScale,
    setTypographyScale: handleSetTypographyScale
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
