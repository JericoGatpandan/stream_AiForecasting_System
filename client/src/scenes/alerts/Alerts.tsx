import React from 'react';
import { Box, Paper, Typography, Button, Tabs, Tab } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Alerts() {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = React.useState(0);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
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
            </Box>

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
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="alert tabs">
                        <Tab label="All" id="tab-0" />
                        <Tab label="Alerts" id="tab-1" />
                        <Tab label="Reports" id="tab-2" />
                    </Tabs>
                </Box>

                <Box sx={{ flexGrow: 1, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="h6" color="text.secondary" align="center" sx={{ mt: 4 }}>
                        Full alerts and reports functionality coming soon!
                    </Typography>
                    <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 2 }}>
                        This page will display detailed alerts and reports with filtering capabilities.
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
}

export default Alerts;