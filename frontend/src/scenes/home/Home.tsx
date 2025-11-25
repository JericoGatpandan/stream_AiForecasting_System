import { useState, Suspense, lazy } from 'react'
import {
    Box,
    Paper,
    Typography,
    Grid,
    Collapse,
    IconButton,
    Tooltip,
    Chip,
    CircularProgress
} from '@mui/material'

// Lazy load the Map component
const Map = lazy(() => import('../map/Map'));
import { useTheme } from '@mui/material/styles'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import DashboardIcon from '@mui/icons-material/Dashboard'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ThermostatIcon from '@mui/icons-material/Thermostat'
import OpacityIcon from '@mui/icons-material/Opacity'
import WaterIcon from '@mui/icons-material/Water'
import WarningIcon from '@mui/icons-material/Warning'
import DataCard from '@/components/DataCard'

function Home() {
    const theme = useTheme();
    const [showDashboard, setShowDashboard] = useState(true);

    // Mock data for summary - in real implementation, you'd get this from API
    const summaryData = {
        totalLocations: 27,
        activeAlerts: 2,
        avgTemperature: 28.5,
        avgHumidity: 78,
        highRiskAreas: 3,
        lastUpdate: new Date().toLocaleTimeString()
    };

    return (
        <Box
            sx={{
                height: '100vh',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 0,
                position: 'relative'
            }}
        >
            {/* Collapsible Dashboard Summary */}
            <Collapse in={showDashboard}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 2,
                        borderRadius: 0,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(24,24,27,0.6)' : 'rgba(255,255,255,0.9)',
                        backdropFilter: 'blur(10px)',
                        position: 'relative',
                        zIndex: 1000
                    }}
                >
                    <Typography
                        variant="h6"
                        fontWeight="bold"
                        color={theme.palette.primary.main}
                        gutterBottom
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                    >
                        <DashboardIcon />
                        System Overview
                        <Chip
                            label={`Updated ${summaryData.lastUpdate}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ ml: 'auto' }}
                        />
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <DataCard
                                title="Monitored Locations"
                                value={summaryData.totalLocations}
                                icon={<LocationOnIcon />}
                                color="primary"
                                tooltip="Total barangays being monitored"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <DataCard
                                title="Active Alerts"
                                value={summaryData.activeAlerts}
                                icon={<WarningIcon />}
                                color="warning"
                                tooltip="Current weather and flood alerts"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <DataCard
                                title="Avg Temperature"
                                value={summaryData.avgTemperature}
                                unit="°C"
                                icon={<ThermostatIcon />}
                                color="secondary"
                                tooltip="Average temperature across all locations"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <DataCard
                                title="Avg Humidity"
                                value={summaryData.avgHumidity}
                                unit="%"
                                icon={<OpacityIcon />}
                                color="info"
                                tooltip="Average humidity level"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
                            <DataCard
                                title="High Risk Areas"
                                value={summaryData.highRiskAreas}
                                icon={<WaterIcon />}
                                color="error"
                                tooltip="Areas with elevated flood risk"
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Collapse>

            {/* Dashboard Toggle Button */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 84,
                    right: 16,
                    zIndex: 1100, // Higher than alerts button
                    display: 'flex',
                    gap: 1,
                    '@media (max-width: 600px)': {
                        top: 84,
                        right: 8,
                    }
                }}
            >
                <Tooltip title={showDashboard ? 'Hide Dashboard' : 'Show System Overview'}>
                    <Paper
                        elevation={3}
                        sx={{
                            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(24,24,27,0.7)' : 'rgba(255,255,255,0.92)',
                            borderRadius: 1,
                            overflow: 'hidden',
                            border: '1px solid',
                            borderColor: 'divider',
                            backdropFilter: 'blur(10px)'
                        }}
                    >
                        <IconButton
                            onClick={() => setShowDashboard(!showDashboard)}
                            color="primary"
                            sx={{ p: 1.5 }}
                        >
                            {showDashboard ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                            <DashboardIcon sx={{ ml: 0.5 }} />
                        </IconButton>
                    </Paper>
                </Tooltip>
            </Box>

            {/* Map Container */}
            <Paper
                elevation={0}
                sx={{
                    p: 0,
                    borderRadius: 0,
                    flexGrow: 1,
                    overflow: 'hidden',
                    position: 'relative'
                }}
            >
                <Box sx={{ height: '100%', width: '100%' }}>
                    <Suspense 
                        fallback={
                            <Box 
                                sx={{ 
                                    display: 'flex', 
                                    justifyContent: 'center', 
                                    alignItems: 'center', 
                                    height: '100%',
                                    flexDirection: 'column',
                                    gap: 2,
                                    color: 'text.secondary'
                                }}
                            >
                                <CircularProgress size={40} />
                                <Typography variant="body2">Loading Map...</Typography>
                            </Box>
                        }
                    >
                        <Map />
                    </Suspense>
                </Box>
            </Paper>

            {/* Status Bar */}
            <Box
                sx={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    zIndex: 1000
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        px: 2,
                        py: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(8px)',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
                    }}
                >
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Real-time monitoring system • {summaryData.totalLocations} locations • Last update: {summaryData.lastUpdate}
                    </Typography>
                </Paper>
            </Box>

            {/* Risk Legend */}
            <Box sx={{ position: 'absolute', bottom: 16, right: 16, zIndex: 1000 }}>
                <Paper elevation={3} sx={{ p: 1.5, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>Risk Legend</Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1, rowGap: 0.5, alignItems: 'center' }}>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: 0.5 }} />
                        <Typography variant="caption">Low</Typography>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#FFC107', borderRadius: 0.5 }} />
                        <Typography variant="caption">Moderate</Typography>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#FF9800', borderRadius: 0.5 }} />
                        <Typography variant="caption">High</Typography>
                        <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: 0.5 }} />
                        <Typography variant="caption">Extreme</Typography>
                    </Box>
                </Paper>
            </Box>
        </Box>
    )
}

export default Home