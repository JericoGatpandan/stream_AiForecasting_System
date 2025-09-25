import { Box, Paper, Typography, Chip, IconButton, Tooltip, Skeleton } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WaterIcon from '@mui/icons-material/Water';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useGetEnvironmentalDataQuery, useGetFloodCharacteristicsQuery } from '@/state/api';

interface MapDataOverlayProps {
    selectedLocation?: string;
}

const MapDataOverlay: React.FC<MapDataOverlayProps> = ({ selectedLocation = 'Pacol' }) => {
    const theme = useTheme();
    const [isVisible, setIsVisible] = useState(true);

    const {
        data: environmentalData,
        isLoading: envLoading
    } = useGetEnvironmentalDataQuery(selectedLocation);

    const {
        data: floodData,
        isLoading: floodLoading
    } = useGetFloodCharacteristicsQuery(selectedLocation);

    // Get latest environmental data
    const latestData = environmentalData && environmentalData.length > 0 ? environmentalData[environmentalData.length - 1] : null;
    const latestFloodData = floodData && floodData.length > 0 ? floodData[0] : null;

    const getRiskColor = (level?: string) => {
        switch (level) {
            case 'low': return theme.palette.success.main;
            case 'moderate': return theme.palette.warning.main;
            case 'high': return theme.palette.error.main;
            case 'extreme': return theme.palette.error.dark;
            default: return theme.palette.text.secondary;
        }
    };

    if (!isVisible) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 60,
                    right: 16,
                    zIndex: 1000
                }}
            >
                <Tooltip title="Show Data Panel">
                    <IconButton
                        onClick={() => setIsVisible(true)}
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            '&:hover': {
                                backgroundColor: theme.palette.background.paper,
                                opacity: 0.8
                            }
                        }}
                    >
                        <VisibilityIcon />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    }

    if (envLoading || floodLoading) {
        return (
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 60,
                    right: 16,
                    zIndex: 1000,
                    maxWidth: 280
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        p: 2,
                        backgroundColor: theme.palette.background.overlay,
                        borderRadius: 2
                    }}
                >
                    <Skeleton variant="text" width="60%" height={24} />
                    <Skeleton variant="text" width="80%" height={20} sx={{ mt: 1 }} />
                    <Skeleton variant="text" width="70%" height={20} />
                    <Skeleton variant="text" width="90%" height={20} />
                    <Skeleton variant="rectangular" width="100%" height={32} sx={{ mt: 1, borderRadius: 1 }} />
                </Paper>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                position: 'absolute',
                bottom: 60,
                right: 16,
                zIndex: 1000,
                maxWidth: 280
            }}
        >
            <Paper
                elevation={3}
                sx={{
                    p: 2,
                    backgroundColor: theme.palette.background.overlay,
                    borderRadius: 2
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                        {selectedLocation}
                    </Typography>
                    <Tooltip title="Hide Panel">
                        <IconButton
                            size="small"
                            onClick={() => setIsVisible(false)}
                            sx={{ p: 0.5 }}
                        >
                            <VisibilityOffIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <ThermostatIcon fontSize="small" color="primary" />
                        <Typography variant="body2">
                            {latestData?.temperature_c?.toFixed(1) || '--'}°C
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <OpacityIcon fontSize="small" color="info" />
                        <Typography variant="body2">
                            {latestData?.humidity_percent?.toFixed(0) || '--'}% humidity
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <WaterIcon fontSize="small" color="secondary" />
                        <Typography variant="body2">
                            {latestData?.water_level_m?.toFixed(2) || '--'}m water level
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                        <Chip
                            label={`${(latestFloodData?.flood_risk_level || 'Unknown').toUpperCase()} RISK`}
                            size="small"
                            sx={{
                                backgroundColor: getRiskColor(latestFloodData?.flood_risk_level),
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        />
                        <Typography variant="caption" color="text.secondary">
                            Updated {latestData ? new Date(latestData.timestamp).toLocaleTimeString() : '--:--'}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default MapDataOverlay;