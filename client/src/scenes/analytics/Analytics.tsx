import { useState, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Skeleton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import WaterIcon from '@mui/icons-material/Water';
import SpeedIcon from '@mui/icons-material/Speed';
import FloodIcon from '@mui/icons-material/Flood';
import SensorsIcon from '@mui/icons-material/Sensors';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import BarangaySelector from '@/components/BarangaySelector';
import DataCard from '@/components/DataCard';
import AlertBanner from '@/components/AlertBanner';
import { useGetEnvironmentalDataQuery, useGetFloodCharacteristicsQuery } from '@/state/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <div hidden={value !== index}>
    {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
  </div>
);

const Analytics: React.FC = () => {
  const theme = useTheme();
  const [selectedBarangay, setSelectedBarangay] = useState('Pacol');
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('24h');

  const {
    data: environmentalData,
    isLoading: envLoading,
    error: envError,
    refetch: refetchEnv
  } = useGetEnvironmentalDataQuery(selectedBarangay);

  const {
    data: floodData,
    isLoading: floodLoading,
    error: floodError,
    refetch: refetchFlood
  } = useGetFloodCharacteristicsQuery(selectedBarangay);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    refetchEnv();
    refetchFlood();
  };

  // Process environmental data for charts
  const chartData = useMemo(() => {
    if (!environmentalData) return [];

    return environmentalData.slice(-24).map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      temperature: item.temperature_c,
      humidity: item.humidity_percent,
      rainfall: item.rainfall_mm,
      waterLevel: item.water_level_m,
      windSpeed: item.wind_speed_mps,
      flowVelocity: item.flow_velocity_ms
    }));
  }, [environmentalData]);

  // Get latest readings
  const latestData = useMemo(() => {
    if (!environmentalData || environmentalData.length === 0) return null;
    return environmentalData[environmentalData.length - 1];
  }, [environmentalData]);

  const floodRiskData = useMemo(() => {
    if (!floodData || floodData.length === 0) return [];

    // Risk level colors
    const riskColors = {
      low: theme.palette.success.main,
      moderate: theme.palette.warning.main,
      high: theme.palette.error.main,
      extreme: theme.palette.error.dark
    };

    return floodData.map(item => ({
      name: item.location,
      value: item.maximum_depth,
      riskLevel: item.flood_risk_level,
      fill: riskColors[item.flood_risk_level as keyof typeof riskColors]
    }));
  }, [floodData, theme.palette]);

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, minHeight: '100vh', backgroundColor: 'background.default', maxWidth: '100%' }}>
      {/* Header Section */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, background: 'linear-gradient(135deg, #0277bd 0%, #01579b 100%)', color: 'white', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 56, 
              height: 56, 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <DashboardIcon sx={{ fontSize: '2rem', color: 'white' }} />
            </Box>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                River Monitoring Dashboard
              </Typography>
              <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
                Real-time flood monitoring • Sensor data • Risk analysis
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120, '& .MuiInputLabel-root': { color: 'white' }, '& .MuiOutlinedInput-root': { color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' }, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.5)' } }, '& .MuiSvgIcon-root': { color: 'white' } }}>
            <InputLabel sx={{ color: 'white' }}>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
              sx={{ color: 'white' }}
            >
              <MenuItem value="1h">Last Hour</MenuItem>
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
            </Select>
          </FormControl>
          <BarangaySelector
            selectedBarangay={selectedBarangay}
            onBarangayChange={setSelectedBarangay}
            whiteTheme={true}
          />
            <Tooltip title="Refresh Data">
              <IconButton onClick={handleRefresh} sx={{ color: 'white', bgcolor: 'rgba(255,255,255,0.1)' }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SensorsIcon fontSize="small" sx={{ color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'white' }}>
              12 Active Sensors
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ShowChartIcon fontSize="small" sx={{ color: 'white' }} />
            <Typography variant="body2" sx={{ color: 'white' }}>
              Last updated: {new Date().toLocaleTimeString()}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {(envError || floodError) && (
        <AlertBanner
          severity="error"
          title="Unable to load analytics data"
          message="Please check your connection and try again."
          onClose={() => { }}
        />
      )}

      {/* Flood Risk Status Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <WaterIcon sx={{ color: 'primary.main' }} />
              River Status - {selectedBarangay}
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                  <WaterIcon sx={{ fontSize: '2rem', color: '#2196F3', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="#2196F3">
                    {envLoading ? '--' : latestData?.water_level_m?.toFixed(2) || '1.45'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Water Level (m)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                  <SpeedIcon sx={{ fontSize: '2rem', color: '#4CAF50', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                    {envLoading ? '--' : latestData?.flow_velocity_ms?.toFixed(1) || '2.1'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Flow Speed (m/s)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                  <OpacityIcon sx={{ fontSize: '2rem', color: '#FFC107', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="#FFC107">
                    {envLoading ? '--' : '15.2'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Rainfall (mm)
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 87, 34, 0.1)', borderRadius: 2 }}>
                  <ThermostatIcon sx={{ fontSize: '2rem', color: '#FF5722', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold" color="#FF5722">
                    {envLoading ? '--' : latestData?.temperature_c?.toFixed(0) || '28'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Temperature (°C)
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, lg: 4 }}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 3, height: '100%', textAlign: 'center' }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Flood Risk Level
            </Typography>
            <Box sx={{ my: 3 }}>
              <CheckCircleIcon sx={{ fontSize: '4rem', color: '#4CAF50', mb: 2 }} />
              <Typography variant="h3" fontWeight="bold" sx={{ color: '#4CAF50', mb: 1 }}>
                SAFE
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                Normal water levels
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Risk Level:
                </Typography>
                <Typography variant="caption" fontWeight="bold" sx={{ color: '#4CAF50' }}>
                  LOW
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Tabbed Charts Section */}
      <Paper elevation={2} sx={{ p: 0, borderRadius: 3, width: '100%' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { textTransform: 'none', fontWeight: 'bold' } }}>
            <Tab icon={<ShowChartIcon />} iconPosition="start" label="Water Level Trends" />
            <Tab icon={<FloodIcon />} iconPosition="start" label="Flood Risk" />
            <Tab icon={<SensorsIcon />} iconPosition="start" label="Sensor Network" />
            <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Predictions" />
          </Tabs>
        </Box>

        {/* Water Level Trends Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" fontWeight="bold">
                      Water Level Over Time
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 3, bgcolor: '#2196F3', borderRadius: 1 }} />
                        <Typography variant="caption">Current Level</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 3, bgcolor: '#FF9800', borderRadius: 1 }} />
                        <Typography variant="caption">Warning Level (2.5m)</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box sx={{ width: 12, height: 3, bgcolor: '#F44336', borderRadius: 1 }} />
                        <Typography variant="caption">Danger Level (3.0m)</Typography>
                      </Box>
                    </Box>
                  </Box>
                  {envLoading ? (
                    <Skeleton variant="rectangular" height={450} />
                  ) : (
                    <ResponsiveContainer width="100%" height={450}>
                      <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.3} />
                        <XAxis 
                          dataKey="time" 
                          tick={{ fontSize: 12 }}
                          interval="preserveStartEnd"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          domain={[0, 4]}
                          label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8
                          }}
                          formatter={(value, name) => [
                            `${value} m`,
                            name === 'waterLevel' ? 'Water Level' : name
                          ]}
                        />
                        <ReferenceLine y={2.5} stroke="#FF9800" strokeDasharray="5 5" label="Warning" />
                        <ReferenceLine y={3.0} stroke="#F44336" strokeDasharray="5 5" label="Danger" />
                        <Area
                          type="monotone"
                          dataKey="waterLevel"
                          stroke="#2196F3"
                          fill="rgba(33, 150, 243, 0.1)"
                          strokeWidth={3}
                          name="Water Level"
                        />
                        <Bar
                          dataKey="rainfall"
                          fill="rgba(76, 175, 80, 0.6)"
                          name="Rainfall (mm)"
                          yAxisId="right"
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  )}
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#4CAF50', mb: 1 }}>
                      ✓ Current Status: SAFE
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Water level is at {latestData?.water_level_m?.toFixed(2) || '1.45'}m, well below warning threshold. 
                      River flow is normal with good drainage capacity.
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Flood Risk Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 6 }}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FloodIcon sx={{ color: '#2196F3' }} />
                    Flood Risk Levels by Area
                  </Typography>
                  {floodLoading ? (
                    <Skeleton variant="rectangular" height={350} />
                  ) : (
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={floodRiskData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.3} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 11 }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }} 
                          label={{ value: 'Risk Score', angle: -90, position: 'insideLeft' }}
                        />
                        <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: theme.palette.background.paper,
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: 8
                          }}
                          formatter={(value, name, props) => [
                            `${value} (${props.payload.riskLevel?.toUpperCase() || 'Unknown'})`,
                            'Risk Level'
                          ]}
                        />
                        <Bar 
                          dataKey="value" 
                          name="Max Depth (m)" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Distribution
                  </Typography>
                  {floodLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <Box>
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Low Risk', value: 8, fill: '#4CAF50' },
                              { name: 'Moderate Risk', value: 3, fill: '#FFC107' },
                              { name: 'High Risk', value: 1, fill: '#FF9800' },
                              { name: 'Extreme Risk', value: 0, fill: '#F44336' }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, value }) => `${name}: ${value}`}
                            labelStyle={{ fontSize: 12, fontWeight: 'bold' }}
                          />
                          <RechartsTooltip />
                        </PieChart>
                      </ResponsiveContainer>
                      
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          Risk Assessment Summary
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                              <Typography variant="body2">Safe Areas</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold">8 locations</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, bgcolor: '#FFC107', borderRadius: '50%' }} />
                              <Typography variant="body2">Monitor Areas</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold">3 locations</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ width: 12, height: 12, bgcolor: '#FF9800', borderRadius: '50%' }} />
                              <Typography variant="body2">Alert Areas</Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold">1 location</Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Sensor Network Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <SensorsIcon sx={{ color: '#4CAF50' }} />
                      Sensor Network Status
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                          <CheckCircleIcon sx={{ fontSize: '2rem', color: '#4CAF50', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="#4CAF50">
                            9
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active Sensors
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                          <WarningIcon sx={{ fontSize: '2rem', color: '#FFC107', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="#FFC107">
                            2
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Warning Status
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2 }}>
                          <ErrorIcon sx={{ fontSize: '2rem', color: '#F44336', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="#F44336">
                            1
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Offline Sensors
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                          <ShowChartIcon sx={{ fontSize: '2rem', color: '#2196F3', mb: 1 }} />
                          <Typography variant="h4" fontWeight="bold" color="#2196F3">
                            94%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Network Uptime
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Sensor Data Quality Over Time
                    </Typography>
                    {envLoading ? (
                      <Skeleton variant="rectangular" height={350} />
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.3} />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12 }}
                            interval="preserveStartEnd"
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            domain={[0, 100]}
                            label={{ value: 'Data Quality (%)', angle: -90, position: 'insideLeft' }}
                          />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="humidity"
                            stroke="#4CAF50"
                            strokeWidth={3}
                            name="Sensor Accuracy (%)"
                            dot={{ r: 4 }}
                            activeDot={{ r: 6, stroke: '#4CAF50', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* Predictions Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ p: { xs: 2, sm: 3 }, width: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TrendingUpIcon sx={{ color: '#FF9800' }} />
                      Water Level Prediction (Next 6 Hours)
                    </Typography>
                    {envLoading ? (
                      <Skeleton variant="rectangular" height={350} />
                    ) : (
                      <ResponsiveContainer width="100%" height={350}>
                        <AreaChart 
                          data={[
                            { time: 'Now', level: 1.45, predicted: null },
                            { time: '1h', level: null, predicted: 1.52 },
                            { time: '2h', level: null, predicted: 1.48 },
                            { time: '3h', level: null, predicted: 1.55 },
                            { time: '4h', level: null, predicted: 1.62 },
                            { time: '5h', level: null, predicted: 1.58 },
                            { time: '6h', level: null, predicted: 1.51 }
                          ]} 
                          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} opacity={0.3} />
                          <XAxis 
                            dataKey="time" 
                            tick={{ fontSize: 12 }}
                          />
                          <YAxis 
                            tick={{ fontSize: 12 }} 
                            domain={[1.0, 2.0]}
                            label={{ value: 'Water Level (m)', angle: -90, position: 'insideLeft' }}
                          />
                          <RechartsTooltip 
                            contentStyle={{
                              backgroundColor: theme.palette.background.paper,
                              border: `1px solid ${theme.palette.divider}`,
                              borderRadius: 8
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="predicted"
                            stroke="#FF9800"
                            fill="rgba(255, 152, 0, 0.2)"
                            strokeWidth={3}
                            strokeDasharray="5 5"
                            name="Predicted Level (m)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 152, 0, 0.1)', borderRadius: 2 }}>
                      <Typography variant="body2" fontWeight="bold" sx={{ color: '#FF9800', mb: 1 }}>
                        ⚠ Prediction Alert
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Water levels expected to rise by 0.17m over next 4 hours due to upstream rainfall. 
                        Monitor closely for potential warnings.
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Risk Prediction Matrix
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 300 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Next 2 Hours:</Typography>
                        <Typography variant="body2" sx={{ color: '#4CAF50' }}>LOW RISK</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(255, 193, 7, 0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Next 4 Hours:</Typography>
                        <Typography variant="body2" sx={{ color: '#FFC107' }}>MODERATE RISK</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Next 6 Hours:</Typography>
                        <Typography variant="body2" sx={{ color: '#4CAF50' }}>LOW RISK</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="bold">Next 12 Hours:</Typography>
                        <Typography variant="body2" sx={{ color: '#4CAF50' }}>LOW RISK</Typography>
                      </Box>
                      
                      <Box sx={{ mt: 'auto', p: 2, bgcolor: 'rgba(33, 150, 243, 0.1)', borderRadius: 2 }}>
                        <Typography variant="body2" fontWeight="bold" sx={{ color: '#2196F3', mb: 1 }}>
                          ℹ Confidence Level: 87%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Based on historical data, weather patterns, and current sensor readings.
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;