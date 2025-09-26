import { Box, styled, CircularProgress } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { FloodMonitoringProvider } from './contexts/FloodMonitoringContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from '@/scenes/sidebar';

// Lazy load route components for code splitting
const Home = lazy(() => import('./scenes/home/Home'));
const Forecast = lazy(() => import('./scenes/forecast/Forecast'));
const Alerts = lazy(() => import('./scenes/alerts/Alerts'));
const Analytics = lazy(() => import('./scenes/analytics/Analytics'));

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: 0,
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

function App() {
  return (
    <div className='app'>
      <ErrorBoundary>
        <CustomThemeProvider>
          <FloodMonitoringProvider>
            <BrowserRouter>
              <Box sx={{
                display: 'flex',
                height: '100vh',
                backgroundColor: theme => theme.palette.background.default
              }}>
                <Sidebar />
                <Main>
                  <ErrorBoundary>
                    <Suspense fallback={
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'center', 
                          alignItems: 'center', 
                          height: '100vh',
                          flexDirection: 'column',
                          gap: 2
                        }}
                      >
                        <CircularProgress size={40} />
                        <Box sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
                          Loading...
                        </Box>
                      </Box>
                    }>
                      <Routes>
                        <Route path='/' element={<Home />} />
                        <Route path='/forecast' element={<Forecast />} />
                        <Route path='/alerts' element={<Alerts />} />
                        <Route path='/analytics' element={<Analytics />} />
                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Main>
              </Box>
            </BrowserRouter>
          </FloodMonitoringProvider>
        </CustomThemeProvider>
      </ErrorBoundary>
    </div>
  )
}

export default App;


