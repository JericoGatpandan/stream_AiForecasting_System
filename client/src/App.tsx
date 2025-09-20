import { createTheme } from '@mui/material/styles';
// import Map from './pages/Map';
import { useMemo } from 'react';
import { themeSettings } from './theme';
import { CssBaseline, ThemeProvider, Box, styled } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/scenes/sidebar';
import Home from './scenes/home/Home';

const Main = styled('main')(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(2),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: '65px',
  [theme.breakpoints.down('sm')]: {
    marginLeft: '65px',
    padding: theme.spacing(1),
  },
}));

function App() {
  const theme = useMemo(() => createTheme(themeSettings), []);

  return (
    <div className='app'>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box sx={{
            display: 'flex',
            height: '100vh',
            backgroundColor: theme => theme.palette.background.default
          }}>
            <Sidebar />
            <Main>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path='/forecast' element={<div>Forecast</div>} />
                <Route path='/alerts' element={<div>Weather Alerts</div>} />
                <Route path='/analytics' element={<div>Analytics</div>} />
              </Routes>
            </Main>
            {/* <Map /> */}
          </Box>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  )
}

export default App;


