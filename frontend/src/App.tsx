import { Box, styled, CircularProgress, AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { FloodMonitoringProvider } from './contexts/FloodMonitoringContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, useState } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Map from './scenes/map/Map';
import MenuIcon from '@mui/icons-material/Menu';
import MapIcon from '@mui/icons-material/Map';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AlertsPanel from './scenes/map/AlertsPanel';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
    padding: 0,
  },
}));

function AppShell() {
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <div className='app'>
      <ErrorBoundary>
        <CustomThemeProvider>
          <FloodMonitoringProvider>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100vh',
                backgroundColor: (theme) => theme.palette.background.default,
              }}
            >
              <AppBar
                position="static"
                color="transparent"
                elevation={0}
                sx={(theme) => ({
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  background: theme.palette.mode === 'dark'
                    ? 'rgba(15,23,42,0.95)'
                    : 'rgba(255,255,255,0.95)',
                  backdropFilter: 'blur(12px)',
                  zIndex: (t) => t.zIndex.drawer + 1,
                })}
              >
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon color="primary" />
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      STREAM Flood Monitoring
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Map
                    </Typography>
                    <IconButton
                      size="small"
                      color={alertsOpen ? 'primary' : 'default'}
                      onClick={() => setAlertsOpen((prev) => !prev)}
                    >
                      <NotificationsActiveIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" edge="end" color="inherit">
                      <MenuIcon />
                    </IconButton>
                  </Box>
                </Toolbar>
              </AppBar>

              <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                <Main>
                  <ErrorBoundary>
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
                          }}
                        >
                          <CircularProgress size={40} />
                          <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                            Loading map...
                          </Box>
                        </Box>
                      }
                    >
                      <Routes>
                        <Route path='/' element={<Map />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Main>

                {/* Global alerts panel anchored over map */}
                <AlertsPanel isOpen={alertsOpen} onClose={() => setAlertsOpen(false)} />
              </Box>
            </Box>
          </FloodMonitoringProvider>
        </CustomThemeProvider>
      </ErrorBoundary>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
