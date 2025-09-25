import React, { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    Tooltip,
    Skeleton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudIcon from '@mui/icons-material/Cloud';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import ThunderstormIcon from '@mui/icons-material/Thunderstorm';
import BarangaySelector from '@/components/BarangaySelector';
import DataCard from '@/components/DataCard';
import AlertBanner from '@/components/AlertBanner';
import { useGetWeatherForecastQuery, useGetHourlyForecastQuery } from '@/state/api';

const Forecast: React.FC = () => {
    const theme = useTheme();
    const [selectedBarangay, setSelectedBarangay] = useState('Pacol');

    const {
        data: forecastData,
        isLoading: forecastLoading,
        error: forecastError,
        refetch: refetchForecast
    } = useGetWeatherForecastQuery(selectedBarangay);

    const {
        data: hourlyData,
        isLoading: hourlyLoading,
        refetch: refetchHourly
    } = useGetHourlyForecastQuery(selectedBarangay);

    const handleRefresh = () => {
        refetchForecast();
        refetchHourly();
    };

    const getWeatherIcon = (condition: string) => {
        const conditionLower = condition?.toLowerCase() || '';
        if (conditionLower.includes('rain') || conditionLower.includes('storm')) {
            return <ThunderstormIcon />;
        }
        if (conditionLower.includes('cloud')) {
            return <CloudIcon />;
        }
        return <WbSunnyIcon />;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
                    Weather Forecast
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <BarangaySelector
                        selectedBarangay={selectedBarangay}
                        onBarangayChange={setSelectedBarangay}
                    />
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} color="primary">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {forecastError && (
                <AlertBanner
                    severity="error"
                    title="Unable to load forecast data"
                    message="Please check your connection and try again."
                    onClose={() => { }}
                />
            )}

            {/* Current Weather Overview */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    Current Overview - {selectedBarangay}
                </Typography>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6} md={3}>
                        <DataCard
                            title="Temperature"
                            value={forecastLoading ? '' : forecastData?.[0]?.temperature_max || 'N/A'}
                            unit="°C"
                            icon={<ThermostatIcon />}
                            color="primary"
                            loading={forecastLoading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DataCard
                            title="Humidity"
                            value={forecastLoading ? '' : forecastData?.[0]?.humidity || 'N/A'}
                            unit="%"
                            icon={<OpacityIcon />}
                            color="info"
                            loading={forecastLoading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DataCard
                            title="Wind Speed"
                            value={forecastLoading ? '' : forecastData?.[0]?.wind_speed || 'N/A'}
                            unit="m/s"
                            icon={<AirIcon />}
                            color="secondary"
                            loading={forecastLoading}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <DataCard
                            title="Visibility"
                            value={forecastLoading ? '' : forecastData?.[0]?.visibility || 'N/A'}
                            unit="km"
                            icon={<VisibilityIcon />}
                            color="success"
                            loading={forecastLoading}
                        />
                    </Grid>
                </Grid>
            </Paper>

            {/* 7-Day Forecast */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    7-Day Forecast
                </Typography>
                <Grid container spacing={2}>
                    {forecastLoading ? (
                        Array.from({ length: 7 }).map((_, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <Card>
                                    <CardContent>
                                        <Skeleton variant="text" width="60%" />
                                        <Skeleton variant="circular" width={40} height={40} sx={{ my: 1 }} />
                                        <Skeleton variant="text" width="80%" />
                                        <Skeleton variant="text" width="40%" />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (
                        forecastData?.slice(0, 7).map((forecast, index) => (
                            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                                <Card sx={{
                                    height: '100%',
                                    transition: 'transform 0.2s',
                                    '&:hover': {
                                        transform: 'translateY(-2px)'
                                    }
                                }}>
                                    <CardContent sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                                            {formatDate(forecast.forecast_date)}
                                        </Typography>

                                        <Box sx={{ my: 2 }}>
                                            {getWeatherIcon(forecast.weather_condition || 'sunny')}
                                        </Box>

                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="h6" color="primary">
                                                {forecast.temperature_max}°C
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Low: {forecast.temperature_min}°C
                                            </Typography>
                                        </Box>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                            {forecast.precipitation_probability > 20 && (
                                                <Chip
                                                    label={`${forecast.precipitation_probability}% rain`}
                                                    size="small"
                                                    color="info"
                                                    variant="outlined"
                                                />
                                            )}
                                            <Typography variant="caption" color="text.secondary">
                                                Wind: {forecast.wind_speed} m/s {forecast.wind_direction}
                                            </Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            </Paper>

            {/* Hourly Forecast */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                    24-Hour Forecast
                </Typography>
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 2,
                    '&::-webkit-scrollbar': {
                        height: 6,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: theme.palette.grey[200],
                        borderRadius: 3,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 3,
                    }
                }}>
                    {hourlyLoading ? (
                        Array.from({ length: 24 }).map((_, index) => (
                            <Box key={index} sx={{ minWidth: 80, textAlign: 'center' }}>
                                <Skeleton variant="text" width={60} />
                                <Skeleton variant="circular" width={30} height={30} sx={{ mx: 'auto', my: 1 }} />
                                <Skeleton variant="text" width={40} />
                                <Skeleton variant="text" width={35} />
                            </Box>
                        ))
                    ) : (
                        hourlyData?.slice(0, 24).map((hour, index) => (
                            <Card key={index} sx={{ minWidth: 100, textAlign: 'center' }}>
                                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                                    <Typography variant="caption" display="block" gutterBottom>
                                        {formatTime(hour.forecast_time)}
                                    </Typography>

                                    <Box sx={{ my: 1, fontSize: 20 }}>
                                        {getWeatherIcon(hour.weather_condition || 'sunny')}
                                    </Box>

                                    <Typography variant="body2" fontWeight="bold">
                                        {hour.temperature}°C
                                    </Typography>

                                    {hour.precipitation_probability > 20 && (
                                        <Typography variant="caption" color="info.main">
                                            {hour.precipitation_probability}%
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        ))
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default Forecast;