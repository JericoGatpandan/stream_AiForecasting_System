import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    ToggleButtonGroup,
    ToggleButton,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    Collapse,
    IconButton,
    Chip,
    styled,
    Tooltip
} from '@mui/material';
import {
    Sensors as SensorsIcon,
    ExpandLess,
    ExpandMore,
    LocationOn,
    SignalCellularAlt
} from '@mui/icons-material';
import type { Sensor } from './weatherData';
import { sampleSensors } from './weatherData';

type DataDisplayType = 'sensors' | 'alerts' | 'reports';

const StyledDataControlPanel = styled(Paper)(({ theme }) => ({
    position: 'absolute',
    bottom: '60px', // Moved up to avoid status bar overlap
    left: '16px',
    zIndex: 1010, // Updated z-index
    padding: theme.spacing(1),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    borderRadius: theme.spacing(1),
    maxWidth: '320px',
    maxHeight: 'calc(100% - 160px)', // Adjusted for new bottom position
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    [theme.breakpoints.down('sm')]: {
        maxWidth: '280px',
        bottom: '50px',
        left: '8px'
    },
    [theme.breakpoints.down('xs')]: {
        maxWidth: 'calc(100vw - 32px)',
        left: '16px',
        bottom: '40px'
    }
}));

interface WeatherDataDisplayProps {
    onSensorSelect?: (sensorId: string, coordinates: [number, number]) => void;
}

const WeatherDataDisplay = ({ onSensorSelect }: WeatherDataDisplayProps) => {
    const [displayType, setDisplayType] = useState<DataDisplayType>('sensors');
    const [isExpanded, setIsExpanded] = useState(false);

    const handleDisplayTypeChange = (_: React.MouseEvent<HTMLElement>, newType: DataDisplayType | null) => {
        if (newType !== null) {
            setDisplayType(newType);
        }
    };

    const handleToggleExpand = () => {
        setIsExpanded(!isExpanded);
    };

    const handleSensorClick = (sensor: Sensor) => {
        if (onSensorSelect) {
            onSensorSelect(sensor.id, [sensor.lng, sensor.lat]);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return '#4CAF50';
            case 'warning': return '#FFC107';
            case 'error': return '#F44336';
            default: return '#9E9E9E';
        }
    };

    const renderContent = () => {
        switch (displayType) {
            case 'sensors':
                return (
                    <List dense sx={{ overflowY: 'auto', maxHeight: '300px' }}>
                        {sampleSensors.map((sensor) => (
                            <ListItem
                                key={sensor.id}
                                component="div"
                                onClick={() => handleSensorClick(sensor)}
                                sx={{
                                    borderLeft: `3px solid ${getStatusColor(sensor.status)}`,
                                    mb: 0.5,
                                    borderRadius: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                    }
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: getStatusColor(sensor.status) }}>
                                        <LocationOn />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" fontWeight="medium">
                                            {sensor.name}
                                        </Typography>
                                    }
                                    // Using disableTypography to prevent the default <Typography> wrapper
                                    disableTypography
                                    secondary={
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                component="span"
                                            >
                                                Barangay: {sensor.barangay}
                                            </Typography>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <Chip
                                                    size="small"
                                                    label={`${sensor.readings.temperature}°C`}
                                                    sx={{
                                                        height: 20,
                                                        '& .MuiChip-label': { px: 1, fontSize: '0.625rem' },
                                                        bgcolor: 'rgba(255, 112, 67, 0.1)',
                                                        border: '1px solid rgba(255, 112, 67, 0.3)'
                                                    }}
                                                />
                                                <Chip
                                                    size="small"
                                                    label={`${sensor.readings.rainfall}mm`}
                                                    sx={{
                                                        height: 20,
                                                        '& .MuiChip-label': { px: 1, fontSize: '0.625rem' },
                                                        bgcolor: 'rgba(41, 182, 246, 0.1)',
                                                        border: '1px solid rgba(41, 182, 246, 0.3)'
                                                    }}
                                                />
                                                <Chip
                                                    size="small"
                                                    label={`${sensor.readings.wind_speed}km/h`}
                                                    sx={{
                                                        height: 20,
                                                        '& .MuiChip-label': { px: 1, fontSize: '0.625rem' },
                                                        bgcolor: 'rgba(139, 195, 74, 0.1)',
                                                        border: '1px solid rgba(139, 195, 74, 0.3)'
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    }
                                />
                                <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                                    <Tooltip title="Signal Strength">
                                        <SignalCellularAlt fontSize="small" sx={{ color: getStatusColor(sensor.status) }} />
                                    </Tooltip>
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                );
            // case 'alerts':
            //     return (
            //         <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
            //             Alert data will be populated from backend API.
            //         </Typography>
            //     );
            // case 'reports':
            //     return (
            //         <Typography variant="body2" sx={{ p: 2, color: 'text.secondary' }}>
            //             Report data will be populated from backend API.
            //         </Typography>
            //     );
            default:
                return null;
        }
    };

    return (
        <StyledDataControlPanel elevation={3}>
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
            }}>
                <Typography variant="subtitle1" fontWeight="medium">
                    Weather Data
                </Typography>
                <IconButton
                    size="small"
                    onClick={handleToggleExpand}
                    sx={{ p: 0.5 }}
                >
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
            </Box>

            <ToggleButtonGroup
                value={displayType}
                exclusive
                onChange={handleDisplayTypeChange}
                size="small"
                sx={{ mb: isExpanded ? 1 : 0 }}

            >
                <ToggleButton value="sensors">
                    <SensorsIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Sensors
                </ToggleButton>
                {/* <ToggleButton value="alerts">
                    <AlertsIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Alerts
                </ToggleButton>
                <ToggleButton value="reports">
                    <ReportsIcon fontSize="small" sx={{ mr: 0.5 }} />
                    Reports
                </ToggleButton> */}
            </ToggleButtonGroup>

            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                {renderContent()}
            </Collapse>
        </StyledDataControlPanel>
    );
};

export default WeatherDataDisplay;