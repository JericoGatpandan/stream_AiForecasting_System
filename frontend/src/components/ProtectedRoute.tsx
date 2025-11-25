import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useGetMeQuery } from '@/state/api';
import { Box, CircularProgress } from '@mui/material';

const ProtectedRoute = () => {
  const location = useLocation();
  const { data, isLoading } = useGetMeQuery();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;


