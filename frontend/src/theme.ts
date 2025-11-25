export const tokens = {
  grey: {
    50: "#fafafa",
    100: "#f5f5f5",
    200: "#eeeeee",
    300: "#e0e0e0",
    400: "#bdbdbd",
    500: "#9e9e9e",
    600: "#757575",
    700: "#616161",
    800: "#424242",
    900: "#212121",
  },
  primary: {
    // Modern blue - good for maps and weather data
    50: "#e3f2fd",
    100: "#bbdefb",
    200: "#90caf9",
    300: "#64b5f6",
    400: "#42a5f5",
    500: "#2196f3", // Main blue
    600: "#1e88e5",
    700: "#1976d2",
    800: "#1565c0",
    900: "#0d47a1",
  },
  secondary: {
    // Complementary orange for alerts and highlights
    50: "#fff3e0",
    100: "#ffe0b2",
    200: "#ffcc80",
    300: "#ffb74d",
    400: "#ffa726",
    500: "#ff9800", // Main orange
    600: "#fb8c00",
    700: "#f57c00",
    800: "#ef6c00",
    900: "#e65100",
  },
  success: {
    // Green for success states and positive weather indicators
    50: "#e8f5e8",
    100: "#c8e6c8",
    200: "#a5d6a7",
    300: "#81c784",
    400: "#66bb6a",
    500: "#4caf50", // Main green
    600: "#43a047",
    700: "#388e3c",
    800: "#2e7d32",
    900: "#1b5e20",
  },
  warning: {
    // Yellow/amber for warnings
    50: "#fffde7",
    100: "#fff9c4",
    200: "#fff59d",
    300: "#fff176",
    400: "#ffee58",
    500: "#ffeb3b", // Main yellow
    600: "#fdd835",
    700: "#fbc02d",
    800: "#f9a825",
    900: "#f57f17",
  },
  error: {
    // Red for errors and severe weather alerts
    50: "#ffebee",
    100: "#ffcdd2",
    200: "#ef9a9a",
    300: "#e57373",
    400: "#ef5350",
    500: "#f44336", // Main red
    600: "#e53935",
    700: "#d32f2f",
    800: "#c62828",
    900: "#b71c1c",
  },
  background: {
    default: "#fafafa", // Light background for better readability
    paper: "#ffffff",
    dark: "#121212", // For dark mode support
    overlay: "rgba(255, 255, 255, 0.95)", // Semi-transparent overlays over map
    mapOverlay: "rgba(0, 0, 0, 0.6)", // Dark overlay for text over map
  },
  text: {
    primary: "#212121",
    secondary: "#757575",
    disabled: "#bdbdbd",
    hint: "#9e9e9e",
    onDark: "#ffffff",
    onLight: "#212121",
  },
};

// mui theme settings
export const themeSettings = {
  palette: {
    mode: 'light' as const,
    primary: {
      ...tokens.primary,
      main: tokens.primary[500],
      light: tokens.primary[400],
      dark: tokens.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      ...tokens.secondary,
      main: tokens.secondary[500],
      light: tokens.secondary[400],
      dark: tokens.secondary[700],
      contrastText: '#ffffff',
    },
    success: {
      ...tokens.success,
      main: tokens.success[500],
      light: tokens.success[400],
      dark: tokens.success[700],
      contrastText: '#ffffff',
    },
    warning: {
      ...tokens.warning,
      main: tokens.warning[500],
      light: tokens.warning[400],
      dark: tokens.warning[700],
      contrastText: tokens.text.primary,
    },
    error: {
      ...tokens.error,
      main: tokens.error[500],
      light: tokens.error[400],
      dark: tokens.error[700],
      contrastText: '#ffffff',
    },
    grey: {
      ...tokens.grey,
    },
    background: {
      default: tokens.background.default,
      paper: tokens.background.paper,
    },
    text: {
      primary: tokens.text.primary,
      secondary: tokens.text.secondary,
      disabled: tokens.text.disabled,
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
    fontSize: 14, // Base font size increased for better readability
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: '2.5rem', // 40px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.01562em',
      color: tokens.text.primary,
      '@media (max-width:600px)': {
        fontSize: '2rem', // 32px on mobile
      },
    },
    h2: {
      fontSize: '2rem', // 32px
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.00833em',
      color: tokens.text.primary,
      '@media (max-width:600px)': {
        fontSize: '1.75rem', // 28px on mobile
      },
    },
    h3: {
      fontSize: '1.5rem', // 24px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '0em',
      color: tokens.text.primary,
      '@media (max-width:600px)': {
        fontSize: '1.25rem', // 20px on mobile
      },
    },
    h4: {
      fontSize: '1.25rem', // 20px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0.00735em',
      color: tokens.text.primary,
      '@media (max-width:600px)': {
        fontSize: '1.125rem', // 18px on mobile
      },
    },
    h5: {
      fontSize: '1.125rem', // 18px
      fontWeight: 500,
      lineHeight: 1.4,
      letterSpacing: '0em',
      color: tokens.text.primary,
      '@media (max-width:600px)': {
        fontSize: '1rem', // 16px on mobile
      },
    },
    h6: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.0075em',
      color: tokens.text.primary,
      '@media (max-width:600px)': {
        fontSize: '0.875rem', // 14px on mobile
      },
    },
    body1: {
      fontSize: '1rem', // 16px
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
      color: tokens.text.primary,
    },
    body2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
      color: tokens.text.secondary,
    },
    subtitle1: {
      fontSize: '1rem', // 16px
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
      color: tokens.text.primary,
    },
    subtitle2: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.57,
      letterSpacing: '0.00714em',
      color: tokens.text.secondary,
    },
    caption: {
      fontSize: '0.75rem', // 12px
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
      color: tokens.text.secondary,
    },
    overline: {
      fontSize: '0.75rem', // 12px
      fontWeight: 500,
      lineHeight: 2,
      letterSpacing: '0.16667em',
      textTransform: 'uppercase' as const,
      color: tokens.text.secondary,
    },
    button: {
      fontSize: '0.875rem', // 14px
      fontWeight: 500,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none' as const, // Remove uppercase transformation
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  components: {
    // Button component overrides
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          padding: '8px 16px',
          minHeight: 40,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    // Paper component for map overlays
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: `1px solid ${tokens.grey[200]}`,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
        elevation2: {
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      },
    },
    // Card component
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: `1px solid ${tokens.grey[200]}`,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    // AppBar for better map integration
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: tokens.background.overlay,
          color: tokens.text.primary,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          borderBottom: `1px solid ${tokens.grey[200]}`,
        },
      },
    },
    // Tooltip styling
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: tokens.background.mapOverlay,
          color: tokens.text.onDark,
          fontSize: '0.75rem',
          borderRadius: 6,
          padding: '8px 12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
        },
        arrow: {
          color: tokens.background.mapOverlay,
        },
      },
    },
    // Chip component for tags and labels
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: tokens.grey[100],
          color: tokens.text.primary,
          '&:hover': {
            backgroundColor: tokens.grey[200],
          },
        },
      },
    },
    // Icon button styling
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: tokens.grey[100],
            transform: 'scale(1.05)',
          },
        },
      },
    },
    // Form controls for better UX
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: tokens.background.paper,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.primary[400],
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: tokens.primary[500],
              borderWidth: 2,
            },
          },
        },
      },
    },
  },
};
