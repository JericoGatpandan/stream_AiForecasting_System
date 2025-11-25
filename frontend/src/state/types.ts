export interface WeatherForecast {
    id: string;
    location: string;
    date: string;
    temperature: {
        min: number;
        max: number;
        current: number;
    };
    humidity: number;
    windSpeed: number;
    windDirection: string;
    precipitation: number;
    condition: string;
    icon: string;
}

export interface HourlyForecast {
    hour: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation: number;
    condition: string;
    icon: string;
}

export interface WeatherSummary {
    location: string;
    currentWeather: WeatherForecast;
    todaySummary: string;
    weekSummary: string;
    recommendations: string[];
}

export interface WeatherAnalysis {
    location: string;
    analysis: string;
    riskLevel: 'low' | 'medium' | 'high';
    recommendations: string[];
    expertNotes: string;
}

export interface WeatherAlert {
    id: string;
    type: 'warning' | 'watch' | 'advisory';
    severity: 'low' | 'medium' | 'high' | 'extreme';
    title: string;
    description: string;
    location?: string;
    startTime: string;
    endTime: string;
    isActive: boolean;
}

export interface UserLocation {
    id: string;
    name: string;
    coordinates: {
        lat: number;
        lng: number;
    };
    isDefault: boolean;
    createdAt: string;
}

export interface WeatherTrigger {
    id: string;
    name: string;
    location: string;
    conditions: {
        temperature?: { min?: number; max?: number };
        humidity?: { min?: number; max?: number };
        windSpeed?: { min?: number; max?: number };
        precipitation?: { min?: number; max?: number };
    };
    isActive: boolean;
    createdAt: string;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'alert' | 'forecast' | 'trigger' | 'system';
    isRead: boolean;
    createdAt: string;
    location?: string;
}

export interface EnvironmentalData {
    barangay: string;
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    precipitation: number;
    airQuality: number;
    uvIndex: number;
    visibility: number;
    pressure: number;
    timestamp: string;
}

export interface FloodCharacteristics {
    id: string;
    location: string;
    latitude: number;
    longitude: number;
    maximumDepth: number;
    maximumDepthUncertainty: number;
    peakVelocity: number;
    peakVelocityUncertainty: number;
    arrivalTime: number;
    arrivalTimeUncertainty: number;
    inundationArea: number;
    inundationAreaUncertainty: number;
    floodRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
    modelVersion: string;
    lastUpdated: string;
    isActive: boolean;
    expertAnalysis?: string;
    recommendedActions?: string;
    createdAt: string;
    updatedAt: string;
}

export interface FloodRiskAssessment {
    location: string;
    currentRiskLevel: 'low' | 'moderate' | 'high' | 'extreme';
    riskFactors: {
        rainfall: number;
        waterLevel: number;
        soilSaturation: number;
        drainageCapacity: number;
    };
    predictions: {
        nextHour: 'low' | 'moderate' | 'high' | 'extreme';
        next6Hours: 'low' | 'moderate' | 'high' | 'extreme';
        next24Hours: 'low' | 'moderate' | 'high' | 'extreme';
    };
    recommendations: string[];
    lastAssessment: string;
}

export interface FloodAlert extends WeatherAlert {
    floodData: {
        expectedDepth: number;
        expectedVelocity: number;
        affectedArea: number;
        estimatedArrival: string;
    };
}

// Sensor-related interfaces
export interface Sensor {
    id: string;
    name: string;
    barangay_id: string;
    sensor_type: 'water_level' | 'rainfall' | 'weather_station' | 'flow_meter' | 'multi_parameter';
    latitude: number;
    longitude: number;
    altitude?: number;
    status: 'active' | 'inactive' | 'maintenance' | 'error';
    installation_date?: string;
    last_maintenance?: string;
    calibration_date?: string;
    battery_level?: number;
    transmission_interval: number;
    watershed_zone?: string;
    river_section?: string;
    barangay?: Barangay;
    readings?: SensorReading[];
    createdAt: string;
    updatedAt: string;
}

export interface SensorReading {
    id: number;
    sensor_id: string;
    timestamp: string;
    // Water monitoring parameters
    water_level?: number;
    flow_velocity?: number;
    flow_rate?: number;
    water_temperature?: number;
    turbidity?: number;
    ph_level?: number;
    dissolved_oxygen?: number;
    // Weather parameters
    rainfall?: number;
    air_temperature?: number;
    humidity?: number;
    wind_speed?: number;
    wind_direction?: string;
    atmospheric_pressure?: number;
    visibility?: number;
    uv_index?: number;
    // System parameters
    battery_voltage?: number;
    signal_strength?: number;
    data_quality: 'excellent' | 'good' | 'fair' | 'poor';
    is_validated: boolean;
    validation_notes?: string;
    sensor?: Sensor;
}

export interface Barangay {
    id: string;
    name: string;
    center_lat: number;
    center_lng: number;
    flood_risk_level: 'low' | 'moderate' | 'high' | 'extreme';
    watershed_zone?: string;
    area_km2?: number;
    population?: number;
    sensors?: Sensor[];
    createdAt: string;
    updatedAt: string;
}

export interface SensorStatistics {
    sensor_id: string;
    period: string;
    time_range: {
        start: string;
        end: string;
    };
    statistics: {
        [parameter: string]: {
            count: number;
            min: number | null;
            max: number | null;
            avg: number | null;
            latest: number | null;
        };
    };
    total_readings: number;
}

export interface LatestReadingsResponse {
    timestamp: string;
    sensors: {
        sensor_id: string;
        sensor_name: string;
        sensor_type: string;
        barangay: Barangay;
        location: {
            latitude: number;
            longitude: number;
        };
        watershed_zone?: string;
        river_section?: string;
        battery_level?: number;
        status: string;
        latest_reading: SensorReading | null;
    }[];
    total_sensors: number;
}

export interface SensorReadingsResponse {
    sensor_id: string;
    readings: SensorReading[];
    total: number;
    pagination: {
        limit: number;
        offset: number;
        has_more: boolean;
    };
    aggregation: string;
    parameters: string[] | string;
}

export interface SensorsResponse {
    sensors: Sensor[];
    total: number;
    pagination: {
        limit: number;
        offset: number;
        has_more: boolean;
    };
}
