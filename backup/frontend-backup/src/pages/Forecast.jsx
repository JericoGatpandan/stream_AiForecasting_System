import React, { useState, useEffect } from 'react';
import { Calendar, Thermometer, Droplets, Wind, Eye, Sun, Cloud, AlertTriangle } from 'lucide-react';
import { weatherService } from '../services/weatherService';
import { format, parseISO } from 'date-fns';

function Forecast() {
  const [selectedLocation, setSelectedLocation] = useState('Abella');
  const [forecastData, setForecastData] = useState([]);
  const [weatherSummary, setWeatherSummary] = useState(null);
  const [expertAnalysis, setExpertAnalysis] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('summary'); // summary, detailed, hourly

  useEffect(() => {
    fetchWeatherData();
  }, [selectedLocation]);

  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      const [forecast, summary, analysis] = await Promise.all([
        weatherService.getForecast(selectedLocation),
        weatherService.getWeatherSummary(selectedLocation),
        weatherService.getExpertAnalysis(selectedLocation)
      ]);

      setForecastData(forecast);
      setWeatherSummary(summary);
      setExpertAnalysis(analysis.analysis);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    switch (condition?.toLowerCase()) {
      case 'sunny':
      case 'clear':
        return <Sun className="w-8 h-8 text-yellow-500" />;
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
      case 'low': return 'text-green-600 bg-green-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'severe': return 'text-red-600 bg-red-100';
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Weather Forecast</h1>
          <p className="text-gray-600">Comprehensive weather insights and forecasts for your locations</p>
        </div>

        {/* Location Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Location:</label>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Abella">Abella</option>
            <option value="Dayangdang">Dayangdang</option>
            <option value="Peñafrancia">Peñafrancia</option>
            <option value="Bagumbayan Norte">Bagumbayan Norte</option>
            <option value="Del Rosario">Del Rosario</option>
            <option value="Sabang">Sabang</option>
            <option value="Bagumbayan Sur">Bagumbayan Sur</option>
            <option value="Dinaga">Dinaga</option>
            <option value="San Felipe">San Felipe</option>
            <option value="Balatas">Balatas</option>
            <option value="Igualdad Interior">Igualdad Interior</option>
            <option value="San Francisco (Pob.)">San Francisco (Pob.)</option>
            <option value="Calauag">Calauag</option>
            <option value="Lerma">Lerma</option>
            <option value="San Isidro">San Isidro</option>
            <option value="Cararayan">Cararayan</option>
            <option value="Liboton">Liboton</option>
            <option value="Santa Cruz">Santa Cruz</option>
            <option value="Carolina">Carolina</option>
            <option value="Mabolo">Mabolo</option>
            <option value="Tabuco">Tabuco</option>
            <option value="Concepcion Grande">Concepcion Grande</option>
            <option value="Pacol">Pacol</option>
            <option value="Tinago">Tinago</option>
            <option value="Concepcion Pequeño">Concepcion Pequeño</option>
            <option value="Panicuason">Panicuason</option>
            <option value="Triangulo">Triangulo</option>

          </select>
        </div>

        {/* View Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('summary')}
            className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'summary'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Summary
          </button>
          <button
            onClick={() => setViewMode('detailed')}
            className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'detailed'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Detailed Forecast
          </button>
          <button
            onClick={() => setViewMode('hourly')}
            className={`px-4 py-2 rounded-lg font-medium ${viewMode === 'hourly'
              ? 'bg-blue-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
          >
            Hourly Data
          </button>
        </div>

        {/* Weather Summary View */}
        {viewMode === 'summary' && weatherSummary && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Current Conditions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Current Conditions</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Temperature Range</span>
                  <span className="font-semibold">{weatherSummary.summary.temperature_range}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Precipitation Chance</span>
                  <span className="font-semibold">{weatherSummary.summary.precipitation_chance}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Wind Conditions</span>
                  <span className="font-semibold">{weatherSummary.summary.wind_conditions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Alerts</span>
                  <span className={`font-semibold ${weatherSummary.summary.active_alerts > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {weatherSummary.summary.active_alerts}
                  </span>
                </div>
              </div>
            </div>

            {/* Expert Analysis */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-blue-600" />
                Expert Analysis
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {expertAnalysis || "No expert analysis available for this location at the moment."}
              </p>
            </div>

            {/* Active Alerts */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Active Alerts</h3>
              {weatherSummary.alerts && weatherSummary.alerts.length > 0 ? (
                <div className="space-y-3">
                  {weatherSummary.alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      <div className="font-semibold">{alert.title}</div>
                      <div className="text-sm">{alert.description}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No active alerts for this location.</p>
              )}
            </div>
          </div>
        )}

        {/* Detailed Forecast View */}
        {viewMode === 'detailed' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {forecastData.map((day, index) => (
              <div key={index} className="bg-white rounded-xl shadow-lg p-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-gray-600 mb-1">
                    {format(parseISO(day.forecast_date), 'EEEE')}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(parseISO(day.forecast_date), 'MMM dd')}
                  </div>
                </div>

                <div className="text-center mb-4">
                  {getWeatherIcon(day.weather_condition)}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <Thermometer className="w-4 h-4 text-red-500" />
                    <span>{day.temperature_min}° - {day.temperature_max}°C</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>{day.precipitation_probability}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Wind className="w-4 h-4 text-gray-500" />
                    <span>{day.wind_speed} m/s</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <Eye className="w-4 h-4 text-purple-500" />
                    <span>{day.visibility} km</span>
                  </div>
                </div>

                <div className={`mt-3 text-center text-xs px-2 py-1 rounded-full ${getSeverityColor(day.severity_level)}`}>
                  {day.severity_level.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hourly Data View */}
        {viewMode === 'hourly' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">24-Hour Detailed Forecast</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precip</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wind</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Humidity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visibility</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {forecastData.slice(0, 24).map((hour, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {format(parseISO(hour.forecast_date), 'HH:mm')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        <div className="flex items-center">
                          {getWeatherIcon(hour.weather_condition)}
                          <span className="ml-2">{hour.weather_condition}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hour.temperature_min}°C
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hour.precipitation_probability}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hour.wind_speed} m/s {hour.wind_direction}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hour.humidity}%
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {hour.visibility} km
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Forecast;
