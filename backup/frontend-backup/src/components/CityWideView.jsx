import React, { useState, useEffect } from 'react';
import { MapPin, AlertTriangle, Cloud, Droplets, TrendingUp, Users, Shield } from 'lucide-react';

const CityWideView = () => {
  const [cityData, setCityData] = useState({
    alerts: [],
    forecasts: [],
    floodData: [],
    summary: null
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchCityWideData();
  }, []);

  const fetchCityWideData = async () => {
    setLoading(true);
    try {
      // Handle the fetch operations separately to provide better error handling
      let alerts = [];
      let floodData = [];

      try {
        const alertsRes = await fetch('http://localhost:5500/weather/alerts');
        alerts = await alertsRes.json();
      } catch (alertError) {
        console.error('Error fetching alerts:', alertError);
        alerts = []; // Ensure we have an empty array if there's an error
      }

      try {
        const floodRes = await fetch('http://localhost:5500/flood/');
        floodData = await floodRes.json();
      } catch (floodError) {
        console.error('Error fetching flood data:', floodError);
        floodData = []; // Ensure we have an empty array if there's an error
      }

      // Only calculate summary if we have valid flood data
      let summary = null;
      if (floodData && floodData.length > 0) {
        const highRiskAreas = floodData.filter(area => area.flood_risk_level === 'high' || area.flood_risk_level === 'extreme').length;
        const avgDepth = floodData.reduce((sum, area) => sum + (area.maximum_depth || 0), 0) / floodData.length;
        const avgVelocity = floodData.reduce((sum, area) => sum + (area.peak_velocity || 0), 0) / floodData.length;

        summary = {
          totalAlerts: alerts.length,
          highRiskAreas,
          avgDepth: avgDepth.toFixed(1),
          avgVelocity: avgVelocity.toFixed(1),
          totalAreas: floodData.length
        };
      }

      setCityData({
        alerts: alerts || [],
        floodData: floodData || [],
        summary
      });
    } catch (error) {
      console.error('Error fetching city-wide data:', error);
      setCityData({
        alerts: [],
        floodData: [],
        summary: null
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'extreme': return 'text-red-600 bg-red-100 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-100 border-orange-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-100 border-green-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'extreme': return 'text-red-600 bg-red-100';
      case 'severe': return 'text-orange-600 bg-orange-100';
      case 'moderate': return 'text-yellow-600 bg-yellow-100';
      case 'minor': return 'text-blue-600 bg-blue-100';
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
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-blue-500" />
          Naga City Overview
        </h2>
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          {['overview', 'alerts', 'flood', 'forecast'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${activeTab === tab
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{cityData.summary?.totalAlerts || 0}</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">High Risk Areas</p>
                  <p className="text-2xl font-bold text-orange-600">{cityData.summary?.highRiskAreas || 0}</p>
                </div>
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Water Depth</p>
                  <p className="text-2xl font-bold text-blue-600">{cityData.summary?.avgDepth || '0.0'}m</p>
                </div>
                <Droplets className="w-8 h-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Areas</p>
                  <p className="text-2xl font-bold text-green-600">{cityData.summary?.totalAreas || 0}</p>
                </div>
                <Users className="w-8 h-8 text-green-500" />
              </div>
            </div>
          </div>

          {/* Recent High-Risk Areas */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">High-Risk Areas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {cityData.floodData
                .filter(area => area.flood_risk_level === 'high' || area.flood_risk_level === 'extreme')
                .slice(0, 6)
                .map((area, index) => (
                  <div key={index} className={`p-4 rounded-lg border ${getRiskColor(area.flood_risk_level)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{area.location}</h4>
                      <span className="text-xs font-medium uppercase">{area.flood_risk_level}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p>Depth: {area.maximum_depth.toFixed(1)}m</p>
                      <p>Velocity: {area.peak_velocity.toFixed(1)} m/s</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'alerts' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">All Active Alerts</h3>
          {cityData.alerts.length > 0 ? (
            <div className="space-y-3">
              {cityData.alerts.map((alert, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${alert.severity === 'extreme' ? 'border-red-500 bg-red-50' :
                  alert.severity === 'severe' ? 'border-orange-500 bg-orange-50' :
                    alert.severity === 'moderate' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                  }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-800">{alert.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span className="mr-4">{alert.location}</span>
                        <span className={`px-2 py-1 rounded-full ${getSeverityColor(alert.severity)}`}>
                          {alert.severity.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No active alerts for Naga City</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'flood' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Flood Risk by Area</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cityData.floodData.map((area, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getRiskColor(area.flood_risk_level)}`}>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold">{area.location}</h4>
                  <span className="text-xs font-medium uppercase">{area.flood_risk_level}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Depth:</span>
                    <span className="font-medium">{area.maximum_depth.toFixed(1)} meters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Water Speed:</span>
                    <span className="font-medium">{area.peak_velocity.toFixed(1)} m/s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Arrival Time:</span>
                    <span className="font-medium">{Math.floor(area.arrival_time * 60)} minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Affected Area:</span>
                    <span className="font-medium">{area.inundation_area.toFixed(1)} km²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'forecast' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Weather Forecast</h3>
          <div className="text-center py-8">
            <Cloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Weather forecast data will be integrated here</p>
            <p className="text-sm text-gray-400 mt-2">This feature will show city-wide weather conditions</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CityWideView;
