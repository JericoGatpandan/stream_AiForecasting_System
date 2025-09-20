// Types for weather data
export type WeatherLayerType = 'temperature' | 'precipitation' | 'pressure' | 'wind_speed' | 'clouds' | 'humidity' | 'visibility' | 'uv_index';

// Weather layer data interface
export interface WeatherLayer {
    id: WeatherLayerType;
    name: string;
    icon: string; // Icon component name
    unit?: string;
    color?: string;
    isActive?: boolean;
}

// Sensor data interface
export interface SensorReading {
    water_level?: number;
    rainfall?: number;
    temperature?: number;
    humidity?: number;
    wind_speed?: number;
    wind_direction?: string;
    visibility?: number;
    uv_index?: number;
    scope?: number;
}

export interface Sensor {
    id: string;
    name: string;
    barangay: string;
    lat: number;
    lng: number;
    status: 'active' | 'inactive' | 'warning' | 'error';
    readings: SensorReading;
}

// Sample data for weather layers
export const weatherLayers: WeatherLayer[] = [
    {
        id: 'temperature',
        name: 'Temperature',
        icon: 'Thermostat',
        unit: '°C',
        color: '#FF7043',
    },
    {
        id: 'precipitation',
        name: 'Precipitation',
        icon: 'WaterDrop',
        unit: 'mm',
        color: '#29B6F6',
    },
    {
        id: 'pressure',
        name: 'Pressure',
        icon: 'Compress',
        unit: 'hPa',
        color: '#78909C',
    },
    {
        id: 'wind_speed',
        name: 'Wind speed',
        icon: 'Air',
        unit: 'km/h',
        color: '#8BC34A',
    },
    {
        id: 'clouds',
        name: 'Clouds',
        icon: 'Cloud',
        unit: '%',
        color: '#BDBDBD',
    },
    {
        id: 'humidity',
        name: 'Humidity',
        icon: 'WaterPercent',
        unit: '%',
        color: '#0D47A1',
    },
    {
        id: 'visibility',
        name: 'Visibility',
        icon: 'Visibility',
        unit: 'km',
        color: '#9575CD',
    },
    {
        id: 'uv_index',
        name: 'UV Index',
        icon: 'WbSunny',
        color: '#FFEB3B',
    }
];

// Sample sensor data (to be replaced with backend API later)
export const sampleSensors: Sensor[] = [
    {
        id: 'abella-01',
        name: 'Abella',
        barangay: 'Abella',
        lat: 13.623196284003441,
        lng: 123.18261692770339,
        status: 'active',
        readings: {
            water_level: 2.18,
            rainfall: 1.2,
            temperature: 28.5,
            humidity: 75,
            wind_speed: 12.3,
            wind_direction: 'NE',
            visibility: 15.2,
            uv_index: 6.8,
            scope: 800
        }
    },
    {
        id: 'bagumbayan-01',
        name: 'Bagumbayan Norte',
        barangay: 'Bagumbayan Norte',
        lat: 13.633196284003441,
        lng: 123.19361692770339,
        status: 'active',
        readings: {
            water_level: 1.75,
            rainfall: 0.8,
            temperature: 29.1,
            humidity: 72,
            wind_speed: 10.5,
            wind_direction: 'E',
            visibility: 18.7,
            uv_index: 7.2,
            scope: 850
        }
    },
    {
        id: 'sabang-01',
        name: 'Sabang',
        barangay: 'Sabang',
        lat: 13.6282,
        lng: 123.1886,
        status: 'warning',
        readings: {
            water_level: 3.25,
            rainfall: 2.7,
            temperature: 27.8,
            humidity: 85,
            wind_speed: 15.8,
            wind_direction: 'NE',
            visibility: 9.5,
            uv_index: 4.1,
            scope: 650
        }
    },
    {
        id: 'triangulo-01',
        name: 'Triangulo',
        barangay: 'Triangulo',
        lat: 13.6272,
        lng: 123.1956,
        status: 'inactive',
        readings: {
            water_level: 0,
            rainfall: 0,
            temperature: 0,
            humidity: 0,
            wind_speed: 0,
            wind_direction: '-',
            visibility: 0,
            uv_index: 0,
            scope: 0
        }
    }
];