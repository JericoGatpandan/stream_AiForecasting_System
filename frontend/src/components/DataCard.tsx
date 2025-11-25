import React, { useMemo } from 'react';
import { Card, CardContent, Box, Typography, IconButton, Tooltip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import InfoIcon from '@mui/icons-material/Info';

interface DataCardProps {
    title: string;
    value: string | number;
    unit?: string;
    icon?: React.ReactNode;
    color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
    tooltip?: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
    loading?: boolean;
}

const DataCard: React.FC<DataCardProps> = React.memo(({
    title,
    value,
    unit,
    icon,
    color = 'primary',
    tooltip,
    trend,
    trendValue,
    loading = false
}) => {
    const theme = useTheme();

    const trendColor = useMemo(() => {
        switch (trend) {
            case 'up': return theme.palette.success.main;
            case 'down': return theme.palette.error.main;
            case 'stable': return theme.palette.warning.main;
            default: return theme.palette.text.secondary;
        }
    }, [trend, theme.palette]);

    const trendSymbol = useMemo(() => {
        switch (trend) {
            case 'up': return '↗';
            case 'down': return '↘';
            case 'stable': return '→';
            default: return '';
        }
    }, [trend]);

    const labelId = useMemo(() => 
        `${title.replace(/\s+/g, '-').toLowerCase()}-label`,
        [title]
    );

    return (
        <Card
            sx={{
                height: '100%',
                borderLeft: `4px solid ${theme.palette[color].main}`,
                transition: 'box-shadow 0.3s ease-in-out',
                '&:hover': {
                    boxShadow: theme.shadows[4]
                },
                '&:focus-within': {
                    outline: `2px solid ${theme.palette[color].main}`,
                    outlineOffset: '2px'
                }
            }}
            role="region"
            aria-label={`${title} data card`}
            tabIndex={tooltip ? 0 : undefined}
        >
            <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {icon && (
                            <Box sx={{ color: theme.palette[color].main }}>
                                {icon}
                            </Box>
                        )}
                        <Typography 
                            variant="body2" 
                            color="text.secondary" 
                            fontWeight={500}
                            id={labelId}
                        >
                            {title}
                        </Typography>
                    </Box>
                    {tooltip && (
                        <Tooltip title={tooltip} placement="top">
                            <IconButton 
                                size="small" 
                                sx={{ p: 0.5 }}
                                aria-label={`More information about ${title}`}
                                tabIndex={0}
                            >
                                <InfoIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: loading ? theme.palette.text.disabled : 'inherit' }}
                        aria-labelledby={labelId}
                        aria-live={loading ? 'polite' : undefined}
                        role={loading ? 'status' : undefined}
                    >
                        {loading ? '---' : value}
                    </Typography>
                    {unit && !loading && (
                        <Typography variant="body2" color="text.secondary">
                            {unit}
                        </Typography>
                    )}
                </Box>

                {trend && trendValue && !loading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                        <Typography
                            variant="body2"
                            sx={{ color: trendColor, fontWeight: 500 }}
                        >
                            {trendSymbol} {trendValue}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            from last reading
                        </Typography>
                    </Box>
                )}
            </CardContent>
        </Card>
    );
});

DataCard.displayName = 'DataCard';

export default DataCard;
