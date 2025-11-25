import React, { useState } from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Chip,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Tooltip,
} from '@mui/material';
import {
    LocationOn,
    Sensors,
    Battery90,
    // SignalWifi4Bar,
    AccessTime,
    Edit,
    Save,
    Cancel,
    Refresh,
} from '@mui/icons-material';
import { useGetSensorByIdQuery, useUpdateSensorMutation } from '../state/api';
import SensorReadingsChart from './SensorReadingsChart';
import type { Sensor } from '../state/types';

interface SensorDetailViewProps {
    sensorId: string;
    onClose?: () => void;
}

const SensorDetailView: React.FC<SensorDetailViewProps> = ({ sensorId }) => {
    const [editMode, setEditMode] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Sensor>>({});

    const {
        data: sensor,
        isLoading,
        error,
        refetch,
    } = useGetSensorByIdQuery({ sensorId, include_readings_hours: 24 });

    const [updateSensor, { isLoading: isUpdating }] = useUpdateSensorMutation();

    const handleEdit = () => {
        if (sensor) {
            setEditFormData({
                status: sensor.status,
                battery_level: sensor.battery_level,
                transmission_interval: sensor.transmission_interval,
                watershed_zone: sensor.watershed_zone,
                river_section: sensor.river_section,
            });
            setEditMode(true);
        }
    };

    const handleSave = async () => {
        try {
            await updateSensor({
                sensorId,
                updates: editFormData,
            }).unwrap();
            setEditMode(false);
            refetch(); // Refresh sensor data
        } catch (error) {
            console.error('Failed to update sensor:', error);
        }
    };

    const handleCancel = () => {
        setEditMode(false);
        setEditFormData({});
    };

    const formatTimestamp = (timestamp?: string) => {
        if (!timestamp) return 'N/A';
        return new Date(timestamp).toLocaleString();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'success' as const;
            case 'maintenance':
                return 'warning' as const;
            case 'error':
                return 'error' as const;
            default:
                return 'default' as const;
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                Loading sensor details...
            </Box>
        );
    }

    if (error || !sensor) {
        return (
            <Alert severity="error">
                Failed to load sensor details
            </Alert>
        );
    }

    return (
        <Box>
            <Grid container spacing={3}>
                {/* Sensor Information Card */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                <Typography variant="h5" component="h2">
                                    {sensor.name}
                                </Typography>
                                <Box>
                                    <Tooltip title="Refresh Data">
                                        <IconButton onClick={() => refetch()}>
                                            <Refresh />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title={editMode ? "Cancel Edit" : "Edit Sensor"}>
                                        <IconButton
                                            onClick={editMode ? handleCancel : handleEdit}
                                            color={editMode ? "secondary" : "primary"}
                                        >
                                            {editMode ? <Cancel /> : <Edit />}
                                        </IconButton>
                                    </Tooltip>
                                    {editMode && (
                                        <Tooltip title="Save Changes">
                                            <IconButton
                                                onClick={handleSave}
                                                color="primary"
                                                disabled={isUpdating}
                                            >
                                                <Save />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>

                            <Box mb={2}>
                                {editMode ? (
                                    <FormControl size="small" sx={{ minWidth: 120 }}>
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={editFormData.status || sensor.status}
                                            onChange={(e) => setEditFormData(prev => ({ ...prev, status: e.target.value as 'active' | 'inactive' | 'maintenance' | 'error' }))}
                                            label="Status"
                                        >
                                            <MenuItem value="active">Active</MenuItem>
                                            <MenuItem value="maintenance">Maintenance</MenuItem>
                                            <MenuItem value="error">Error</MenuItem>
                                            <MenuItem value="inactive">Inactive</MenuItem>
                                        </Select>
                                    </FormControl>
                                ) : (
                                    <Chip
                                        label={sensor.status.toUpperCase()}
                                        color={getStatusColor(sensor.status)}
                                        variant="outlined"
                                    />
                                )}
                            </Box>

                            <List dense>
                                <ListItem>
                                    <Sensors sx={{ mr: 2 }} />
                                    <ListItemText
                                        primary="Sensor Type"
                                        secondary={sensor.sensor_type.replace('_', ' ').toUpperCase()}
                                    />
                                </ListItem>

                                <ListItem>
                                    <LocationOn sx={{ mr: 2 }} />
                                    <ListItemText
                                        primary="Location"
                                        secondary={`${sensor.barangay?.name || 'N/A'} (${sensor.latitude}, ${sensor.longitude})`}
                                    />
                                </ListItem>

                                {sensor.altitude && (
                                    <ListItem>
                                        <ListItemText
                                            primary="Altitude"
                                            secondary={`${sensor.altitude} m`}
                                            sx={{ ml: 4 }}
                                        />
                                    </ListItem>
                                )}

                                <ListItem>
                                    <Battery90 sx={{ mr: 2 }} />
                                    <ListItemText
                                        primary="Battery Level"
                                        secondary={editMode ? (
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={editFormData.battery_level || sensor.battery_level || ''}
                                                onChange={(e) => setEditFormData(prev => ({
                                                    ...prev,
                                                    battery_level: parseFloat(e.target.value)
                                                }))}
                                                inputProps={{ min: 0, max: 100 }}
                                                sx={{ width: 100 }}
                                            />
                                        ) : (
                                            `${sensor.battery_level || 'N/A'}%`
                                        )}
                                    />
                                </ListItem>

                                <ListItem>
                                    <AccessTime sx={{ mr: 2 }} />
                                    <ListItemText
                                        primary="Transmission Interval"
                                        secondary={editMode ? (
                                            <TextField
                                                type="number"
                                                size="small"
                                                value={editFormData.transmission_interval || sensor.transmission_interval}
                                                onChange={(e) => setEditFormData(prev => ({
                                                    ...prev,
                                                    transmission_interval: parseInt(e.target.value)
                                                }))}
                                                inputProps={{ min: 60 }}
                                                sx={{ width: 120 }}
                                            />
                                        ) : (
                                            `${sensor.transmission_interval} seconds`
                                        )}
                                    />
                                </ListItem>

                                {(sensor.watershed_zone || editMode) && (
                                    <ListItem>
                                        <ListItemText
                                            primary="Watershed Zone"
                                            secondary={editMode ? (
                                                <TextField
                                                    size="small"
                                                    value={editFormData.watershed_zone || sensor.watershed_zone || ''}
                                                    onChange={(e) => setEditFormData(prev => ({
                                                        ...prev,
                                                        watershed_zone: e.target.value
                                                    }))}
                                                    sx={{ width: 200 }}
                                                />
                                            ) : (
                                                sensor.watershed_zone
                                            )}
                                            sx={{ ml: 4 }}
                                        />
                                    </ListItem>
                                )}

                                {(sensor.river_section || editMode) && (
                                    <ListItem>
                                        <ListItemText
                                            primary="River Section"
                                            secondary={editMode ? (
                                                <TextField
                                                    size="small"
                                                    value={editFormData.river_section || sensor.river_section || ''}
                                                    onChange={(e) => setEditFormData(prev => ({
                                                        ...prev,
                                                        river_section: e.target.value
                                                    }))}
                                                    sx={{ width: 200 }}
                                                />
                                            ) : (
                                                sensor.river_section
                                            )}
                                            sx={{ ml: 4 }}
                                        />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Maintenance Information */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" mb={2}>
                                Maintenance Information
                            </Typography>

                            <List dense>
                                <ListItem>
                                    <ListItemText
                                        primary="Installation Date"
                                        secondary={formatTimestamp(sensor.installation_date)}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemText
                                        primary="Last Maintenance"
                                        secondary={formatTimestamp(sensor.last_maintenance)}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemText
                                        primary="Last Calibration"
                                        secondary={formatTimestamp(sensor.calibration_date)}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemText
                                        primary="Created"
                                        secondary={formatTimestamp(sensor.createdAt)}
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemText
                                        primary="Last Updated"
                                        secondary={formatTimestamp(sensor.updatedAt)}
                                    />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Readings Summary */}
                {sensor.readings && sensor.readings.length > 0 && (
                    <Grid size={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" mb={2}>
                                    Recent Readings (Last 24 Hours)
                                </Typography>

                                <Grid container spacing={2}>
                                    {sensor.readings.slice(0, 5).map((reading, index) => (
                                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                                            <Box border={1} borderColor="grey.300" borderRadius={1} p={2}>
                                                <Typography variant="caption" color="textSecondary">
                                                    {formatTimestamp(reading.timestamp)}
                                                </Typography>

                                                <Grid container spacing={1} mt={1}>
                                                    {reading.water_level !== null && (
                                                        <Grid size={6}>
                                                            <Typography variant="body2">
                                                                <strong>Water Level:</strong><br />
                                                                {reading.water_level?.toFixed(2)} m
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {reading.rainfall !== null && (
                                                        <Grid size={6}>
                                                            <Typography variant="body2">
                                                                <strong>Rainfall:</strong><br />
                                                                {reading.rainfall?.toFixed(2)} mm
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {reading.air_temperature !== null && (
                                                        <Grid size={6}>
                                                            <Typography variant="body2">
                                                                <strong>Temperature:</strong><br />
                                                                {reading.air_temperature?.toFixed(1)} °C
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                    {reading.humidity !== null && (
                                                        <Grid size={6}>
                                                            <Typography variant="body2">
                                                                <strong>Humidity:</strong><br />
                                                                {reading.humidity?.toFixed(1)} %
                                                            </Typography>
                                                        </Grid>
                                                    )}
                                                </Grid>

                                                <Chip
                                                    label={reading.data_quality.toUpperCase()}
                                                    size="small"
                                                    color={reading.data_quality === 'excellent' ? 'success' :
                                                        reading.data_quality === 'good' ? 'primary' :
                                                            reading.data_quality === 'fair' ? 'warning' : 'error'}
                                                    sx={{ mt: 1 }}
                                                />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}

                {/* Sensor Readings Chart */}
                <Grid size={12}>
                    <SensorReadingsChart sensorId={sensorId} sensorName={sensor.name} />
                </Grid>
            </Grid>
        </Box>
    );
};

export default SensorDetailView;