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