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
    FloodAlert
} from './types';


export const api = createApi({
    baseQuery: fetchBaseQuery({ baseUrl: import.meta.env.VITE_BASE_URL }),
    reducerPath: 'main',
    tagTypes: ['WeatherAlert', 'UserLocation', 'WeatherTrigger', 'Notification', 'EnvironmentalData', 'FloodCharacteristics', 'FloodRiskAssessment'],
    endpoints: (build) => ({
        // Weather Data Endpoints
        getWeatherForecast: build.query<WeatherForecast[], string>({
            query: (location) => `weather/forecast/${location}`,
        }),

        getHourlyForecast: build.query<HourlyForecast[], string>({
            query: (location) => `weather/forecast/hourly/${location}`,
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
        getEnvironmentalData: build.query<EnvironmentalData, string>({
            query: (barangay) => `environmental/${barangay}`,
            providesTags: ['EnvironmentalData'],
        }),

        // Flood Characteristics Endpoints
        getAllFloodCharacteristics: build.query<FloodCharacteristics[], void>({
            query: () => 'flood/characteristics',
            providesTags: ['FloodCharacteristics'],
        }),

        getFloodCharacteristicsByLocation: build.query<FloodCharacteristics[], string>({
            query: (location) => `flood/characteristics/${location}`,
            providesTags: ['FloodCharacteristics'],
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
        }),

        getAllFloodRisks: build.query<FloodRiskAssessment[], void>({
            query: () => 'flood/risk',
            providesTags: ['FloodRiskAssessment'],
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
} = api