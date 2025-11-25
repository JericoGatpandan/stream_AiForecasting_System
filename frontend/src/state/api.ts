import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type {
  EnvironmentalData,
  FloodCharacteristics,
  FloodRiskAssessment,
  Sensor,
  SensorsResponse,
  SensorReadingsResponse,
  LatestReadingsResponse,
  Barangay,
} from './types';

// Backend response helper types (kept minimal to avoid any)
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
  riskFactors?: {
    rainfall?: number;
    waterLevel?: number;
    soilSaturation?: number;
    drainageCapacity?: number;
  };
  risk_factors?: {
    rainfall?: number;
    waterLevel?: number;
    soilSaturation?: number;
    drainageCapacity?: number;
  };
  predictions?: {
    nextHour?: string;
    next6Hours?: string;
    next24Hours?: string;
  };
  lastAssessment?: string;
  last_assessment?: string;
};

const debugLog = (message: string, data?: unknown) => {
  if (import.meta.env.VITE_ENABLE_DEV_TOOLS === 'true' || import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log('[API Debug]', message, data);
  }
};

export const api = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_BASE_URL || 'http://localhost:3001',
    prepareHeaders: (headers) => {
      debugLog('Preparing headers for request', {
        baseUrl: import.meta.env.VITE_BASE_URL,
      });
      headers.set('content-type', 'application/json');
      return headers;
    },
  }),
  reducerPath: 'main',
  tagTypes: [
    'EnvironmentalData',
    'FloodCharacteristics',
    'FloodRiskAssessment',
    'Sensor',
    'SensorReading',
    'Barangay',
  ],
  endpoints: (build) => ({
    // Barangays
    getBarangays: build.query<Barangay[], void>({
      query: () => 'barangays',
      providesTags: ['Barangay'],
    }),

    getBarangayById: build.query<Barangay, string | number>({
      query: (id) => `barangays/${id}`,
      providesTags: ['Barangay'],
    }),

    // Sensors
    getSensors: build.query<
      SensorsResponse,
      { barangayId?: string | number; status?: string } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params && params.barangayId) {
          queryParams.barangay_id = String(params.barangayId);
        }
        if (params && params.status) {
          queryParams.status = params.status;
        }
        return {
          url: 'sensors',
          params: queryParams,
        };
      },
      providesTags: ['Sensor'],
    }),

    getLatestReadings: build.query<
      LatestReadingsResponse,
      { barangayId?: string | number } | void
    >({
      query: (params) => {
        const queryParams: Record<string, string> = {};
        if (params && params.barangayId) {
          queryParams.barangay_id = String(params.barangayId);
        }
        return {
          url: 'sensors/latest',
          params: queryParams,
        };
      },
      providesTags: ['SensorReading'],
    }),

    getSensorReadings: build.query<
      SensorReadingsResponse,
      { sensorId: string | number; limit?: number; offset?: number }
    >({
      query: ({ sensorId, limit, offset }) => ({
        url: `sensors/${sensorId}/readings`,
        params: {
          limit: limit?.toString(),
          offset: offset?.toString(),
        },
      }),
      providesTags: ['SensorReading'],
    }),

    // Environmental data per barangay
    getEnvironmentalData: build.query<EnvironmentalData[], string>({
      query: (barangay) => `environmental/${encodeURIComponent(barangay)}`,
      providesTags: ['EnvironmentalData'],
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
          visibility: Number(r.visibility ?? 0),
          pressure: Number(r.atmospheric_pressure ?? 0),
          timestamp: r.timestamp ?? new Date().toISOString(),
        }));
      },
    }),

    // Flood characteristics
    getFloodCharacteristics: build.query<FloodCharacteristics[], void>({
      query: () => 'flood',
      providesTags: ['FloodCharacteristics'],
      transformResponse: (
        response: BackendFloodCharacteristicsRow[] | unknown,
      ): FloodCharacteristics[] => {
        if (!Array.isArray(response)) return [];
        return (response as BackendFloodCharacteristicsRow[]).map((r) => ({
          id: String(r.id ?? `${r.location}-char`),
          location: r.location ?? '',
          latitude: Number(r.latitude ?? 0),
          longitude: Number(r.longitude ?? 0),
          maximumDepth: Number(r.maximum_depth ?? r.maximumDepth ?? 0),
          maximumDepthUncertainty: Number(
            r.maximum_depth_uncertainty ?? r.maximumDepthUncertainty ?? 0,
          ),
          peakVelocity: Number(r.peak_velocity ?? r.peakVelocity ?? 0),
          peakVelocityUncertainty: Number(
            r.peak_velocity_uncertainty ?? r.peakVelocityUncertainty ?? 0,
          ),
          arrivalTime: Number(r.arrival_time ?? r.arrivalTime ?? 0),
          arrivalTimeUncertainty: Number(
            r.arrival_time_uncertainty ?? r.arrivalTimeUncertainty ?? 0,
          ),
          inundationArea: Number(r.inundation_area ?? r.inundationArea ?? 0),
          inundationAreaUncertainty: Number(
            r.inundation_area_uncertainty ?? r.inundationAreaUncertainty ?? 0,
          ),
          floodRiskLevel:
            (r.flood_risk_level ?? r.floodRiskLevel ?? 'low') as FloodCharacteristics['floodRiskLevel'],
          modelVersion: r.model_version ?? r.modelVersion ?? 'v1',
          lastUpdated: r.last_updated ?? r.lastUpdated ?? new Date().toISOString(),
          isActive: r.is_active ?? r.isActive ?? true,
          expertAnalysis: r.expert_analysis ?? r.expertAnalysis,
          recommendedActions: r.recommended_actions ?? r.recommendedActions,
          createdAt: r.createdAt ?? new Date().toISOString(),
          updatedAt: r.updatedAt ?? new Date().toISOString(),
        }));
      },
    }),

    getFloodCharacteristicsByBarangay: build.query<
      FloodCharacteristics | null,
      string
    >({
      query: (barangay) => `flood/${encodeURIComponent(barangay)}`,
      providesTags: ['FloodCharacteristics'],
      transformResponse: (
        response: BackendFloodCharacteristicsRow | BackendFloodCharacteristicsRow[] | null | unknown,
      ): FloodCharacteristics | null => {
        if (!response) return null;
        const r = Array.isArray(response)
          ? (response[0] as BackendFloodCharacteristicsRow)
          : (response as BackendFloodCharacteristicsRow);
        if (!r) return null;
        return {
          id: String(r.id ?? `${r.location}-char`),
          location: r.location ?? '',
          latitude: Number(r.latitude ?? 0),
          longitude: Number(r.longitude ?? 0),
          maximumDepth: Number(r.maximum_depth ?? r.maximumDepth ?? 0),
          maximumDepthUncertainty: Number(
            r.maximum_depth_uncertainty ?? r.maximumDepthUncertainty ?? 0,
          ),
          peakVelocity: Number(r.peak_velocity ?? r.peakVelocity ?? 0),
          peakVelocityUncertainty: Number(
            r.peak_velocity_uncertainty ?? r.peakVelocityUncertainty ?? 0,
          ),
          arrivalTime: Number(r.arrival_time ?? r.arrivalTime ?? 0),
          arrivalTimeUncertainty: Number(
            r.arrival_time_uncertainty ?? r.arrivalTimeUncertainty ?? 0,
          ),
          inundationArea: Number(r.inundation_area ?? r.inundationArea ?? 0),
          inundationAreaUncertainty: Number(
            r.inundation_area_uncertainty ?? r.inundationAreaUncertainty ?? 0,
          ),
          floodRiskLevel:
            (r.flood_risk_level ?? r.floodRiskLevel ?? 'low') as FloodCharacteristics['floodRiskLevel'],
          modelVersion: r.model_version ?? r.modelVersion ?? 'v1',
          lastUpdated: r.last_updated ?? r.lastUpdated ?? new Date().toISOString(),
          isActive: r.is_active ?? r.isActive ?? true,
          expertAnalysis: r.expert_analysis ?? r.expertAnalysis,
          recommendedActions: r.recommended_actions ?? r.recommendedActions,
          createdAt: r.createdAt ?? new Date().toISOString(),
          updatedAt: r.updatedAt ?? new Date().toISOString(),
        };
      },
    }),

    // Flood risk assessment / predictions per barangay
    getFloodRiskByBarangay: build.query<FloodRiskAssessment | null, string>({
      query: (barangay) => `predictions/${encodeURIComponent(barangay)}`,
      providesTags: ['FloodRiskAssessment'],
      transformResponse: (response: BackendFloodRisk | unknown): FloodRiskAssessment | null => {
        if (!response || typeof response !== 'object') return null;
        const r = response as BackendFloodRisk;
        const currentRiskLevel =
          r.currentRiskLevel ?? r.current_risk_level ?? 'low';
        const riskFactors = r.riskFactors ?? r.risk_factors ?? {};
        const predictions = r.predictions ?? {};
        return {
          location: r.location ?? '',
          currentRiskLevel,
          riskFactors: {
            rainfall: riskFactors.rainfall ?? 0,
            waterLevel: riskFactors.waterLevel ?? 0,
            soilSaturation: riskFactors.soilSaturation ?? 0,
            drainageCapacity: riskFactors.drainageCapacity ?? 0,
          },
          predictions: {
            nextHour: (predictions.nextHour ?? 'low') as FloodRiskAssessment['predictions']['nextHour'],
            next6Hours: (predictions.next6Hours ?? 'low') as FloodRiskAssessment['predictions']['next6Hours'],
            next24Hours: (predictions.next24Hours ?? 'low') as FloodRiskAssessment['predictions']['next24Hours'],
          },
          recommendations: [],
          lastAssessment: r.lastAssessment ?? r.last_assessment ?? new Date().toISOString(),
        };
      },
    }),
  }),
});

// Export hooks for usage in functional components
export const {
  // Barangay Hooks
  useGetBarangaysQuery,
  useGetBarangayByIdQuery,

  // Sensor Hooks
  useGetSensorsQuery,
  useGetLatestReadingsQuery,
  useGetSensorReadingsQuery,

  // Environmental Data Hooks
  useGetEnvironmentalDataQuery,

  // Flood Characteristics Hooks
  useGetFloodCharacteristicsQuery,
  useGetFloodCharacteristicsByBarangayQuery,

  // Flood Risk Hooks
  useGetFloodRiskByBarangayQuery,
} = api;
