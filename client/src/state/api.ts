import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
    WeatherForecast,
    HourlyForecast,
    WeatherSummary,
    WeatherAnalysis,
    WeatherAlert,
    UserLocation,
    WeatherTrigger,
    Notification,
    EnvironmentalData,
    FloodCharacteristics,
    FloodRiskAssessment,
    FloodAlert,
    Sensor,
    SensorStatistics,
    SensorsResponse,
    SensorReadingsResponse,
    LatestReadingsResponse,
    Barangay
} from './types';
import { 
    mockEnvironmentalData, 
    mockFloodCharacteristics, 
    mockWeatherForecast, 
    mockHourlyForecast, 
    mockBarangays 
} from '../data/mockData';

// Backend response shapes (minimal, optional fields) to avoid explicit any
type BackendDailyForecast = {
    id?: string | number;
    location?: string;
    forecast_date?: string;
    date?: string;
    temperature_min?: number | string;
    temperature_max?: number | string;
    temp_min?: number | string;
    temp_max?: number | string;
    temperature_current?: number | string;
    humidity?: number | string;
    humidity_percent?: number | string;
    wind_speed?: number | string;
    wind_speed_mps?: number | string;
    wind_direction?: string;
    precipitation?: number | string;
    precipitation_probability?: number | string;
    precip_probability?: number | string;
    weather_condition?: string;
    condition?: string;
};

type BackendHourlyForecast = {
    hour?: string;
    temperature?: number | string;
    temp?: number | string;
    humidity?: number | string;
    windSpeed?: number | string;
    wind_speed?: number | string;
    precipitation?: number | string;
    rain?: number | string;
    condition?: string;
} & BackendDailyForecast;

type BackendEnvironmentalRow = {
    barangay?: string;
    location?: string;
    temperature_c?: number | string;
    temperature?: number | string;
    humidity_percent?: number | string;
    humidity?: number | string;
    wind_speed_mps?: number | string;
    windSpeed?: number | string;
    wind_direction?: string;
    windDirection?: string;
    rainfall_mm?: number | string;
    precipitation?: number | string;
    air_quality?: number | string;
    uv_index?: number | string;
    uvIndex?: number | string;
    flow_velocity_ms?: number | string;
    visibility?: number | string;
    water_level_m?: number | string;
    atmospheric_pressure?: number | string;
    timestamp?: string;
};

type BackendFloodCharacteristicsRow = {
    id?: string | number;
    location?: string;
    latitude?: number | string;
    longitude?: number | string;
    maximum_depth?: number | string;
    maximumDepth?: number | string;
    maximum_depth_uncertainty?: number | string;
    maximumDepthUncertainty?: number | string;
    peak_velocity?: number | string;
    peakVelocity?: number | string;
    peak_velocity_uncertainty?: number | string;
    peakVelocityUncertainty?: number | string;
    arrival_time?: number | string;
    arrivalTime?: number | string;
    arrival_time_uncertainty?: number | string;
    arrivalTimeUncertainty?: number | string;
    inundation_area?: number | string;
    inundationArea?: number | string;
    inundation_area_uncertainty?: number | string;
    inundationAreaUncertainty?: number | string;
    flood_risk_level?: string;
    floodRiskLevel?: string;
    model_version?: string;
    modelVersion?: string;
    last_updated?: string;
    lastUpdated?: string;
    is_active?: boolean;
    isActive?: boolean;
    expert_analysis?: string;
    expertAnalysis?: string;
    recommended_actions?: string;
    recommendedActions?: string;
    createdAt?: string;
    updatedAt?: string;
};

type BackendFloodRisk = {
    location?: string;
    currentRiskLevel?: 'low' | 'moderate' | 'high' | 'extreme';
    current_risk_level?: 'low' | 'moderate' | 'high' | 'extreme';
    riskFactors?: { rainfall?: number; waterLevel?: number; soilSaturation?: number; drainageCapacity?: number };
    risk_factors?: { rainfall?: number; waterLevel?: number; soilSaturation?: number; drainageCapacity?: number };
    predictions?: { nextHour?: string; next6Hours?: string; next24Hours?: string };
    lastAssessment?: string;
    last_assessment?: string;
};

// Mock data fallback
const useMockData = false; // Set to false to use backend API

const mockBaseQuery = async (args: string | { url: string }) => {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const url = typeof args === 'string' ? args : args.url;
        
    // Handle different endpoints
    if (url === 'barangays') {
        return { data: mockBarangays };
    }
    
    if (url.startsWith('environmental/')) {
        const barangay = url.split('/')[1];
        return { data: mockEnvironmentalData[barangay as keyof typeof mockEnvironmentalData] || [] };
    }
    
    if (url === 'flood/characteristics') {
        return { data: mockFloodCharacteristics };
    }
    
    if (url.startsWith('flood/location/')) {
        const location = decodeURIComponent(url.split('/')[2]);
        const data = mockFloodCharacteristics.find(item => item.location === location);
        return { data: data || null };
    }
    
    if (url.startsWith('weather/forecast/hourly/')) {
        return { data: mockHourlyForecast };
    }
    
    if (url.startsWith('weather/forecast/')) {
        return { data: mockWeatherForecast };
    }
    
    // Default empty response
    return { data: [] };
};

export const api = createApi({
    baseQuery: useMockData ? mockBaseQuery : fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
    reducerPath: 'main',
    tagTypes: ['WeatherAlert', 'UserLocation', 'WeatherTrigger', 'Notification', 'EnvironmentalData', 'FloodCharacteristics', 'FloodRiskAssessment', 'Sensor', 'SensorReading', 'Barangay'],
    endpoints: (build) => ({
        // Weather Data Endpoints
        getWeatherForecast: build.query<WeatherForecast[], string>({
            query: (location) => `weather/forecast/${location}`,
            // Normalize backend fields to frontend WeatherForecast shape
            transformResponse: (response: BackendDailyForecast[] | unknown): WeatherForecast[] => {
                if (!Array.isArray(response)) return [];
                return (response as BackendDailyForecast[]).map((r) => ({
                    id: String(r.id ?? `${r.location}-${r.forecast_date}`),
                    location: r.location ?? '',
                    date: r.forecast_date ?? r.date ?? new Date().toISOString(),
                    temperature: {
                        min: Number(r.temperature_min ?? r.temp_min ?? 0),
                        max: Number(r.temperature_max ?? r.temp_max ?? 0),
                        current: r.temperature_current !== undefined
                            ? Number(r.temperature_current)
                            : (Number(r.temperature_min ?? r.temp_min ?? 0) + Number(r.temperature_max ?? r.temp_max ?? 0)) / 2
                    },
                    humidity: Number(r.humidity ?? r.humidity_percent ?? 0),
                    windSpeed: Number(r.wind_speed ?? r.wind_speed_mps ?? 0),
                    windDirection: r.wind_direction ?? 'N',
                    precipitation: Number(
                        r.precipitation ?? r.precipitation_probability ?? r.precip_probability ?? 0
                    ),
                    condition: r.weather_condition ?? r.condition ?? 'Unknown',
                    icon: 'cloud'
                }));
            }
        }),

        getHourlyForecast: build.query<HourlyForecast[], string>({
            query: (location) => `weather/forecast/hourly/${location}`,
            // Create a reasonable hourly series if backend returns daily-like rows
            transformResponse: (response: BackendHourlyForecast[] | BackendDailyForecast[] | unknown): HourlyForecast[] => {
                // If already hourly-like
                if (Array.isArray(response) && (response as BackendHourlyForecast[]).length && (response as BackendHourlyForecast[])[0]?.hour) {
                    return (response as BackendHourlyForecast[]).map((h) => ({
                        hour: h.hour ?? new Date().toISOString(),
                        temperature: Number(h.temperature ?? h.temp ?? 0),
                        humidity: Number(h.humidity ?? 0),
                        windSpeed: Number(h.windSpeed ?? h.wind_speed ?? 0),
                        precipitation: Number(h.precipitation ?? h.rain ?? 0),
                        condition: h.condition ?? 'Unknown',
                        icon: 'cloud'
                    }));
                }
                // Fallback: synthesize 24 hours from first item
                const base = Array.isArray(response) && response.length ? (response[0] as BackendDailyForecast) : {};
                const now = new Date();
                return Array.from({ length: 24 }).map((_, i) => {
                    const d = new Date(now);
                    d.setHours(now.getHours() + i);
                    return {
                        hour: d.toISOString(),
                        temperature: Number(((base.temperature_min ?? 24) as number) + ((base.temperature_max ?? 32) as number)) / 2 + Math.sin(i / 3) * 1.5,
                        humidity: Number(base.humidity ?? base.humidity_percent ?? 70),
                        windSpeed: Number(base.wind_speed ?? base.wind_speed_mps ?? 5),
                        precipitation: Number((base as unknown as { precipitation_amount?: number }).precipitation_amount ?? base.precipitation_probability ?? 0) * (i % 5 === 0 ? 0.1 : 0.02),
                        condition: base.weather_condition ?? 'Cloudy',
                        icon: 'cloud'
                    } as HourlyForecast;
                });
            }
        }),

        getWeatherSummary: build.query<WeatherSummary, string>({
            query: (location) => `weather/summary/${location}`,
        }),

        getWeatherAnalysis: build.query<WeatherAnalysis, string>({
            query: (location) => `weather/analysis/${location}`,
        }),

        // Weather Alerts Endpoints
        getAllWeatherAlerts: build.query<WeatherAlert[], void>({
            query: () => 'weather/alerts',
            providesTags: ['WeatherAlert'],
        }),

        getLocationWeatherAlerts: build.query<WeatherAlert[], string>({
            query: (location) => `weather/alerts/${location}`,
            providesTags: ['WeatherAlert'],
        }),

        // Flood-specific alerts
        getFloodAlerts: build.query<FloodAlert[], void>({
            query: () => 'flood/alerts',
            providesTags: ['WeatherAlert'],
        }),

        getLocationFloodAlerts: build.query<FloodAlert[], string>({
            query: (location) => `flood/alerts/${location}`,
            providesTags: ['WeatherAlert'],
        }),

        // User Locations Endpoints
        getUserLocations: build.query<UserLocation[], void>({
            query: () => 'weather/locations',
            providesTags: ['UserLocation'],
        }),

        addUserLocation: build.mutation<UserLocation, Omit<UserLocation, 'id' | 'createdAt'>>({
            query: (location) => ({
                url: 'weather/locations',
                method: 'POST',
                body: location,
            }),
            invalidatesTags: ['UserLocation'],
        }),

        updateUserLocation: build.mutation<UserLocation, { id: string; data: Partial<UserLocation> }>({
            query: ({ id, data }) => ({
                url: `weather/locations/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['UserLocation'],
        }),

        deleteUserLocation: build.mutation<void, string>({
            query: (id) => ({
                url: `weather/locations/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['UserLocation'],
        }),

        // Weather Triggers Endpoints
        getWeatherTriggers: build.query<WeatherTrigger[], void>({
            query: () => 'weather/triggers',
            providesTags: ['WeatherTrigger'],
        }),

        createWeatherTrigger: build.mutation<WeatherTrigger, Omit<WeatherTrigger, 'id' | 'createdAt'>>({
            query: (trigger) => ({
                url: 'weather/triggers',
                method: 'POST',
                body: trigger,
            }),
            invalidatesTags: ['WeatherTrigger'],
        }),

        updateWeatherTrigger: build.mutation<WeatherTrigger, { id: string; data: Partial<WeatherTrigger> }>({
            query: ({ id, data }) => ({
                url: `weather/triggers/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['WeatherTrigger'],
        }),

        deleteWeatherTrigger: build.mutation<void, string>({
            query: (id) => ({
                url: `weather/triggers/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['WeatherTrigger'],
        }),

        // Notifications Endpoints
        getNotifications: build.query<Notification[], void>({
            query: () => 'weather/notifications',
            providesTags: ['Notification'],
        }),

        markNotificationAsRead: build.mutation<Notification, string>({
            query: (id) => ({
                url: `weather/notifications/${id}/read`,
                method: 'PUT',
            }),
            invalidatesTags: ['Notification'],
        }),

        // Environmental Data Endpoints
        getEnvironmentalData: build.query<EnvironmentalData[], string>({
            query: (barangay) => `environmental/${barangay}`,
            providesTags: ['EnvironmentalData'],
            // Map backend sensor fields to frontend EnvironmentalData
            transformResponse: (response: BackendEnvironmentalRow[] | unknown): EnvironmentalData[] => {
                if (!Array.isArray(response)) return [];
                return (response as BackendEnvironmentalRow[]).map((r) => ({
                    barangay: r.barangay ?? r.location ?? '',
                    temperature: Number(r.temperature_c ?? r.temperature ?? 0),
                    humidity: Number(r.humidity_percent ?? r.humidity ?? 0),
                    windSpeed: Number(r.wind_speed_mps ?? r.windSpeed ?? 0),
                    windDirection: r.wind_direction ?? r.windDirection ?? 'N',
                    precipitation: Number(r.rainfall_mm ?? r.precipitation ?? 0),
                    airQuality: Number(r.air_quality ?? 0),
                    uvIndex: Number(r.uv_index ?? r.uvIndex ?? 0),
                    // For backward compatibility with charts expecting these names:
                    visibility: Number(r.flow_velocity_ms ?? r.visibility ?? 0),
                    // Map water level (m) into 'pressure' field which charts use as water level
                    pressure: Number(r.water_level_m ?? r.atmospheric_pressure ?? 0),
                    timestamp: r.timestamp ?? new Date().toISOString(),
                }));
            }
        }),

        // Get all barangays list (returns array of strings)
        getBarangays: build.query<string[], void>({
            query: () => 'barangays',
        }),

        // Get specific barangay environmental data
        getBarangayData: build.query<EnvironmentalData[], string>({
            query: (barangayName) => `barangays/${barangayName}`,
            providesTags: (_result, _error, barangayName) => [{ type: 'EnvironmentalData', id: barangayName }],
        }),

        // Flood Characteristics Endpoints
        getAllFloodCharacteristics: build.query<FloodCharacteristics[], void>({
            query: () => 'flood/',
            providesTags: ['FloodCharacteristics'],
            transformResponse: (response: BackendFloodCharacteristicsRow[] | unknown): FloodCharacteristics[] => {
                if (!Array.isArray(response)) return [];
                return (response as BackendFloodCharacteristicsRow[]).map((r) => ({
                    id: String(r.id ?? ''),
                    location: r.location ?? '',
                    latitude: Number(r.latitude ?? 0),
                    longitude: Number(r.longitude ?? 0),
                    maximumDepth: Number(r.maximum_depth ?? r.maximumDepth ?? 0),
                    maximumDepthUncertainty: Number(r.maximum_depth_uncertainty ?? r.maximumDepthUncertainty ?? 0),
                    peakVelocity: Number(r.peak_velocity ?? r.peakVelocity ?? 0),
                    peakVelocityUncertainty: Number(r.peak_velocity_uncertainty ?? r.peakVelocityUncertainty ?? 0),
                    arrivalTime: Number(r.arrival_time ?? r.arrivalTime ?? 0),
                    arrivalTimeUncertainty: Number(r.arrival_time_uncertainty ?? r.arrivalTimeUncertainty ?? 0),
                    inundationArea: Number(r.inundation_area ?? r.inundationArea ?? 0),
                    inundationAreaUncertainty: Number(r.inundation_area_uncertainty ?? r.inundationAreaUncertainty ?? 0),
                    floodRiskLevel: (r.flood_risk_level ?? r.floodRiskLevel ?? 'low') as FloodCharacteristics['floodRiskLevel'],
                    modelVersion: r.model_version ?? r.modelVersion ?? '1.0.0',
                    lastUpdated: (r.last_updated ?? r.lastUpdated ?? new Date().toISOString()),
                    isActive: Boolean(r.is_active ?? r.isActive ?? true),
                    expertAnalysis: r.expert_analysis ?? r.expertAnalysis,
                    recommendedActions: r.recommended_actions ?? r.recommendedActions,
                    createdAt: r.createdAt ?? new Date().toISOString(),
                    updatedAt: r.updatedAt ?? new Date().toISOString(),
                }));
            }
        }),

        getFloodCharacteristicsByLocation: build.query<FloodCharacteristics, string>({
            query: (location) => `flood/location/${location}`,
            providesTags: ['FloodCharacteristics'],
            transformResponse: (r: BackendFloodCharacteristicsRow): FloodCharacteristics => ({
                id: String(r.id ?? ''),
                location: r.location ?? '',
                latitude: Number(r.latitude ?? 0),
                longitude: Number(r.longitude ?? 0),
                maximumDepth: Number(r.maximum_depth ?? r.maximumDepth ?? 0),
                maximumDepthUncertainty: Number(r.maximum_depth_uncertainty ?? r.maximumDepthUncertainty ?? 0),
                peakVelocity: Number(r.peak_velocity ?? r.peakVelocity ?? 0),
                peakVelocityUncertainty: Number(r.peak_velocity_uncertainty ?? r.peakVelocityUncertainty ?? 0),
                arrivalTime: Number(r.arrival_time ?? r.arrivalTime ?? 0),
                arrivalTimeUncertainty: Number(r.arrival_time_uncertainty ?? r.arrivalTimeUncertainty ?? 0),
                inundationArea: Number(r.inundation_area ?? r.inundationArea ?? 0),
                inundationAreaUncertainty: Number(r.inundation_area_uncertainty ?? r.inundationAreaUncertainty ?? 0),
                floodRiskLevel: (r.flood_risk_level ?? r.floodRiskLevel ?? 'low') as FloodCharacteristics['floodRiskLevel'],
                modelVersion: r.model_version ?? r.modelVersion ?? '1.0.0',
                lastUpdated: (r.last_updated ?? r.lastUpdated ?? new Date().toISOString()),
                isActive: Boolean(r.is_active ?? r.isActive ?? true),
                expertAnalysis: r.expert_analysis ?? r.expertAnalysis,
                recommendedActions: r.recommended_actions ?? r.recommendedActions,
                createdAt: r.createdAt ?? new Date().toISOString(),
                updatedAt: r.updatedAt ?? new Date().toISOString(),
            })
        }),

        getFloodCharacteristicsById: build.query<FloodCharacteristics, string>({
            query: (id) => `flood/characteristics/id/${id}`,
            providesTags: ['FloodCharacteristics'],
        }),

        createFloodCharacteristics: build.mutation<FloodCharacteristics, Omit<FloodCharacteristics, 'id' | 'createdAt' | 'updatedAt'>>({
            query: (data) => ({
                url: 'flood/characteristics',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['FloodCharacteristics'],
        }),

        updateFloodCharacteristics: build.mutation<FloodCharacteristics, { id: string; data: Partial<FloodCharacteristics> }>({
            query: ({ id, data }) => ({
                url: `flood/characteristics/${id}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: ['FloodCharacteristics'],
        }),

        deleteFloodCharacteristics: build.mutation<void, string>({
            query: (id) => ({
                url: `flood/characteristics/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['FloodCharacteristics'],
        }),

        // Flood Risk Assessment Endpoints
        getCurrentFloodRisk: build.query<FloodRiskAssessment, string>({
            query: (location) => `flood/risk/${location}`,
            providesTags: ['FloodRiskAssessment'],
            transformResponse: (resp: BackendFloodRisk | BackendFloodRisk[] | unknown, _meta, location): FloodRiskAssessment => {
                const toAssessment = (r: BackendFloodRisk): FloodRiskAssessment => ({
                    location: r.location ?? location,
                    currentRiskLevel: (r.currentRiskLevel ?? r.current_risk_level ?? 'low') as FloodRiskAssessment['currentRiskLevel'],
                    riskFactors: {
                        rainfall: Number(r.riskFactors?.rainfall ?? r.risk_factors?.rainfall ?? 0),
                        waterLevel: Number(r.riskFactors?.waterLevel ?? r.risk_factors?.waterLevel ?? 0),
                        soilSaturation: Number(r.riskFactors?.soilSaturation ?? r.risk_factors?.soilSaturation ?? 0),
                        drainageCapacity: Number(r.riskFactors?.drainageCapacity ?? r.risk_factors?.drainageCapacity ?? 0),
                    },
                    predictions: {
                        nextHour: (r.predictions?.nextHour ?? 'low') as FloodRiskAssessment['predictions']['nextHour'],
                        next6Hours: (r.predictions?.next6Hours ?? 'low') as FloodRiskAssessment['predictions']['next6Hours'],
                        next24Hours: (r.predictions?.next24Hours ?? 'low') as FloodRiskAssessment['predictions']['next24Hours'],
                    },
                    recommendations: [],
                    lastAssessment: r.lastAssessment ?? r.last_assessment ?? new Date().toISOString(),
                });
                if (Array.isArray(resp)) {
                    return resp.length ? toAssessment(resp[0] as BackendFloodRisk) : toAssessment({ location });
                }
                if (resp && typeof resp === 'object') {
                    return toAssessment(resp as BackendFloodRisk);
                }
                return toAssessment({ location });
            }
        }),

        getAllFloodRisks: build.query<FloodRiskAssessment[], void>({
            query: () => 'flood/risk',
            providesTags: ['FloodRiskAssessment'],
            transformResponse: (resp: BackendFloodRisk[] | unknown): FloodRiskAssessment[] => {
                if (!Array.isArray(resp)) return [];
                return (resp as BackendFloodRisk[]).map((r) => ({
                    location: r.location ?? 'Unknown',
                    currentRiskLevel: (r.currentRiskLevel ?? r.current_risk_level ?? 'low') as FloodRiskAssessment['currentRiskLevel'],
                    riskFactors: {
                        rainfall: Number(r.riskFactors?.rainfall ?? r.risk_factors?.rainfall ?? 0),
                        waterLevel: Number(r.riskFactors?.waterLevel ?? r.risk_factors?.waterLevel ?? 0),
                        soilSaturation: Number(r.riskFactors?.soilSaturation ?? r.risk_factors?.soilSaturation ?? 0),
                        drainageCapacity: Number(r.riskFactors?.drainageCapacity ?? r.risk_factors?.drainageCapacity ?? 0),
                    },
                    predictions: {
                        nextHour: (r.predictions?.nextHour ?? 'low') as FloodRiskAssessment['predictions']['nextHour'],
                        next6Hours: (r.predictions?.next6Hours ?? 'low') as FloodRiskAssessment['predictions']['next6Hours'],
                        next24Hours: (r.predictions?.next24Hours ?? 'low') as FloodRiskAssessment['predictions']['next24Hours'],
                    },
                    recommendations: [],
                    lastAssessment: r.lastAssessment ?? r.last_assessment ?? new Date().toISOString(),
                }));
            }
        }),

        // Flood Data by Risk Level
        getFloodCharacteristicsByRisk: build.query<FloodCharacteristics[], 'low' | 'moderate' | 'high' | 'extreme'>({
            query: (riskLevel) => `flood/characteristics/risk/${riskLevel}`,
            providesTags: ['FloodCharacteristics'],
        }),

        // Active Flood Monitoring
        getActiveFloodMonitoring: build.query<FloodCharacteristics[], void>({
            query: () => 'flood/characteristics/active',
            providesTags: ['FloodCharacteristics'],
        }),

        // Sensor Endpoints
        getAllSensors: build.query<SensorsResponse, {
            status?: string;
            sensor_type?: string;
            barangay_id?: string;
            watershed_zone?: string;
            include_readings?: boolean;
            limit?: number;
            offset?: number;
        }>({
            query: (params = {}) => {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
                return `sensors?${queryParams.toString()}`;
            },
            providesTags: ['Sensor'],
        }),

        getSensorById: build.query<Sensor, { sensorId: string; include_readings_hours?: number }>({
            query: ({ sensorId, include_readings_hours }) => {
                const params = include_readings_hours ? `?include_readings_hours=${include_readings_hours}` : '';
                return `sensors/${sensorId}${params}`;
            },
            providesTags: (_result, _error, { sensorId }) => [{ type: 'Sensor', id: sensorId }],
        }),

        getSensorReadings: build.query<SensorReadingsResponse, {
            sensorId: string;
            start_time?: string;
            end_time?: string;
            limit?: number;
            offset?: number;
            aggregation?: string;
            parameters?: string;
        }>({
            query: ({ sensorId, ...params }) => {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
                return `sensors/${sensorId}/readings?${queryParams.toString()}`;
            },
            providesTags: (_result, _error, { sensorId }) => [{ type: 'SensorReading', id: sensorId }],
        }),

        getLatestSensorReadings: build.query<LatestReadingsResponse, {
            watershed_zone?: string;
            barangay_id?: string;
            sensor_type?: string;
        }>({
            query: (params = {}) => {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
                return `sensors/readings/latest?${queryParams.toString()}`;
            },
            providesTags: ['SensorReading'],
        }),

        getSensorStatistics: build.query<SensorStatistics, {
            sensorId: string;
            period?: string;
            parameters?: string;
        }>({
            query: ({ sensorId, period, parameters }) => {
                const queryParams = new URLSearchParams();
                if (period) queryParams.append('period', period);
                if (parameters) queryParams.append('parameters', parameters);
                return `sensors/${sensorId}/statistics?${queryParams.toString()}`;
            },
            providesTags: (_result, _error, { sensorId }) => [{ type: 'Sensor', id: `${sensorId}-stats` }],
        }),

        updateSensor: build.mutation<{ message: string; sensor: Sensor }, {
            sensorId: string;
            updates: Partial<Sensor>;
        }>({
            query: ({ sensorId, updates }) => ({
                url: `sensors/${sensorId}`,
                method: 'PUT',
                body: updates,
            }),
            invalidatesTags: (_result, _error, { sensorId }) => [
                { type: 'Sensor', id: sensorId },
                'Sensor',
                'SensorReading'
            ],
        }),

        // Updated Barangays endpoint to return proper Barangay objects
        getAllBarangays: build.query<Barangay[], void>({
            query: () => 'barangays',
            providesTags: ['Barangay'],
        }),

        // Flood Predictions Endpoints
        getAllPredictions: build.query<{
            predictions: Record<string, unknown>[];
            total: number;
            summary: Record<string, unknown>;
            pagination: Record<string, unknown>;
        }, {
            barangay_id?: string;
            risk_level?: string;
            limit?: number;
            offset?: number;
        }>({
            query: (params = {}) => {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
                return `predictions?${queryParams.toString()}`;
            },
            providesTags: ['FloodCharacteristics'],
        }),

        getCurrentPredictions: build.query<{
            timestamp: string;
            current_predictions: Record<string, unknown>[];
            total_barangays: number;
            risk_summary: Record<string, unknown>;
            highest_risk: string;
        }, { risk_threshold?: string }>({
            query: (params = {}) => {
                const queryParams = new URLSearchParams();
                if (params.risk_threshold) {
                    queryParams.append('risk_threshold', params.risk_threshold);
                }
                return `predictions/current?${queryParams.toString()}`;
            },
            providesTags: ['FloodCharacteristics'],
        }),

        getPredictionsByBarangay: build.query<{
            barangay: Record<string, unknown>;
            current_prediction: Record<string, unknown> | null;
            prediction_history: Record<string, unknown>[];
            environmental_data: Record<string, unknown>;
            metadata: Record<string, unknown>;
        }, {
            barangayId: string;
            include_history?: boolean;
            history_days?: number;
            include_environmental_data?: boolean;
        }>({
            query: ({ barangayId, ...params }) => {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
                return `predictions/barangay/${barangayId}?${queryParams.toString()}`;
            },
            providesTags: (_result, _error, { barangayId }) => [{ type: 'FloodCharacteristics', id: barangayId }],
        }),

        generatePrediction: build.mutation<unknown, {
            barangay_id: string;
            forecast_hours?: number;
            model_version?: string;
            force_refresh?: boolean;
        }>({
            query: (body) => ({
                url: 'predictions/generate',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['FloodCharacteristics'],
        }),

        getPredictionAccuracy: build.query<Record<string, unknown>, {
            model_version?: string;
            evaluation_period_days?: number;
            barangay_id?: string;
        }>({
            query: (params = {}) => {
                const queryParams = new URLSearchParams();
                Object.entries(params).forEach(([key, value]) => {
                    if (value !== undefined) {
                        queryParams.append(key, value.toString());
                    }
                });
                return `predictions/accuracy?${queryParams.toString()}`;
            },
            providesTags: ['FloodCharacteristics'],
        }),
    })
})

// Export hooks for usage in functional components
export const {
    // Weather Data Hooks
    useGetWeatherForecastQuery,
    useGetHourlyForecastQuery,
    useGetWeatherSummaryQuery,
    useGetWeatherAnalysisQuery,

    // Weather Alerts Hooks
    useGetAllWeatherAlertsQuery,
    useGetLocationWeatherAlertsQuery,

    // Flood Alerts Hooks
    useGetFloodAlertsQuery,
    useGetLocationFloodAlertsQuery,

    // User Locations Hooks
    useGetUserLocationsQuery,
    useAddUserLocationMutation,
    useUpdateUserLocationMutation,
    useDeleteUserLocationMutation,

    // Weather Triggers Hooks
    useGetWeatherTriggersQuery,
    useCreateWeatherTriggerMutation,
    useUpdateWeatherTriggerMutation,
    useDeleteWeatherTriggerMutation,

    // Notifications Hooks
    useGetNotificationsQuery,
    useMarkNotificationAsReadMutation,

    // Environmental Data Hooks
    useGetEnvironmentalDataQuery,
    useGetBarangayDataQuery,

    // Flood Characteristics Hooks
    useGetAllFloodCharacteristicsQuery,
    useGetFloodCharacteristicsByLocationQuery,
    useGetFloodCharacteristicsByIdQuery,
    useCreateFloodCharacteristicsMutation,
    useUpdateFloodCharacteristicsMutation,
    useDeleteFloodCharacteristicsMutation,

    // Flood Risk Assessment Hooks
    useGetCurrentFloodRiskQuery,
    useGetAllFloodRisksQuery,
    useGetFloodCharacteristicsByRiskQuery,
    useGetActiveFloodMonitoringQuery,

    // Sensor Hooks
    useGetAllSensorsQuery,
    useGetSensorByIdQuery,
    useGetSensorReadingsQuery,
    useGetLatestSensorReadingsQuery,
    useGetSensorStatisticsQuery,
    useUpdateSensorMutation,

    // Barangay Hooks
    useGetAllBarangaysQuery,
} = api

// Export alias for backward compatibility
export const useGetFloodCharacteristicsQuery = api.useGetFloodCharacteristicsByLocationQuery;