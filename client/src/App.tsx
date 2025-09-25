import { Box, styled } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { FloodMonitoringProvider } from './contexts/FloodMonitoringContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/scenes/sidebar';
import Home from './scenes/home/Home';
import Forecast from './scenes/forecast/Forecast';
import Alerts from './scenes/alerts/Alerts';
import Analytics from './scenes/analytics/Analytics';

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
                <Routes>
                  <Route path='/' element={<Home />} />
                  <Route path='/forecast' element={<Forecast />} />
                  <Route path='/alerts' element={<Alerts />} />
                  <Route path='/analytics' element={<Analytics />} />
                </Routes>
              </Main>
            </Box>
          </BrowserRouter>
        </FloodMonitoringProvider>
      </CustomThemeProvider>
    </div>
  )
}

export default App;


