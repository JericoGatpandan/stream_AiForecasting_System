import { Box, styled } from '@mui/material';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/scenes/sidebar';
import Home from './scenes/home/Home';

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
                <Route path='/forecast' element={<div>Forecast</div>} />
                <Route path='/alerts' element={<div>Weather Alerts</div>} />
                <Route path='/analytics' element={<div>Analytics</div>} />
              </Routes>
            </Main>
          </Box>
        </BrowserRouter>
      </CustomThemeProvider>
    </div>
  )
}

export default App;


