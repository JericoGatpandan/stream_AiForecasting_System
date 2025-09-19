// Environment configuration and constants
export const config = {
  // API Configuration
  api: {
    baseUrl: import.meta.env.PROD 
      ? '/api' 
      : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500',
    timeout: 10000,
  },

  // App Configuration
  app: {
    title: import.meta.env.VITE_APP_TITLE || 'Stream AI Forecasting System',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
  },

  // Map Configuration
  map: {
    mapboxToken: import.meta.env.VITE_MAPBOX_TOKEN,
    defaultCenter: {
      lat: 13.6218,
      lng: 123.1948
    },
    defaultZoom: 12,
  },

  // Debug Configuration
  debug: {
    enableApiLogs: import.meta.env.DEV,
    enablePerformanceLogs: import.meta.env.DEV,
    enableErrorDetails: import.meta.env.DEV,
  },

  // Feature Flags
  features: {
    enable3DMap: import.meta.env.VITE_ENABLE_3D_MAP !== 'false',
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
    enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  },

  // Data refresh intervals (in milliseconds)
  intervals: {
    weatherData: 5 * 60 * 1000, // 5 minutes
    alertData: 2 * 60 * 1000,   // 2 minutes
    environmentalData: 10 * 60 * 1000, // 10 minutes
  },
};

// Validation function to check required environment variables
export const validateConfig = () => {
  const errors = [];

  if (!config.api.baseUrl) {
    errors.push('API base URL is not configured');
  }

  if (config.features.enable3DMap && !config.map.mapboxToken) {
    errors.push('Mapbox token is required for 3D maps but not configured');
  }

  if (errors.length > 0) {
    console.warn('Configuration issues found:', errors);
    return false;
  }

  return true;
};

// Initialize configuration
validateConfig();

export default config;