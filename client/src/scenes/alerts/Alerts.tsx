import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Tabs,
    Tab,
    TextField,
    Chip,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Badge,
    Divider,
    InputAdornment,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Stack,
    Collapse
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import SensorIcon from '@mui/icons-material/Sensors';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloudIcon from '@mui/icons-material/Cloud';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useFloodMonitoring } from '../../contexts/FloodMonitoringContext';
import type { FloodAlert, FloodReport } from '../../contexts/FloodMonitoringContext';
import AlertBanner from '../../components/AlertBanner';

function Alerts() {
    const navigate = useNavigate();
    const { alerts, reports, navigateToLocation } = useFloodMonitoring();
    
    const [tabValue, setTabValue] = React.useState(0);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [severityFilter, setSeverityFilter] = React.useState<string>('all');
    const [statusFilter, setStatusFilter] = React.useState<string>('all');
    const [sortBy, setSortBy] = React.useState<'time' | 'severity' | 'location'>('time');
    const [filtersExpanded, setFiltersExpanded] = React.useState(false);
    
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    // Get the most critical alert for the banner
    const criticalAlert = React.useMemo(() => {
        return alerts
            .filter(alert => alert.severity === 'extreme' || alert.severity === 'high')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    }, [alerts]);

    // Filter and sort alerts
    const filteredAlerts = React.useMemo(() => {
        let filtered = alerts.filter(alert => {
            const matchesSearch = alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                alert.message.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSeverity = severityFilter === 'all' || alert.severity === severityFilter;
            return matchesSearch && matchesSeverity;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'time') {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            } else if (sortBy === 'severity') {
                const severityOrder = { 'extreme': 4, 'high': 3, 'moderate': 2, 'low': 1 };
                return severityOrder[b.severity] - severityOrder[a.severity];
            } else {
                return a.location.localeCompare(b.location);
            }
        });
    }, [alerts, searchTerm, severityFilter, sortBy]);

    // Filter and sort reports
    const filteredReports = React.useMemo(() => {
        let filtered = reports.filter(report => {
            const matchesSearch = report.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                report.description.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            if (sortBy === 'time') {
                return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
            } else if (sortBy === 'severity') {
                const statusOrder = { 'critical': 3, 'elevated': 2, 'normal': 1 };
                return statusOrder[b.status] - statusOrder[a.status];
            } else {
                return a.location.localeCompare(b.location);
            }
        });
    }, [reports, searchTerm, statusFilter, sortBy]);

    const getAlertIcon = (alert: FloodAlert) => {
        if (alert.severity === 'extreme') return <ErrorIcon color="error" />;
        if (alert.severity === 'high') return <WarningIcon color="warning" />;
        if (alert.severity === 'moderate') return <AnnouncementIcon color="info" />;
        return <InfoIcon color="action" />;
    };

    const getReportIcon = (report: FloodReport) => {
        if (report.reportType === 'sensor') return <SensorIcon />;
        if (report.reportType === 'visual') return <VisibilityIcon />;
        if (report.reportType === 'rainfall') return <CloudIcon />;
        return <WaterDropIcon />;
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'extreme': return 'error';
            case 'high': return 'warning';
            case 'moderate': return 'info';
            default: return 'default';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'critical': return 'error';
            case 'elevated': return 'warning';
            default: return 'success';
        }
    };

    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleViewOnMap = (location: string, coordinates?: [number, number]) => {
        if (coordinates) {
            navigateToLocation(location, coordinates);
            navigate('/');
        }
    };

    const renderFilterControls = () => (
        <Collapse in={filtersExpanded}>
            <Box sx={{ p: 2, bgcolor: '#f9f9f9', borderRadius: 1, mb: 2 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Severity</InputLabel>
                        <Select
                            value={severityFilter}
                            label="Severity"
                            onChange={(e) => setSeverityFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Severities</MenuItem>
                            <MenuItem value="extreme">Extreme</MenuItem>
                            <MenuItem value="high">High</MenuItem>
                            <MenuItem value="moderate">Moderate</MenuItem>
                            <MenuItem value="low">Low</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={statusFilter}
                            label="Status"
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Statuses</MenuItem>
                            <MenuItem value="critical">Critical</MenuItem>
                            <MenuItem value="elevated">Elevated</MenuItem>
                            <MenuItem value="normal">Normal</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                            value={sortBy}
                            label="Sort By"
                            onChange={(e) => setSortBy(e.target.value as 'time' | 'severity' | 'location')}
                        >
                            <MenuItem value="time">Time</MenuItem>
                            <MenuItem value="severity">Severity</MenuItem>
                            <MenuItem value="location">Location</MenuItem>
                        </Select>
                    </FormControl>
                </Stack>
            </Box>
        </Collapse>
    );

    const renderAlertItem = (alert: FloodAlert) => (
        <ListItem key={alert.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
            <ListItemIcon>
                {getAlertIcon(alert)}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                            {alert.location}
                        </Typography>
                        <Chip
                            label={alert.severity}
                            size="small"
                            color={getSeverityColor(alert.severity) as any}
                            variant="outlined"
                        />
                        <Chip
                            label={alert.type}
                            size="small"
                            variant="filled"
                            sx={{ textTransform: 'capitalize' }}
                        />
                    </Box>
                }
                secondary={
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {alert.message}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(alert.timestamp)}
                            </Typography>
                            {alert.waterLevel && (
                                <Typography variant="caption" color="primary.main">
                                    Water Level: {alert.waterLevel}m
                                </Typography>
                            )}
                            {alert.affectedAreas && alert.affectedAreas.length > 0 && (
                                <Typography variant="caption" color="warning.main">
                                    Affects: {alert.affectedAreas.join(', ')}
                                </Typography>
                            )}
                        </Box>
                    </Box>
                }
            />
            {alert.coordinates && (
                <ListItemSecondaryAction>
                    <Button
                        size="small"
                        startIcon={<LocationOnIcon />}
                        onClick={() => handleViewOnMap(alert.location, alert.coordinates)}
                        variant="outlined"
                    >
                        View on Map
                    </Button>
                </ListItemSecondaryAction>
            )}
        </ListItem>
    );

    const renderReportItem = (report: FloodReport) => (
        <ListItem key={report.id} sx={{ bgcolor: 'background.paper', mb: 1, borderRadius: 1 }}>
            <ListItemIcon>
                {getReportIcon(report)}
            </ListItemIcon>
            <ListItemText
                primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                            {report.location}
                        </Typography>
                        <Chip
                            label={report.status}
                            size="small"
                            color={getStatusColor(report.status) as any}
                            variant="outlined"
                        />
                        <Chip
                            label={report.reportType}
                            size="small"
                            variant="filled"
                            sx={{ textTransform: 'capitalize' }}
                        />
                    </Box>
                }
                secondary={
                    <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {report.description}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <Typography variant="caption" color="text.secondary">
                                {formatTimestamp(report.timestamp)}
                            </Typography>
                            {report.data?.waterLevel && (
                                <Typography variant="caption" color="primary.main">
                                    Water: {report.data.waterLevel}m
                                </Typography>
                            )}
                            {report.data?.flowRate && (
                                <Typography variant="caption" color="info.main">
                                    Flow: {report.data.flowRate}m/s
                                </Typography>
                            )}
                            {report.data?.rainfall && (
                                <Typography variant="caption" color="warning.main">
                                    Rain: {report.data.rainfall}mm
                                </Typography>
                            )}
                        </Box>
                    </Box>
                }
            />
            {report.coordinates && (
                <ListItemSecondaryAction>
                    <Button
                        size="small"
                        startIcon={<LocationOnIcon />}
                        onClick={() => handleViewOnMap(report.location, report.coordinates)}
                        variant="outlined"
                    >
                        View on Map
                    </Button>
                </ListItemSecondaryAction>
            )}
        </ListItem>
    );

    const getTabContent = () => {
        switch (tabValue) {
            case 0: // All
                const allItems = [
                    ...filteredAlerts.map(alert => ({ ...alert, type: 'alert' })),
                    ...filteredReports.map(report => ({ ...report, type: 'report' }))
                ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
                
                return (
                    <List sx={{ width: '100%' }}>
                        {allItems.map((item) => 
                            item.type === 'alert' 
                                ? renderAlertItem(item as FloodAlert)
                                : renderReportItem(item as FloodReport)
                        )}
                        {allItems.length === 0 && (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                                No items found matching your filters
                            </Typography>
                        )}
                    </List>
                );

            case 1: // Alerts
                return (
                    <List sx={{ width: '100%' }}>
                        {filteredAlerts.map(renderAlertItem)}
                        {filteredAlerts.length === 0 && (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                                No alerts found matching your filters
                            </Typography>
                        )}
                    </List>
                );

            case 2: // Reports
                return (
                    <List sx={{ width: '100%' }}>
                        {filteredReports.map(renderReportItem)}
                        {filteredReports.length === 0 && (
                            <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                                No reports found matching your filters
                            </Typography>
                        )}
                    </List>
                );

            default:
                return null;
        }
    };

    return (
        <Box
            sx={{
                height: 'calc(100vh - 100px)',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                p: 2
            }}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate(-1)}
                    variant="outlined"
                >
                    Back to Map
                </Button>
                <Typography variant="h4" fontWeight="bold">
                    Alerts & Reports
                </Typography>
                <Badge badgeContent={alerts.length} color="error" sx={{ ml: 'auto' }}>
                    <Typography variant="body2" color="text.secondary">
                        Active Alerts
                    </Typography>
                </Badge>
            </Box>

            {/* Critical Alert Banner */}
            {criticalAlert && (
                <AlertBanner
                    severity={criticalAlert.severity === 'extreme' ? 'error' : 'warning'}
                    title={`${criticalAlert.type.toUpperCase()}: ${criticalAlert.location}`}
                    message={criticalAlert.message}
                    location={criticalAlert.location}
                    timestamp={formatTimestamp(criticalAlert.timestamp)}
                    action={
                        criticalAlert.coordinates && (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<LocationOnIcon />}
                                onClick={() => handleViewOnMap(criticalAlert.location, criticalAlert.coordinates)}
                                sx={{ color: 'white' }}
                            >
                                View on Map
                            </Button>
                        )
                    }
                />
            )}

            <Paper
                elevation={2}
                sx={{
                    p: 2,
                    borderRadius: 2,
                    flexGrow: 1,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Search and Filter Controls */}
                <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                    <TextField
                        placeholder="Search by location or message..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ flexGrow: 1, minWidth: 200 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            )
                        }}
                    />
                    <IconButton
                        onClick={() => setFiltersExpanded(!filtersExpanded)}
                        color={filtersExpanded ? 'primary' : 'default'}
                        size="small"
                    >
                        <FilterAltIcon />
                        {filtersExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </Box>

                {renderFilterControls()}

                {/* Tabs */}
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="alert tabs">
                        <Tab 
                            label={
                                <Badge badgeContent={alerts.length + reports.length} color="primary">
                                    All
                                </Badge>
                            } 
                            id="tab-0" 
                        />
                        <Tab 
                            label={
                                <Badge badgeContent={alerts.length} color="error">
                                    Alerts
                                </Badge>
                            } 
                            id="tab-1" 
                        />
                        <Tab 
                            label={
                                <Badge badgeContent={reports.length} color="info">
                                    Reports
                                </Badge>
                            } 
                            id="tab-2" 
                        />
                    </Tabs>
                </Box>

                {/* Content */}
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {getTabContent()}
                </Box>
            </Paper>
        </Box>
    );
}

export default Alerts;
