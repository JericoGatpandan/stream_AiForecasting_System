import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { designTokens } from '../design/tokens';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface CustomThemeProviderProps {
  children: ReactNode;
}

// Enhanced theme creation function
const createEnhancedTheme = (isDarkMode: boolean) => {
  return createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: designTokens.colors.primary[500],
        light: designTokens.colors.primary[400],
        dark: designTokens.colors.primary[700],
        contrastText: '#ffffff',
      },
      secondary: {
        main: designTokens.colors.gray[600],
        light: designTokens.colors.gray[400],
        dark: designTokens.colors.gray[800],
        contrastText: '#ffffff',
      },
      success: {
        main: designTokens.colors.success[500],
        light: designTokens.colors.success[200],
        dark: designTokens.colors.success[700],
      },
      warning: {
        main: designTokens.colors.warning[500],
        light: designTokens.colors.warning[200],
        dark: designTokens.colors.warning[700],
      },
      error: {
        main: designTokens.colors.error[500],
        light: designTokens.colors.error[200],
        dark: designTokens.colors.error[700],
      },
      background: {
        default: isDarkMode 
          ? designTokens.colors.background.dark 
          : designTokens.colors.background.light,
        paper: isDarkMode 
          ? designTokens.colors.background.darkSecondary 
          : designTokens.colors.background.light,
      },
      text: {
        primary: isDarkMode ? '#FFFFFF' : designTokens.colors.gray[900],
        secondary: isDarkMode ? designTokens.colors.gray[400] : designTokens.colors.gray[600],
      },
    },
    
    typography: {
      fontFamily: designTokens.typography.fontFamily.primary,
      h1: {
        fontSize: designTokens.typography.fontSize['5xl'],
        fontWeight: designTokens.typography.fontWeight.bold,
        lineHeight: designTokens.typography.lineHeight.tight,
      },
      h2: {
        fontSize: designTokens.typography.fontSize['4xl'],
        fontWeight: designTokens.typography.fontWeight.bold,
        lineHeight: designTokens.typography.lineHeight.tight,
      },
      h3: {
        fontSize: designTokens.typography.fontSize['3xl'],
        fontWeight: designTokens.typography.fontWeight.semibold,
        lineHeight: designTokens.typography.lineHeight.tight,
      },
      h4: {
        fontSize: designTokens.typography.fontSize['2xl'],
        fontWeight: designTokens.typography.fontWeight.semibold,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      h5: {
        fontSize: designTokens.typography.fontSize.xl,
        fontWeight: designTokens.typography.fontWeight.medium,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      h6: {
        fontSize: designTokens.typography.fontSize.lg,
        fontWeight: designTokens.typography.fontWeight.medium,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      body1: {
        fontSize: designTokens.typography.fontSize.base,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
      body2: {
        fontSize: designTokens.typography.fontSize.sm,
        lineHeight: designTokens.typography.lineHeight.normal,
      },
    },
    
    shape: {
      borderRadius: parseInt(designTokens.borderRadius.base),
    },
    
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: designTokens.typography.fontWeight.medium,
            borderRadius: designTokens.borderRadius.md,
            padding: `${designTokens.spacing.sm} ${designTokens.spacing.lg}`,
            transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: designTokens.shadows.md,
            },
          },
          contained: {
            boxShadow: designTokens.shadows.sm,
            '&:hover': {
              boxShadow: designTokens.shadows.lg,
            },
          },
        },
      },
      
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borderRadius.lg,
            boxShadow: isDarkMode ? designTokens.shadows.xl : designTokens.shadows.md,
            border: isDarkMode 
              ? `1px solid ${designTokens.colors.gray[800]}` 
              : `1px solid ${designTokens.colors.gray[200]}`,
          },
        },
      },
      
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borderRadius.xl,
            transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: designTokens.shadows['2xl'],
            },
          },
        },
      },
      
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borderRadius.full,
            fontWeight: designTokens.typography.fontWeight.medium,
          },
        },
      },
      
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: designTokens.borderRadius.md,
            transition: `all ${designTokens.animation.duration.base} ${designTokens.animation.easing.easeOut}`,
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
    },
  });
};

export const CustomThemeProvider: React.FC<CustomThemeProviderProps> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem('stream-theme');
    return savedTheme === 'dark';
  });

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('stream-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  const theme = createEnhancedTheme(isDarkMode);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
