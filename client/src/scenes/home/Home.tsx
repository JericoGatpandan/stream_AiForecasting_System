import { useState } from 'react'
import Map from '../map/Map'
import {
    Box,
    Paper,
    Typography,
    Grid,
    Collapse,
    IconButton,
    Tooltip,
    Chip
} from '@mui/material'
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
    const [showDashboard, setShowDashboard] = useState(false);

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
                    elevation={2}
                    sx={{
                        p: 2,
                        borderRadius: 0,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        backgroundColor: theme.palette.background.paper,
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
                        <Grid item xs={12} sm={6} md={2.4}>
                            <DataCard
                                title="Monitored Locations"
                                value={summaryData.totalLocations}
                                icon={<LocationOnIcon />}
                                color="primary"
                                tooltip="Total barangays being monitored"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <DataCard
                                title="Active Alerts"
                                value={summaryData.activeAlerts}
                                icon={<WarningIcon />}
                                color="warning"
                                tooltip="Current weather and flood alerts"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <DataCard
                                title="Avg Temperature"
                                value={summaryData.avgTemperature}
                                unit="°C"
                                icon={<ThermostatIcon />}
                                color="secondary"
                                tooltip="Average temperature across all locations"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <DataCard
                                title="Avg Humidity"
                                value={summaryData.avgHumidity}
                                unit="%"
                                icon={<OpacityIcon />}
                                color="info"
                                tooltip="Average humidity level"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
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
                    top: showDashboard ? 'auto' : 16,
                    right: 16,
                    zIndex: 1100, // Higher than alerts button
                    display: 'flex',
                    gap: 1,
                    '@media (max-width: 600px)': {
                        top: showDashboard ? 'auto' : 8,
                        right: 8,
                    }
                }}
            >
                <Tooltip title={showDashboard ? 'Hide Dashboard' : 'Show System Overview'}>
                    <Paper
                        elevation={3}
                        sx={{
                            backgroundColor: theme.palette.background.paper,
                            borderRadius: 1,
                            overflow: 'hidden'
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
                    <Map />
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
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
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
        </Box>
    )
}

export default Home