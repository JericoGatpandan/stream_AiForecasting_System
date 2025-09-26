export const colorSystem = {
  // Flood Risk Indicators with better contrast
  floodRisk: {
    low: {
      main: '#10B981', // Emerald-500
      background: '#ECFDF5', // Emerald-50
      text: '#047857', // Emerald-700
      border: '#10B981',
    },
    moderate: {
      main: '#F59E0B', // Amber-500
      background: '#FFFBEB', // Amber-50
      text: '#D97706', // Amber-600
      border: '#F59E0B',
    },
    high: {
      main: '#EF4444', // Red-500
      background: '#FEF2F2', // Red-50
      text: '#DC2626', // Red-600
      border: '#EF4444',
    },
    extreme: {
      main: '#991B1B', // Red-800
      background: '#FEE2E2', // Red-100
      text: '#FFFFFF',
      border: '#991B1B',
    },
  },
  
  // Weather condition colors
  weather: {
    sunny: {
      main: '#FCD34D', // Yellow-300
      background: '#FEFCE8', // Yellow-50
      text: '#92400E', // Yellow-800
    },
    cloudy: {
      main: '#9CA3AF', // Gray-400
      background: '#F9FAFB', // Gray-50
      text: '#374151', // Gray-700
    },
    rainy: {
      main: '#3B82F6', // Blue-500
      background: '#EFF6FF', // Blue-50
      text: '#1E40AF', // Blue-800
    },
    stormy: {
      main: '#6366F1', // Indigo-500
      background: '#EEF2FF', // Indigo-50
      text: '#3730A3', // Indigo-800
    },
  },
  
  // Status colors
  status: {
    online: {
      main: '#10B981',
      background: '#ECFDF5',
      text: '#047857',
    },
    offline: {
      main: '#EF4444',
      background: '#FEF2F2',
      text: '#DC2626',
    },
    pending: {
      main: '#F59E0B',
      background: '#FFFBEB',
      text: '#D97706',
    },
    maintenance: {
      main: '#8B5CF6',
      background: '#F5F3FF',
      text: '#6D28D9',
    },
  },
};

// Flood risk color utilities
export const getFloodRiskColor = (level: string | undefined | null) => {
  if (!level) return colorSystem.floodRisk.low.main;
  
  const colors = colorSystem.floodRisk;
  switch (level.toLowerCase()) {
    case 'low': return colors.low.main;
    case 'moderate': return colors.moderate.main;
    case 'high': return colors.high.main;
    case 'extreme': return colors.extreme.main;
    default: return colors.low.main;
  }
};

export const getFloodRiskColors = (level: string | undefined | null) => {
  if (!level) return colorSystem.floodRisk.low;
  
  const colors = colorSystem.floodRisk;
  switch (level.toLowerCase()) {
    case 'low': return colors.low;
    case 'moderate': return colors.moderate;
    case 'high': return colors.high;
    case 'extreme': return colors.extreme;
    default: return colors.low;
  }
};

// Weather condition color utilities
export const getWeatherColor = (condition: string | undefined | null) => {
  if (!condition) return colorSystem.weather.sunny;
  
  const conditionLower = condition.toLowerCase();
  if (conditionLower.includes('rain')) return colorSystem.weather.rainy;
  if (conditionLower.includes('storm')) return colorSystem.weather.stormy;
  if (conditionLower.includes('cloud')) return colorSystem.weather.cloudy;
  return colorSystem.weather.sunny;
};

// Status color utilities
export const getStatusColor = (status: keyof typeof colorSystem.status) => {
  return colorSystem.status[status] || colorSystem.status.offline;
};