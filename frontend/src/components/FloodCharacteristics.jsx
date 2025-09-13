import React, { useState, useEffect } from 'react';
import { Droplets, Clock, MapPin, AlertTriangle, TrendingUp, Shield, Info, Timer } from 'lucide-react';

const FloodCharacteristics = ({ location, onLocationChange }) => {
  const [floodData, setFloodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location) {
      fetchFloodData(location);
    }
  }, [location]);

  const fetchFloodData = async (selectedLocation) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:3001/flood/summary/${selectedLocation}`);
      const data = await response.json();
      
      if (data.hasData) {
        setFloodData(data);
      } else {
        setFloodData(null);
        setError(data.message);
      }
    } catch (err) {
      console.error('Error fetching flood data:', err);
      setError('Failed to load flood characteristics data');
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

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'extreme': return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'high': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'moderate': return <Shield className="w-5 h-5 text-yellow-600" />;
      case 'low': return <Shield className="w-5 h-5 text-green-600" />;
      default: return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatValue = (value, uncertainty, unit) => {
    const unitName = unit === 'm' ? 'meters' : unit === 'm/s' ? 'meters per second' : unit === 'hours' ? 'hours' : unit === 'km²' ? 'square kilometers' : unit;
    return `${value.toFixed(1)} ${unitName} (give or take ${uncertainty.toFixed(1)} ${unitName})`;
  };

  const formatCountdown = (hours) => {
    const totalMinutes = Math.floor(hours * 60);
    const hoursPart = Math.floor(totalMinutes / 60);
    const minutesPart = totalMinutes % 60;
    
    if (hoursPart > 0) {
      return `${hoursPart}h ${minutesPart}m`;
    } else {
      return `${minutesPart} minutes`;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-8">
          <Info className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (!floodData) {
    return null;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Droplets className="w-5 h-5 mr-2 text-blue-500" />
          Flood Characteristics
        </h2>
        <div className={`flex items-center px-3 py-1 rounded-full border ${getRiskColor(floodData.riskLevel)}`}>
          {getRiskIcon(floodData.riskLevel)}
          <span className="ml-2 font-medium capitalize">{floodData.riskLevel} Risk</span>
        </div>
      </div>

      {/* Flood Parameters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Maximum Depth */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Maximum Depth</h3>
            <Droplets className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {formatValue(floodData.maximumDepth.value, floodData.maximumDepth.uncertainty, floodData.maximumDepth.unit)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Expected water level at peak flood
          </p>
        </div>

        {/* Peak Velocity */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Peak Velocity</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-green-600">
            {formatValue(floodData.peakVelocity.value, floodData.peakVelocity.uncertainty, floodData.peakVelocity.unit)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Maximum water flow speed
          </p>
        </div>

        {/* Arrival Time */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Arrival Time</h3>
            <Timer className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {formatCountdown(floodData.arrivalTime.value)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Time to reach peak flood
          </p>
          <div className="mt-2 text-xs text-orange-700 bg-orange-100 rounded px-2 py-1">
            ± {formatCountdown(floodData.arrivalTime.uncertainty)} uncertainty
          </div>
        </div>

        {/* Inundation Area */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-700">Inundation Area</h3>
            <MapPin className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {formatValue(floodData.inundationArea.value, floodData.inundationArea.uncertainty, floodData.inundationArea.unit)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Total area affected by flooding
          </p>
        </div>
      </div>

      {/* Risk Assessment */}
      {floodData.riskAssessment && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Risk Assessment</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Risk Score</span>
              <span className="text-lg font-bold text-gray-800">{floodData.riskAssessment.score}/8</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className={`h-2 rounded-full ${
                  floodData.riskAssessment.score >= 6 ? 'bg-red-500' :
                  floodData.riskAssessment.score >= 4 ? 'bg-orange-500' :
                  floodData.riskAssessment.score >= 2 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${(floodData.riskAssessment.score / 8) * 100}%` }}
              ></div>
            </div>
            {floodData.riskAssessment.factors.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Risk Factors:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {floodData.riskAssessment.factors.map((factor, index) => (
                    <li key={index} className="flex items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
                      {factor}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expert Analysis */}
      {floodData.expertAnalysis && (
        <div className="mb-6">
          <h3 className="font-medium text-gray-700 mb-3">Expert Analysis</h3>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-700 leading-relaxed">
              {floodData.expertAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {floodData.recommendedActions && (
        <div className="mb-4">
          <h3 className="font-medium text-gray-700 mb-3">Recommended Actions</h3>
          <div className={`rounded-lg p-4 ${
            floodData.riskLevel === 'extreme' ? 'bg-red-50 border border-red-200' :
            floodData.riskLevel === 'high' ? 'bg-orange-50 border border-orange-200' :
            floodData.riskLevel === 'moderate' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-green-50 border border-green-200'
          }`}>
            <p className={`text-sm font-medium leading-relaxed ${
              floodData.riskLevel === 'extreme' ? 'text-red-800' :
              floodData.riskLevel === 'high' ? 'text-orange-800' :
              floodData.riskLevel === 'moderate' ? 'text-yellow-800' :
              'text-green-800'
            }`}>
              {floodData.recommendedActions}
            </p>
          </div>
        </div>
      )}

      {/* Last Updated */}
      <div className="text-xs text-gray-500 text-center">
        Last updated: {new Date(floodData.lastUpdated).toLocaleString()}
      </div>
    </div>
  );
};

export default FloodCharacteristics;
