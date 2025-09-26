import React, { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { useGetSensorReadingsQuery } from '../state/api';
import type { SensorReading } from '../state/types';

interface SensorReadingsChartProps {
    sensorId: string;
    sensorName?: string;
}

const SensorReadingsChart: React.FC<SensorReadingsChartProps> = ({ 
    sensorId, 
    sensorName 
}) => {
    const [selectedPeriod, setSelectedPeriod] = useState('24h');
    const [selectedParameter, setSelectedParameter] = useState('water_level');

    // Calculate time range based on period
    const getTimeRange = (period: string) => {
        const now = new Date();
        const periodMap: { [key: string]: number } = {
            '1h': 1 * 60 * 60 * 1000,
            '6h': 6 * 60 * 60 * 1000,
            '24h': 24 * 60 * 60 * 1000,
            '7d': 7 * 24 * 60 * 60 * 1000,
            '30d': 30 * 24 * 60 * 60 * 1000,
        };
        const startTime = new Date(now.getTime() - periodMap[period]);
        return {
            start_time: startTime.toISOString(),
            end_time: now.toISOString(),
        };
    };

    const timeRange = getTimeRange(selectedPeriod);

    const {
        data: readingsData,
        isLoading,
        error,
    } = useGetSensorReadingsQuery({
        sensorId,
        ...timeRange,
        limit: selectedPeriod === '30d' ? 200 : 100,
        parameters: selectedParameter,
    });

    const parameterOptions = [
        { value: 'water_level', label: 'Water Level (m)', color: '#2196F3' },
        { value: 'rainfall', label: 'Rainfall (mm)', color: '#4CAF50' },
        { value: 'air_temperature', label: 'Air Temperature (°C)', color: '#FF5722' },
        { value: 'humidity', label: 'Humidity (%)', color: '#9C27B0' },
        { value: 'wind_speed', label: 'Wind Speed (m/s)', color: '#FF9800' },
        { value: 'atmospheric_pressure', label: 'Pressure (hPa)', color: '#795548' },
    ];

    const periodOptions = [
        { value: '1h', label: 'Last Hour' },
        { value: '6h', label: 'Last 6 Hours' },
        { value: '24h', label: 'Last 24 Hours' },
        { value: '7d', label: 'Last 7 Days' },
        { value: '30d', label: 'Last 30 Days' },
    ];

    const formatChartData = (readings: SensorReading[]) => {
        return readings.map((reading) => ({
            timestamp: new Date(reading.timestamp).toLocaleString(),
            value: reading[selectedParameter as keyof SensorReading] as number,
            fullTimestamp: reading.timestamp,
        })).filter(item => item.value !== null && item.value !== undefined);
    };

    const selectedParamOption = parameterOptions.find(p => p.value === selectedParameter);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded shadow">
                    <p className="font-semibold">{label}</p>
                    <p style={{ color: selectedParamOption?.color }}>
                        {`${selectedParamOption?.label}: ${payload[0].value?.toFixed(2)}`}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <Box display="flex" justifyContent="center" alignItems="center" height="300px">
                        <CircularProgress />
                    </Box>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent>
                    <Alert severity="error">
                        Failed to load sensor readings
                    </Alert>
                </CardContent>
            </Card>
        );
    }

    const chartData = readingsData?.readings ? formatChartData(readingsData.readings) : [];

    return (
        <Card>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h6">
                        {sensorName ? `${sensorName} - Readings` : 'Sensor Readings'}
                    </Typography>
                </Box>

                <Grid container spacing={2} mb={3}>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Parameter</InputLabel>
                            <Select
                                value={selectedParameter}
                                onChange={(e) => setSelectedParameter(e.target.value)}
                                label="Parameter"
                            >
                                {parameterOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Time Period</InputLabel>
                            <Select
                                value={selectedPeriod}
                                onChange={(e) => setSelectedPeriod(e.target.value)}
                                label="Time Period"
                            >
                                {periodOptions.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                {chartData.length > 0 ? (
                    <Box height="400px">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                    dataKey="timestamp"
                                    tick={{ fontSize: 12 }}
                                    interval="preserveStartEnd"
                                />
                                <YAxis 
                                    tick={{ fontSize: 12 }}
                                    domain={['dataMin - 5%', 'dataMax + 5%']}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={selectedParamOption?.color || '#2196F3'}
                                    strokeWidth={2}
                                    dot={{ fill: selectedParamOption?.color || '#2196F3', strokeWidth: 2, r: 3 }}
                                    name={selectedParamOption?.label || selectedParameter}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </Box>
                ) : (
                    <Box textAlign="center" py={4}>
                        <Typography color="textSecondary">
                            No data available for the selected parameter and time period
                        </Typography>
                    </Box>
                )}

                <Box mt={2}>
                    <Typography variant="caption" color="textSecondary">
                        Total readings: {readingsData?.total || 0} | 
                        Showing: {chartData.length} points
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

export default SensorReadingsChart;