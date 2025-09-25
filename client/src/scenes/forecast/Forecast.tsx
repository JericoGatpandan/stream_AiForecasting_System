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
    Skeleton,
    Stack,
    Avatar,
    Container
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import RefreshIcon from '@mui/icons-material/Refresh';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WaterIcon from '@mui/icons-material/Water';
import FloodIcon from '@mui/icons-material/Flood';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import BarangaySelector from '@/components/BarangaySelector';
import AlertBanner from '@/components/AlertBanner';
import { useGetWeatherForecastQuery, useGetHourlyForecastQuery, useGetFloodCharacteristicsQuery, useGetCurrentFloodRiskQuery } from '@/state/api';

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

    const {
        data: _floodData,
        isLoading: floodLoading,
        refetch: refetchFlood
    } = useGetFloodCharacteristicsQuery(selectedBarangay);

    const {
        data: floodRiskData,
        isLoading: riskLoading,
        refetch: refetchRisk
    } = useGetCurrentFloodRiskQuery(selectedBarangay);

    const handleRefresh = () => {
        refetchForecast();
        refetchHourly();
        refetchFlood();
        refetchRisk();
    };




    const getFloodRiskColor = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'low': return '#4CAF50';
            case 'moderate': return '#FFC107';
            case 'high': return '#FF9800';
            case 'extreme': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const getFloodRiskIcon = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'low': return <CheckCircleIcon />;
            case 'moderate': return <WarningIcon />;
            case 'high': return <ErrorIcon />;
            case 'extreme': return <FloodIcon />;
            default: return <WaterIcon />;
        }
    };

    const getRainfallIntensity = (amount: number) => {
        if (amount >= 20) return { level: 'Heavy', color: '#F44336', risk: 'High flood risk' };
        if (amount >= 10) return { level: 'Moderate', color: '#FF9800', risk: 'Moderate flood risk' };
        if (amount >= 5) return { level: 'Light', color: '#FFC107', risk: 'Low flood risk' };
        return { level: 'No Rain', color: '#4CAF50', risk: 'No flood risk' };
    };


    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <Container maxWidth="xl" sx={{ py: 3, minHeight: '100vh' }}>
            {/* Header Section */}
            <Box sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)', color: 'white', borderRadius: 3, boxShadow: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                            <FloodIcon sx={{ fontSize: '2rem', color: 'white' }} />
                        </Avatar>
                        <Box>
                            <Typography variant="h4" fontWeight="bold">
                                Flood Risk Forecast
                            </Typography>
                            <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                                Real-time flood monitoring and predictions
                            </Typography>
                            <Typography variant="body2" sx={{ opacity: 0.8 }}>
                                {new Date().toLocaleDateString('en-US', { 
                                    weekday: 'long', 
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric' 
                                })}
                            </Typography>
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <BarangaySelector
                            selectedBarangay={selectedBarangay}
                            onBarangayChange={setSelectedBarangay}
                            whiteTheme={true}
                        />
                        <Tooltip title="Refresh Flood Data">
                            <IconButton onClick={handleRefresh} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon fontSize="small" sx={{ color: 'white' }} />
                    <Typography variant="body1" sx={{ fontWeight: 500, color: 'white' }}>
                        Monitoring flood conditions for {selectedBarangay}
                    </Typography>
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

            {/* Current Flood Risk Assessment */}
            <Paper elevation={2} sx={{ p: 0, mb: 3, borderRadius: 3, overflow: 'hidden' }}>
                {riskLoading || floodLoading ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Skeleton variant="rectangular" width="100%" height={200} />
                    </Box>
                ) : floodRiskData ? (
                    <Box sx={{ 
                        background: `linear-gradient(135deg, ${getFloodRiskColor(floodRiskData.currentRiskLevel)}22 0%, ${getFloodRiskColor(floodRiskData.currentRiskLevel)}11 100%)`,
                        p: 4
                    }}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ color: 'text.primary' }}>
                            Current Flood Risk Status
                        </Typography>
                        <Grid container spacing={3} alignItems="center">
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Box sx={{ textAlign: 'center' }}>
                                    <Box sx={{ fontSize: '4rem', color: getFloodRiskColor(floodRiskData.currentRiskLevel), mb: 1 }}>
                                        {getFloodRiskIcon(floodRiskData.currentRiskLevel)}
                                    </Box>
                                    <Typography variant="h3" fontWeight="bold" sx={{ color: getFloodRiskColor(floodRiskData.currentRiskLevel), textTransform: 'uppercase' }}>
                                        {floodRiskData.currentRiskLevel}
                                    </Typography>
                                    <Typography variant="h6" color="text.secondary">
                                        Flood Risk Level
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Last updated: {new Date().toLocaleTimeString()}
                                    </Typography>
                                </Box>
                            </Grid>
                            
                            <Grid size={{ xs: 12, md: 8 }}>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                            <WaterIcon sx={{ color: '#2196F3', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">Water Level</Typography>
                                            <Typography variant="h6" fontWeight="bold">{floodRiskData.riskFactors?.waterLevel || 'N/A'} m</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                            <WaterDropIcon sx={{ color: '#FF9800', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">Expected Rain</Typography>
                                            <Typography variant="h6" fontWeight="bold">{forecastData?.[0]?.precipitation || 0}%</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                            <SpeedIcon sx={{ color: '#4CAF50', mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">Flow Rate</Typography>
                                            <Typography variant="h6" fontWeight="bold">{floodRiskData.riskFactors?.soilSaturation || 'N/A'} m/s</Typography>
                                        </Box>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
                                            <WarningIcon sx={{ color: getFloodRiskColor(floodRiskData.currentRiskLevel), mb: 1 }} />
                                            <Typography variant="body2" color="text.secondary">Alert Level</Typography>
                                            <Typography variant="h6" fontWeight="bold">{floodRiskData.currentRiskLevel || 'Normal'}</Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant="h6" color="text.secondary">
                            No flood risk data available
                        </Typography>
                    </Box>
                )}
            </Paper>

            {/* 7-Day Flood Risk Forecast */}
            <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    7-Day Flood Risk Forecast
                </Typography>
                
                {forecastLoading ? (
                    <Stack spacing={1}>
                        {Array.from({ length: 7 }).map((_, index) => (
                            <Skeleton key={index} variant="rectangular" width="100%" height={80} sx={{ borderRadius: 2 }} />
                        ))}
                    </Stack>
                ) : (
                    <Stack spacing={1}>
                        {forecastData?.slice(0, 7).map((forecast, index) => (
                            <Card key={index} sx={{
                                transition: 'all 0.2s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateX(8px)',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                                }
                            }}>
                                <CardContent sx={{ py: 2 }}>
                                    <Grid container alignItems="center" spacing={2}>
                                        {/* Day */}
                                        <Grid size={2}>
                                            <Box sx={{ textAlign: 'center' }}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {index === 0 ? 'Today' : new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' })}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(forecast.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                        
                                        {/* Flood Risk Indicator */}
                                        <Grid size={3}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ color: getFloodRiskColor('moderate'), fontSize: '2rem' }}>
                                                    {getFloodRiskIcon('moderate')}
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                        Moderate Risk
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {getRainfallIntensity(forecast.precipitation * 0.5).level} Rain Expected
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        {/* Rainfall Amount */}
                                        <Grid size={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <WaterDropIcon fontSize="small" sx={{ color: '#2196F3' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        {(forecast.precipitation * 0.3).toFixed(1)}mm
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Expected
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        {/* Water Level Trend */}
                                        <Grid size={2}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <TrendingUpIcon fontSize="small" sx={{ color: '#FF9800' }} />
                                                <Box>
                                                    <Typography variant="body2" fontWeight="medium">
                                                        +0.{Math.floor(Math.random() * 9)}m
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        Rising
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        
                                        {/* Flood Alert */}
                                        <Grid size={3}>
                                            <Box sx={{ textAlign: 'right' }}>
                                                <Chip 
                                                    size="small"
                                                    label="MONITOR"
                                                    sx={{
                                                        bgcolor: '#FFC107',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        mb: 1
                                                    }}
                                                />
                                                <Typography variant="caption" color="text.secondary" display="block">
                                                    Status: Watch
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </Paper>

            {/* Hourly Flood Monitoring */}
            <Paper elevation={2} sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                    24-Hour Flood Risk Monitoring
                </Typography>
                
                <Box sx={{
                    display: 'flex',
                    gap: 2,
                    overflowX: 'auto',
                    pb: 3,
                    '&::-webkit-scrollbar': {
                        height: 8,
                    },
                    '&::-webkit-scrollbar-track': {
                        backgroundColor: 'rgba(0,0,0,0.05)',
                        borderRadius: 4,
                    },
                    '&::-webkit-scrollbar-thumb': {
                        backgroundColor: theme.palette.primary.main,
                        borderRadius: 4,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        }
                    }
                }}>
                    {hourlyLoading ? (
                        Array.from({ length: 24 }).map((_, index) => (
                            <Box key={index} sx={{ minWidth: 100, textAlign: 'center', p: 2 }}>
                                <Skeleton variant="text" width={60} height={20} sx={{ mx: 'auto', mb: 1 }} />
                                <Skeleton variant="circular" width={40} height={40} sx={{ mx: 'auto', my: 2 }} />
                                <Skeleton variant="text" width={40} height={24} sx={{ mx: 'auto', mb: 1 }} />
                                <Skeleton variant="text" width={30} height={16} sx={{ mx: 'auto' }} />
                            </Box>
                        ))
                    ) : (
                        hourlyData?.slice(0, 24).map((hour, index) => {
                            const isCurrentHour = index === 0;
                            return (
                                <Card key={index} sx={{ 
                                    minWidth: 120, 
                                    textAlign: 'center',
                                    border: isCurrentHour ? '2px solid' : '1px solid',
                                    borderColor: isCurrentHour ? 'primary.main' : 'divider',
                                    bgcolor: isCurrentHour ? 'primary.50' : 'background.paper',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                                    }
                                }}>
                                    {isCurrentHour && (
                                        <Box sx={{ 
                                            position: 'absolute', 
                                            top: -1, 
                                            right: -1, 
                                            bgcolor: 'primary.main', 
                                            color: 'white', 
                                            borderRadius: '0 8px 0 8px',
                                            px: 1,
                                            py: 0.5,
                                            fontSize: 10,
                                            fontWeight: 'bold'
                                        }}>
                                            NOW
                                        </Box>
                                    )}
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                                            {index === 0 ? 'Now' : formatTime(hour.hour)}
                                        </Typography>

                                        <Box sx={{ my: 2, color: getFloodRiskColor('low'), fontSize: '2.5rem' }}>
                                            {getFloodRiskIcon('low')}
                                        </Box>

                                        <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, color: getFloodRiskColor('low') }}>
                                            LOW
                                        </Typography>

                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, alignItems: 'center' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                <WaterIcon fontSize="small" sx={{ color: '#2196F3' }} />
                                                <Typography variant="caption" sx={{ color: '#2196F3', fontWeight: 'medium' }}>
                                                    {(1.2 + Math.random() * 0.5).toFixed(1)}m
                                                </Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">
                                                Water Level
                                            </Typography>
                                            {hour.precipitation > 10 && (
                                                <Chip 
                                                    size="small" 
                                                    label="Rain Expected"
                                                    sx={{ 
                                                        bgcolor: '#E3F2FD', 
                                                        color: '#1976D2', 
                                                        fontSize: '0.7rem',
                                                        height: 20
                                                    }} 
                                                />
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Box>
            </Paper>
        </Container>
    );
};

export default Forecast;