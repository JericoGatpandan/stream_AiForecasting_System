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
  Cell
} from 'recharts';
import RefreshIcon from '@mui/icons-material/Refresh';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import OpacityIcon from '@mui/icons-material/Opacity';
import AirIcon from '@mui/icons-material/Air';
import WaterIcon from '@mui/icons-material/Water';
import SpeedIcon from '@mui/icons-material/Speed';
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
    <Box sx={{ p: 3, height: '100vh', overflow: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold" color={theme.palette.primary.main}>
          Analytics Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              label="Time Range"
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
          />
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} color="primary">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {(envError || floodError) && (
        <AlertBanner
          severity="error"
          title="Unable to load analytics data"
          message="Please check your connection and try again."
          onClose={() => { }}
        />
      )}

      {/* Key Metrics Overview */}
      <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Current Conditions - {selectedBarangay}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={2.4}>
            <DataCard
              title="Temperature"
              value={envLoading ? '' : latestData?.temperature_c?.toFixed(1) || 'N/A'}
              unit="°C"
              icon={<ThermostatIcon />}
              color="primary"
              loading={envLoading}
              tooltip="Current air temperature"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DataCard
              title="Humidity"
              value={envLoading ? '' : latestData?.humidity_percent?.toFixed(0) || 'N/A'}
              unit="%"
              icon={<OpacityIcon />}
              color="info"
              loading={envLoading}
              tooltip="Relative humidity level"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DataCard
              title="Water Level"
              value={envLoading ? '' : latestData?.water_level_m?.toFixed(2) || 'N/A'}
              unit="m"
              icon={<WaterIcon />}
              color="secondary"
              loading={envLoading}
              tooltip="Current water level measurement"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DataCard
              title="Wind Speed"
              value={envLoading ? '' : latestData?.wind_speed_mps?.toFixed(1) || 'N/A'}
              unit="m/s"
              icon={<AirIcon />}
              color="warning"
              loading={envLoading}
              tooltip="Wind speed measurement"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <DataCard
              title="Flow Velocity"
              value={envLoading ? '' : latestData?.flow_velocity_ms?.toFixed(2) || 'N/A'}
              unit="m/s"
              icon={<SpeedIcon />}
              color="success"
              loading={envLoading}
              tooltip="Water flow velocity"
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Tabbed Charts Section */}
      <Paper elevation={2} sx={{ p: 0, borderRadius: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3, pt: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Environmental Trends" />
            <Tab label="Water & Flow Analysis" />
            <Tab label="Flood Risk Assessment" />
            <Tab label="Weather Patterns" />
          </Tabs>
        </Box>

        {/* Environmental Trends Tab */}
        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Temperature & Humidity Trends
                  </Typography>
                  {envLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="temperature"
                          stroke={theme.palette.primary.main}
                          strokeWidth={2}
                          name="Temperature (°C)"
                        />
                        <Line
                          type="monotone"
                          dataKey="humidity"
                          stroke={theme.palette.info.main}
                          strokeWidth={2}
                          name="Humidity (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Rainfall Distribution
                  </Typography>
                  {envLoading ? (
                    <Skeleton variant="rectangular" height={260} />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={chartData.slice(-12)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar
                          dataKey="rainfall"
                          fill={theme.palette.secondary.main}
                          name="Rainfall (mm)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Water & Flow Analysis Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Water Level Monitoring
                  </Typography>
                  {envLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="waterLevel"
                          stroke={theme.palette.secondary.main}
                          fill={theme.palette.secondary.light}
                          name="Water Level (m)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Flow Velocity Analysis
                  </Typography>
                  {envLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Line
                          type="monotone"
                          dataKey="flowVelocity"
                          stroke={theme.palette.success.main}
                          strokeWidth={2}
                          name="Flow Velocity (m/s)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Flood Risk Assessment Tab */}
        <TabPanel value={tabValue} index={2}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} lg={8}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Flood Depth by Location
                  </Typography>
                  {floodLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={floodRiskData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <RechartsTooltip />
                        <Bar dataKey="value" name="Max Depth (m)" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={4}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Risk Level Distribution
                  </Typography>
                  {floodLoading ? (
                    <Skeleton variant="rectangular" height={260} />
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie
                          data={floodRiskData}
                          dataKey="value"
                          nameKey="riskLevel"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ riskLevel }) => riskLevel}
                        >
                          {floodRiskData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Weather Patterns Tab */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3} sx={{ p: 3 }}>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Wind Speed Patterns
                  </Typography>
                  {envLoading ? (
                    <Skeleton variant="rectangular" height={300} />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis />
                        <RechartsTooltip />
                        <Area
                          type="monotone"
                          dataKey="windSpeed"
                          stroke={theme.palette.warning.main}
                          fill={theme.palette.warning.light}
                          name="Wind Speed (m/s)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Current Wind Direction
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 260 }}>
                    <Typography variant="h4" color="primary">
                      {latestData?.wind_direction || 'N/A'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Analytics;