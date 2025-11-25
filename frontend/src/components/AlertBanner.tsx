import React from 'react';
import { Alert, AlertTitle, Box, Chip, IconButton, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AlertBannerProps {
    severity: 'error' | 'warning' | 'info' | 'success';
    title: string;
    message: string;
    location?: string;
    timestamp?: string;
    onClose?: () => void;
    action?: React.ReactNode;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
    severity,
    title,
    message,
    location,
    timestamp,
    onClose,
    action
}) => {

    const getIcon = () => {
        switch (severity) {
            case 'error':
                return <ErrorIcon />;
            case 'warning':
                return <WarningIcon />;
            case 'info':
                return <InfoIcon />;
            case 'success':
                return <CheckCircleIcon />;
            default:
                return <InfoIcon />;
        }
    };

    return (
        <Alert
            severity={severity}
            icon={getIcon()}
            sx={{
                mb: 2,
                borderRadius: 2,
                '& .MuiAlert-message': {
                    width: '100%'
                }
            }}
            action={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {action}
                    {onClose && (
                        <IconButton
                            aria-label="close"
                            color="inherit"
                            size="small"
                            onClick={onClose}
                        >
                            <CloseIcon fontSize="inherit" />
                        </IconButton>
                    )}
                </Box>
            }
        >
            <AlertTitle sx={{ mb: 1 }}>{title}</AlertTitle>
            <Typography variant="body2" sx={{ mb: location || timestamp ? 1 : 0 }}>
                {message}
            </Typography>
            {(location || timestamp) && (
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {location && (
                        <Chip
                            label={location}
                            size="small"
                            variant="outlined"
                            sx={{ backgroundColor: 'transparent' }}
                        />
                    )}
                    {timestamp && (
                        <Chip
                            label={timestamp}
                            size="small"
                            variant="outlined"
                            sx={{ backgroundColor: 'transparent' }}
                        />
                    )}
                </Box>
            )}
        </Alert>
    );
};

export default AlertBanner;