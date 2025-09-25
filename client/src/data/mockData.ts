// Mock data for demonstration purposes
// This simulates the data that would come from your database

export const mockEnvironmentalData = {
  'Pacol': [
    {
      id: 1,
      barangay: 'Pacol',
      timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      rainfall_mm: 5.2,
      water_level_m: 2.1,
      flow_velocity_ms: 0.8,
      wind_speed_mps: 12.3,
      wind_direction: 'NE',
      temperature_c: 28.5,
      humidity_percent: 78
    },
    {
      id: 2,
      barangay: 'Pacol',
      timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      rainfall_mm: 3.8,
      water_level_m: 2.0,
      flow_velocity_ms: 0.7,
      wind_speed_mps: 11.8,
      wind_direction: 'NE',
      temperature_c: 29.1,
      humidity_percent: 75
    },
    // Add more historical data
    ...Array.from({ length: 22 }, (_, i) => ({
      id: i + 3,
      barangay: 'Pacol',
      timestamp: new Date(Date.now() - (i + 3) * 3600000).toISOString(),
      rainfall_mm: Math.random() * 10,
      water_level_m: 1.5 + Math.random() * 1.5,
      flow_velocity_ms: 0.5 + Math.random() * 0.8,
      wind_speed_mps: 8 + Math.random() * 10,
      wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      temperature_c: 25 + Math.random() * 8,
      humidity_percent: 65 + Math.random() * 25
    }))
  ],
  'Abella': [
    {
      id: 1,
      barangay: 'Abella',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      rainfall_mm: 7.1,
      water_level_m: 2.8,
      flow_velocity_ms: 1.2,
      wind_speed_mps: 15.2,
      wind_direction: 'NW',
      temperature_c: 27.8,
      humidity_percent: 82
    },
    // Add more data for Abella
    ...Array.from({ length: 23 }, (_, i) => ({
      id: i + 2,
      barangay: 'Abella',
      timestamp: new Date(Date.now() - (i + 2) * 3600000).toISOString(),
      rainfall_mm: Math.random() * 15,
      water_level_m: 2.0 + Math.random() * 2.0,
      flow_velocity_ms: 0.8 + Math.random() * 1.0,
      wind_speed_mps: 10 + Math.random() * 12,
      wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
      temperature_c: 24 + Math.random() * 9,
      humidity_percent: 70 + Math.random() * 20
    }))
  ]
};

export const mockFloodCharacteristics = [
  {
    id: 1,
    location: 'Pacol',
    latitude: 13.6218,
    longitude: 123.1948,
    maximum_depth: 1.8,
    maximum_depth_uncertainty: 0.2,
    peak_velocity: 2.1,
    peak_velocity_uncertainty: 0.3,
    arrival_time: 2.5,
    arrival_time_uncertainty: 0.5,
    inundation_area: 0.8,
    inundation_area_uncertainty: 0.1,
    flood_risk_level: 'moderate',
    model_version: 'v2.1',
    last_updated: new Date().toISOString(),
    is_active: true,
    expert_analysis: 'Moderate flood risk due to seasonal rainfall patterns.',
    recommended_actions: 'Monitor water levels closely, prepare evacuation routes.'
  },
  {
    id: 2,
    location: 'Abella',
    latitude: 13.6298,
    longitude: 123.2048,
    maximum_depth: 3.2,
    maximum_depth_uncertainty: 0.4,
    peak_velocity: 3.8,
    peak_velocity_uncertainty: 0.6,
    arrival_time: 1.8,
    arrival_time_uncertainty: 0.3,
    inundation_area: 1.5,
    inundation_area_uncertainty: 0.2,
    flood_risk_level: 'high',
    model_version: 'v2.1',
    last_updated: new Date().toISOString(),
    is_active: true,
    expert_analysis: 'High flood risk due to low-lying terrain and poor drainage.',
    recommended_actions: 'Immediate evacuation protocols should be prepared.'
  },
  // Add more locations
  {
    id: 3,
    location: 'Bagumbayan Norte',
    latitude: 13.6118,
    longitude: 123.1848,
    maximum_depth: 0.9,
    maximum_depth_uncertainty: 0.1,
    peak_velocity: 1.2,
    peak_velocity_uncertainty: 0.2,
    arrival_time: 4.2,
    arrival_time_uncertainty: 0.8,
    inundation_area: 0.3,
    inundation_area_uncertainty: 0.05,
    flood_risk_level: 'low',
    model_version: 'v2.1',
    last_updated: new Date().toISOString(),
    is_active: true,
    expert_analysis: 'Low flood risk due to elevated terrain and good drainage.',
    recommended_actions: 'Standard monitoring procedures are sufficient.'
  }
];

export const mockWeatherForecast = [
  {
    id: 1,
    location: 'Pacol',
    latitude: 13.6218,
    longitude: 123.1948,
    forecast_date: new Date().toISOString(),
    temperature_min: 24.5,
    temperature_max: 32.1,
    humidity: 78,
    precipitation_probability: 65,
    precipitation_amount: 8.2,
    wind_speed: 12.3,
    wind_direction: 'NE',
    visibility: 8.5,
    weather_condition: 'Partly Cloudy with Rain'
  },
  // Add 6 more days
  ...Array.from({ length: 6 }, (_, i) => ({
    id: i + 2,
    location: 'Pacol',
    latitude: 13.6218,
    longitude: 123.1948,
    forecast_date: new Date(Date.now() + (i + 1) * 86400000).toISOString(),
    temperature_min: 22 + Math.random() * 6,
    temperature_max: 28 + Math.random() * 8,
    humidity: 70 + Math.random() * 20,
    precipitation_probability: Math.random() * 80,
    precipitation_amount: Math.random() * 15,
    wind_speed: 8 + Math.random() * 12,
    wind_direction: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.floor(Math.random() * 8)],
    visibility: 5 + Math.random() * 10,
    weather_condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Rain', 'Thunderstorm'][Math.floor(Math.random() * 5)]
  }))
];

export const mockHourlyForecast = Array.from({ length: 24 }, (_, i) => ({
  id: i + 1,
  location: 'Pacol',
  forecast_time: new Date(Date.now() + i * 3600000).toISOString(),
  temperature: 25 + Math.random() * 8,
  precipitation_probability: Math.random() * 60,
  weather_condition: ['Sunny', 'Partly Cloudy', 'Cloudy', 'Light Rain'][Math.floor(Math.random() * 4)]
}));

export const mockBarangays = [
  'Abella', 'Bagumbayan Norte', 'Bagumbayan Sur', 'Balatas', 'Calauag',
  'Cararayan', 'Carolina', 'Concepcion Grande', 'Concepcion Pequeño',
  'Dayangdang', 'Del Rosario', 'Dinaga', 'Igualdad Interior', 'Lerma',
  'Liboton', 'Mabolo', 'Pacol', 'Panicuason', 'Peñafrancia', 'Sabang',
  'San Felipe', 'San Francisco (Pob.)', 'San Isidro', 'Santa Cruz',
  'Tabuco', 'Tinago', 'Triangulo'
];