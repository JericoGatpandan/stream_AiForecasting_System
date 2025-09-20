import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Button,
    Slide
} from '@mui/material';
import {
    Close as CloseIcon,
    KeyboardArrowLeft as KeyboardArrowLeftIcon,
    NotificationsActive as NotificationsActiveIcon
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Sample alert data - would be replaced with real data from an API
interface AlertItem {
    id: string;
    type: 'Alert' | 'Report';
    date: string;
    time?: string;
    message: string;
    isAllDay?: boolean;
}

const sampleAlerts: AlertItem[] = [
    {
        id: '1',
        type: 'Alert',
        date: '07 May, 2025',
        message: 'Temperature exceeds 10 °C at Location',
        isAllDay: true
    },
    {
        id: '2',
        type: 'Alert',
        date: '06 May, 2025',
        message: 'Temperature exceeds 10 °C at Location',
        isAllDay: true
    },
    {
        id: '3',
        type: 'Report',
        date: '01 May, 2025',
        time: '16:16',
        message: 'Weather forecast for London'
    },
    {
        id: '4',
        type: 'Report',
        date: '01 May, 2025',
        time: '14:03',
        message: 'Weather forecast for New York'
    },
    {
        id: '5',
        type: 'Report',
        date: '28 Mar, 2025',
        time: '15:18',
        message: 'Weather forecast for Tokyo'
    }
];

interface AlertsPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AlertsPanel = ({ isOpen, onClose }: AlertsPanelProps) => {
    const [filter, setFilter] = useState<'All' | 'Alerts' | 'Reports'>('All');

    // Filter alerts based on selected filter
    const filteredAlerts = sampleAlerts.filter(alert => {
        if (filter === 'All') return true;
        if (filter === 'Alerts') return alert.type === 'Alert';
        if (filter === 'Reports') return alert.type === 'Report';
        return true;
    });

    return (
        <Slide direction="left" in={isOpen} mountOnEnter unmountOnExit>
            <Paper
                elevation={3}
                sx={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '280px',
                    maxHeight: 'calc(100% - 32px)',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    bgcolor: '#212121',
                    color: 'white',
                    zIndex: 10
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 1.5,
                        borderBottom: '1px solid #333'
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold">
                        06 May 2025
                    </Typography>
                    <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                {/* Filter Buttons */}
                <Box
                    sx={{
                        display: 'flex',
                        gap: 1,
                        p: 1.5,
                    }}
                >
                    <Button
                        variant={filter === 'All' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setFilter('All')}
                        sx={{
                            borderRadius: '50px',
                            bgcolor: filter === 'All' ? '#963B32' : 'transparent',
                            borderColor: '#963B32',
                            color: 'white',
                            '&:hover': {
                                bgcolor: filter === 'All' ? '#7F332B' : 'rgba(150, 59, 50, 0.1)',
                            }
                        }}
                    >
                        All
                    </Button>
                    <Button
                        variant={filter === 'Alerts' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setFilter('Alerts')}
                        sx={{
                            borderRadius: '50px',
                            bgcolor: filter === 'Alerts' ? '#963B32' : 'transparent',
                            borderColor: '#963B32',
                            color: 'white',
                            '&:hover': {
                                bgcolor: filter === 'Alerts' ? '#7F332B' : 'rgba(150, 59, 50, 0.1)',
                            }
                        }}
                    >
                        Alerts
                        <Box
                            sx={{
                                ml: 0.5,
                                width: 8,
                                height: 8,
                                bgcolor: '#FF5722',
                                borderRadius: '50%'
                            }}
                        />
                    </Button>
                    <Button
                        variant={filter === 'Reports' ? 'contained' : 'outlined'}
                        size="small"
                        onClick={() => setFilter('Reports')}
                        sx={{
                            borderRadius: '50px',
                            bgcolor: filter === 'Reports' ? '#963B32' : 'transparent',
                            borderColor: '#963B32',
                            color: 'white',
                            '&:hover': {
                                bgcolor: filter === 'Reports' ? '#7F332B' : 'rgba(150, 59, 50, 0.1)',
                            }
                        }}
                    >
                        Reports
                        <Box
                            sx={{
                                ml: 0.5,
                                width: 8,
                                height: 8,
                                bgcolor: '#FF5722',
                                borderRadius: '50%'
                            }}
                        />
                    </Button>
                </Box>

                {/* Alerts List */}
                <List
                    sx={{
                        overflow: 'auto',
                        flexGrow: 1,
                        p: 0
                    }}
                >
                    {filteredAlerts.map((alert, index) => {
                        // Group alerts by date
                        const showDate = index === 0 ||
                            alert.date !== filteredAlerts[index - 1]?.date;

                        return (
                            <Box key={alert.id}>
                                {showDate && (
                                    <Box sx={{ p: 1, pl: 2, bgcolor: '#1A1A1A' }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {alert.date}
                                        </Typography>
                                    </Box>
                                )}
                                <ListItem
                                    sx={{
                                        px: 2,
                                        py: 1.5,
                                        borderBottom: '1px solid #333',
                                        '&:last-child': {
                                            borderBottom: 'none'
                                        }
                                    }}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography
                                                variant="body2"
                                                color={alert.type === 'Alert' ? '#2196F3' : '#4CAF50'}
                                            >
                                                {alert.type}
                                            </Typography>
                                        }
                                        secondary={
                                            <>
                                                <Typography
                                                    component="span"
                                                    variant="body1"
                                                    sx={{ display: 'block', color: 'white', mb: 1 }}
                                                >
                                                    {alert.message}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: 8,
                                                            height: 8,
                                                            bgcolor: '#FF5722',
                                                            borderRadius: '50%',
                                                            mr: 1
                                                        }}
                                                    />
                                                    <Typography
                                                        component="span"
                                                        variant="body2"
                                                        color="text.secondary"
                                                    >
                                                        {alert.isAllDay ? 'All day' : alert.time}
                                                    </Typography>
                                                </Box>
                                            </>
                                        }
                                    />
                                </ListItem>
                            </Box>
                        );
                    })}
                </List>

                {/* Footer with View All link */}
                <Box
                    sx={{
                        p: 1.5,
                        borderTop: '1px solid #333',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
                >
                    <Button
                        component={Link}
                        to="/alerts"
                        variant="text"
                        size="small"
                        sx={{ color: '#2196F3' }}
                    >
                        View All Alerts
                    </Button>
                </Box>
            </Paper>
        </Slide>
    );
};

// Button component to toggle the alerts panel
export const AlertsToggleButton = ({ onClick, isPanelOpen }: { onClick: () => void, isPanelOpen: boolean }) => {
    return (
        <IconButton
            onClick={onClick}
            sx={{
                position: 'absolute',
                top: '16px',
                right: isPanelOpen ? '300px' : '16px',
                zIndex: 10,
                bgcolor: isPanelOpen ? 'transparent' : 'rgba(33, 33, 33, 0.8)',
                color: 'white',
                transition: 'right 0.3s ease',
                '&:hover': {
                    bgcolor: isPanelOpen ? 'transparent' : 'rgba(33, 33, 33, 0.9)',
                }
            }}
        >
            {isPanelOpen ? (
                <KeyboardArrowLeftIcon fontSize="medium" />
            ) : (
                <NotificationsActiveIcon fontSize="medium" />
            )}
        </IconButton>
    );
};

export default AlertsPanel;