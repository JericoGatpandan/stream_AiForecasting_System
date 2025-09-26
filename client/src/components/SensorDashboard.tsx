import React, { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    Alert,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Button,
    Switch,
    FormControlLabel,
} from '@mui/material';
import {
    Sensors as SensorsIcon,
    BatteryFull,
    BatteryAlert,
    Refresh,
    Warning,
    CheckCircle,
    Error,
    Build,
} from '@mui/icons-material';
import { useGetLatestSensorReadingsQuery } from '../state/api';

const SensorDashboard: React.FC = () => {
    const [selectedBarangay, setSelectedBarangay] = useState<string>('');
    const [selectedSensorType, setSelectedSensorType] = useState<string>('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    // Fetch latest readings for all sensors
    const {
        data: latestReadingsData,
        isLoading: loadingReadings,
        error: readingsError,
        refetch: refetchReadings,
    } = useGetLatestSensorReadingsQuery(
        {
            barangay_id: selectedBarangay || undefined,
            sensor_type: selectedSensorType || undefined,
        },
        {
            pollingInterval: autoRefresh ? 30000 : 0, // Refresh every 30 seconds if auto-refresh is on
        }
    );

    // Fetch all sensors metadata if needed (not used currently)
    // const { data: sensorsData } = useGetAllSensorsQuery({});

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success';
            case 'maintenance':
                return 'warning';
            case 'error':
                return 'error';
            default:
                return 'default';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'active':
                return <CheckCircle />;
            case 'maintenance':
                return <Build />;
            case 'error':
                return <Error />;
            default:
                return <Warning />;
        }
    };

    const getBatteryIcon = (batteryLevel?: number) => {
        if (!batteryLevel) return <BatteryAlert color="disabled" />;
        return batteryLevel > 20 ? <BatteryFull color="success" /> : <BatteryAlert color="error" />;
    };

    const formatTimestamp = (timestamp: string) => {
        return new Date(timestamp).toLocaleString();
    };

    const formatValue = (value: number | null | undefined, unit: string) => {
        if (value === null || value === undefined) return 'N/A';
        return `${value.toFixed(2)} ${unit}`;
    };

    if (loadingReadings) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (readingsError) {
        return (
            <Alert severity="error">
                Failed to load sensor data. Please try again.
                <Button onClick={() => refetchReadings()}>Retry</Button>
            </Alert>
        );
    }

    const sensors = latestReadingsData?.sensors || [];
    const uniqueBarangays = [...new Set(sensors.map(s => s.barangay.name))];
    const uniqueSensorTypes = [...new Set(sensors.map(s => s.sensor_type))];

    return (
        <Box p={3}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" display="flex" alignItems="center">
                    <SensorsIcon sx={{ mr: 2 }} />
                    Sensor Dashboard
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                            />
                        }
                        label="Auto Refresh"
                    />
                    <Tooltip title="Refresh Now">
                        <IconButton onClick={() => refetchReadings()}>
                            <Refresh />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Filters */}
            <Box display="flex" gap={2} mb={3}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Barangay</InputLabel>
                    <Select
                        value={selectedBarangay}
                        onChange={(e) => setSelectedBarangay(e.target.value)}
                        label="Barangay"
                    >
                        <MenuItem value="">All Barangays</MenuItem>
                        {uniqueBarangays.map((barangay) => (
                            <MenuItem key={barangay} value={barangay}>
                                {barangay}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Sensor Type</InputLabel>
                    <Select
                        value={selectedSensorType}
                        onChange={(e) => setSelectedSensorType(e.target.value)}
                        label="Sensor Type"
                    >
                        <MenuItem value="">All Types</MenuItem>
                        {uniqueSensorTypes.map((type) => (
                            <MenuItem key={type} value={type}>
                                {type.replace('_', ' ').toUpperCase()}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Summary Stats */}
            <Box mb={3}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Total Sensors
                                </Typography>
                                <Typography variant="h4">
                                    {sensors.length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Active
                                </Typography>
                                <Typography variant="h4" color="success.main">
                                    {sensors.filter(s => s.status === 'active').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Maintenance
                                </Typography>
                                <Typography variant="h4" color="warning.main">
                                    {sensors.filter(s => s.status === 'maintenance').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Card>
                            <CardContent>
                                <Typography color="textSecondary" gutterBottom>
                                    Errors
                                </Typography>
                                <Typography variant="h4" color="error.main">
                                    {sensors.filter(s => s.status === 'error').length}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            {/* Sensor Cards */}
            <Grid container spacing={3}>
                {sensors.map((sensor) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={sensor.sensor_id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                    <Box>
                                        <Typography variant="h6" component="h2">
                                            {sensor.sensor_name}
                                        </Typography>
                                        <Typography color="textSecondary" variant="body2">
                                            {sensor.barangay.name}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" flexDirection="column" alignItems="flex-end" gap={1}>
                                        <Chip
                                            icon={getStatusIcon(sensor.status)}
                                            label={sensor.status.toUpperCase()}
                                            color={getStatusColor(sensor.status) as any}
                                            size="small"
                                        />
                                        <Tooltip title={`Battery: ${sensor.battery_level || 'N/A'}%`}>
                                            <Box display="flex" alignItems="center">
                                                {getBatteryIcon(sensor.battery_level)}
                                                <Typography variant="caption" ml={0.5}>
                                                    {sensor.battery_level ? `${sensor.battery_level}%` : 'N/A'}
                                                </Typography>
                                            </Box>
                                        </Tooltip>
                                    </Box>
                                </Box>

                                <Typography variant="body2" color="textSecondary" mb={1}>
                                    Type: {sensor.sensor_type.replace('_', ' ').toUpperCase()}
                                </Typography>

                                {sensor.watershed_zone && (
                                    <Typography variant="body2" color="textSecondary" mb={1}>
                                        Zone: {sensor.watershed_zone}
                                    </Typography>
                                )}

                                {sensor.latest_reading ? (
                                    <Box mt={2}>
                                        <Typography variant="subtitle2" mb={1}>
                                            Latest Reading ({formatTimestamp(sensor.latest_reading.timestamp)})
                                        </Typography>
                                        <Grid container spacing={1}>
                                            {sensor.latest_reading.water_level !== null && (
                                                <Grid size={6}>
                                                    <Typography variant="body2">
                                                        Water Level: {formatValue(sensor.latest_reading.water_level, 'm')}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {sensor.latest_reading.rainfall !== null && (
                                                <Grid size={6}>
                                                    <Typography variant="body2">
                                                        Rainfall: {formatValue(sensor.latest_reading.rainfall, 'mm')}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {sensor.latest_reading.air_temperature !== null && (
                                                <Grid size={6}>
                                                    <Typography variant="body2">
                                                        Temp: {formatValue(sensor.latest_reading.air_temperature, '°C')}
                                                    </Typography>
                                                </Grid>
                                            )}
                                            {sensor.latest_reading.humidity !== null && (
                                                <Grid size={6}>
                                                    <Typography variant="body2">
                                                        Humidity: {formatValue(sensor.latest_reading.humidity, '%')}
                                                    </Typography>
                                                </Grid>
                                            )}
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Alert severity="warning" sx={{ mt: 2 }}>
                                        No recent data available
                                    </Alert>
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {sensors.length === 0 && (
                <Box textAlign="center" py={4}>
                    <Typography variant="h6" color="textSecondary">
                        No sensors found matching the selected criteria
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default SensorDashboard;