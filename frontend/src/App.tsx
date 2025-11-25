import { Box, styled, CircularProgress } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { FloodMonitoringProvider } from './contexts/FloodMonitoringContext';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from '@/scenes/sidebar';
import ProtectedRoute from '@/components/ProtectedRoute';

// Lazy load route components for code splitting
const Home = lazy(() => import('./scenes/home/Home'));
const Forecast = lazy(() => import('./scenes/forecast/Forecast'));
const Alerts = lazy(() => import('./scenes/alerts/Alerts'));
const Analytics = lazy(() => import('./scenes/analytics/Analytics'));
const Landing = lazy(() => import('./scenes/landing/Landing'));
const Login = lazy(() => import('./scenes/auth/Login'));
const Register = lazy(() => import('./scenes/auth/Register'));

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

function AppShell() {
  const location = useLocation();
  const publicRoutes = ['/', '/login', '/register'];
  const isPublic = publicRoutes.includes(location.pathname);
  return (
    <div className='app'>
      <ErrorBoundary>
        <CustomThemeProvider>
          <FloodMonitoringProvider>
              <Box sx={{
                display: 'flex',
                height: '100vh',
                backgroundColor: theme => theme.palette.background.default
              }}>
                {!isPublic && <Sidebar />}
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
                        <Route path='/' element={<Landing />} />
                        <Route path='/login' element={<Login />} />
                        <Route path='/register' element={<Register />} />

                        <Route element={<ProtectedRoute />}>
                          <Route path='/home' element={<Home />} />
                          <Route path='/forecast' element={<Forecast />} />
                          <Route path='/alerts' element={<Alerts />} />
                          <Route path='/analytics' element={<Analytics />} />
                        </Route>

                      </Routes>
                    </Suspense>
                  </ErrorBoundary>
                </Main>
              </Box>
          </FloodMonitoringProvider>
        </CustomThemeProvider>
      </ErrorBoundary>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;


