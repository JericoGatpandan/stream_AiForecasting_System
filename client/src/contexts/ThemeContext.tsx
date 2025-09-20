import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

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

// Figma design color palette
const figmaColors = {
  light: {
    background: '#FFFFFF',
    selection: '#5D7285',
    primary: '#0C7FDA',
    secondary: '#E9F5FE',
    text: '#1E252B',
    textSecondary: '#667A8A',
  },
  dark: {
    background: '#031C30',
    selection: '#5D7285',
    primary: '#0C7FDA',
    secondary: '#E9F5FE',
    text: '#FFFFFF',
    textSecondary: '#667A8A',
    paper: '#EFF2F4',
  },
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

  const colors = isDarkMode ? figmaColors.dark : figmaColors.light;
  
  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: colors.primary,
        dark: '#0A6BC7',
        light: '#4A9EFF',
        contrastText: '#ffffff',
      },
      secondary: {
        main: colors.selection,
        dark: '#4A5F71',
        light: '#7A8F9F',
        contrastText: '#ffffff',
      },
      background: {
        default: colors.background,
        paper: isDarkMode ? colors.paper || '#1A2332' : '#ffffff',
      },
      text: {
        primary: colors.text,
        secondary: colors.textSecondary,
      },
      action: {
        hover: isDarkMode ? 'rgba(93, 114, 133, 0.1)' : 'rgba(12, 127, 218, 0.08)',
        selected: colors.secondary,
      },
    },
    typography: {
      fontFamily: [
        '"Inter"',
        '"Roboto"',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif'
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.25,
      },
      h3: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: '1.25rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.125rem',
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode 
              ? '0 4px 20px rgba(0,0,0,0.3)' 
              : '0 4px 20px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDarkMode 
              ? '0 4px 16px rgba(0,0,0,0.3)' 
              : '0 4px 16px rgba(0,0,0,0.08)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDarkMode 
                ? '0 8px 32px rgba(0,0,0,0.4)' 
                : '0 8px 32px rgba(0,0,0,0.12)',
            },
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.05)',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};