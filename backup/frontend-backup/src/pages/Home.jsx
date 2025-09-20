import React, { useState, useEffect } from 'react';
import { Cloud, Thermometer, Droplets, Wind, Eye, AlertTriangle, MapPin, TrendingUp, Calendar, Bell } from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { format } from 'date-fns';
import { useNavigate } from "react-router-dom";
import FloodCharacteristics from '../components/FloodCharacteristics';
import CityWideView from '../components/CityWideView';

function Home() {
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState('Abella');
  const [viewMode, setViewMode] = useState('location'); // 'location' or 'city'

  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, [selectedLocation]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [summary, alertsData, notificationsData] = await Promise.all([
        weatherService.getWeatherSummary(selectedLocation),
        weatherService.getWeatherAlerts(),
        weatherService.getNotifications()
      ]);

      setWeatherSummary(summary);
      setAlerts(alertsData.filter(alert => alert.location === selectedLocation));
      setNotifications(notificationsData.slice(0, 5)); // Latest 5 notifications
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Cloud className="w-8 h-8 text-yellow-500" />;
      case 'cloudy':
      case 'overcast':
        return <Cloud className="w-8 h-8 text-gray-500" />;
      case 'rainy':
      case 'rain':
        return <Droplets className="w-8 h-8 text-blue-500" />;
      default:
        return <Cloud className="w-8 h-8 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'info': return 'text-blue-600 bg-blue-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'critical': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Weather Dashboard</h1>
          <p className="text-gray-600">Comprehensive weather insights and monitoring</p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('location')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'location'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <MapPin className="w-4 h-4 mr-2 inline" />
                Specific Location
              </button>
              <button
                onClick={() => setViewMode('city')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'city'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Cloud className="w-4 h-4 mr-2 inline" />
                City Overview
              </button>
            </div>
          </div>

          {viewMode === 'location' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Location:</label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
            <option value="Abella">Abella</option>
            <option value="Dayangdang">Dayangdang</option>
            <option value="Peñafrancia">Peñafrancia</option>
            <option value="Bagumbayan_Norte">Bagumbayan Norte</option>
            <option value="Del_Rosario">Del Rosario</option>
            <option value="Sabang">Sabang</option>
            <option value="Bagumbayan_Sur">Bagumbayan Sur</option>
            <option value="Dinaga">Dinaga</option>
            <option value="San_Felipe">San Felipe</option>
            <option value="Balatas">Balatas</option>
            <option value="Igualdad_Interior">Igualdad Interior</option>
            <option value="San_Francisco_(Pob.)">San Francisco (Pob.)</option>
            <option value="Calauag">Calauag</option>
            <option value="Lerma">Lerma</option>
            <option value="San_Isidro">San Isidro</option>
            <option value="Cararayan">Cararayan</option>
            <option value="Liboton">Liboton</option>
            <option value="Santa_Cruz">Santa Cruz</option>
            <option value="Carolina">Carolina</option>
            <option value="Mabolo">Mabolo</option>
            <option value="Tabuco">Tabuco</option>
            <option value="Concepcion_Grande">Concepcion Grande</option>
            <option value="Pacol">Pacol</option>
            <option value="Tinago">Tinago</option>
            <option value="Concepcion_Pequeño">Concepcion Pequeño</option>
            <option value="Panicuason">Panicuason</option>
            <option value="Triangulo">Triangulo</option>
              </select>
            </div>
          )}
        </div>

        {/* Conditional Content Based on View Mode */}
        {viewMode === 'city' ? (
          <div className="mb-8">
            <CityWideView />
          </div>
        ) : (
          <>
            {/* Weather Overview Cards */}
            {weatherSummary && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* Current Temperature */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Current Temperature</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {weatherSummary.summary.temperature_range}
                      </p>
                    </div>
                    <Thermometer className="w-8 h-8 text-red-500" />
                  </div>
                </div>

                {/* Precipitation */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Precipitation Chance</p>
                      <p className="text-2xl font-bold text-gray-800">
                        {weatherSummary.summary.precipitation_chance}
                      </p>
                    </div>
                    <Droplets className="w-8 h-8 text-blue-500" />
                  </div>
                </div>

                {/* Wind Conditions */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Wind Conditions</p>
                      <p className="text-lg font-bold text-gray-800">
                        {weatherSummary.summary.wind_conditions}
                      </p>
                    </div>
                    <Wind className="w-8 h-8 text-gray-500" />
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Active Alerts</p>
                      <p className={`text-2xl font-bold ${weatherSummary.summary.active_alerts > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                        {weatherSummary.summary.active_alerts}
                      </p>
                    </div>
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
            )}

            {/* Flood Characteristics Section */}
            <div className="mb-8">
              <FloodCharacteristics location={selectedLocation} />
            </div>
          </>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Weather Alerts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2 text-red-500" />
                  Weather Alerts
                </h2>
                <span className="text-sm text-gray-500">{alerts.length} active</span>
              </div>

              {alerts.length > 0 ? (
                <div className="space-y-3">
                  {alerts.map((alert, index) => (
                    <div key={index} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'extreme' ? 'border-red-500 bg-red-50' :
                      alert.severity === 'severe' ? 'border-orange-500 bg-orange-50' :
                        alert.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                      }`}>
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-800">{alert.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                          <div className="flex items-center mt-2 text-xs text-gray-500">
                            <MapPin className="w-3 h-3 mr-1" />
                            <span className="mr-4">{alert.location}</span>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(alert.start_time).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${alert.severity === 'extreme' ? 'bg-red-100 text-red-600' :
                          alert.severity === 'severe' ? 'bg-orange-100 text-orange-600' :
                            alert.severity === 'moderate' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-blue-100 text-blue-600'
                          }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No active weather alerts</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Notifications
                </h2>
                <span className="text-sm text-gray-500">{notifications.length} items</span>
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div key={notification.id} className={`p-3 rounded-lg ${getSeverityColor(notification.severity)}`}>
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3 mr-1" />
                        <span>{format(new Date(notification.sent_at), 'MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No recent notifications</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button onClick={() => navigate("/forecast")} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <TrendingUp className="w-5 h-5 mr-3 text-blue-500" />
                <div className="text-left">
                  <div className="font-medium">View Detailed Forecast</div>
                  <div className="text-sm text-gray-500">7-day weather outlook</div>
                </div>
              </button>
              <button onClick={() => navigate("/map")} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <MapPin className="w-5 h-5 mr-3 text-green-500" />
                <div className="text-left">
                  <div className="font-medium">Interactive Weather Map</div>
                  <div className="text-sm text-gray-500">Real-time weather layers</div>
                </div>
              </button>
              <button onClick={() => navigate("/alerts")} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Bell className="w-5 h-5 mr-3 text-red-500" />
                <div className="text-left">
                  <div className="font-medium">Manage Alerts</div>
                  <div className="text-sm text-gray-500">Configure weather triggers</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;