import { useState, useEffect, useCallback } from 'react';

/**
 * Generic data fetching hook with loading, error, and retry capabilities
 * @param {Function} fetchFunction - The function to fetch data
 * @param {Array} dependencies - Dependencies that trigger refetch
 * @param {Object} options - Additional options
 */
export const useAsyncData = (fetchFunction, dependencies = [], options = {}) => {
  const {
    initialData = null,
    immediate = true,
    onError = null,
    onSuccess = null
  } = options;

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!fetchFunction) return;

    setLoading(true);
    setError(null);

    try {
      const result = await fetchFunction();
      setData(result);
      
      if (onSuccess) onSuccess(result);
    } catch (err) {
      setError(err);
      
      if (onError) {
        onError(err);
      } else {
        console.error('useAsyncData error:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [fetchFunction, onError, onSuccess]);

  // Auto-fetch on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [fetchData, immediate, ...dependencies]);

  const retry = useCallback(() => {
    fetchData();
  }, [fetchData]);

  const mutate = useCallback((newData) => {
    setData(newData);
  }, []);

  return {
    data,
    loading,
    error,
    retry,
    mutate,
    refetch: fetchData
  };
};

/**
 * Hook for fetching weather data
 */
export const useWeatherData = (location, options = {}) => {
  const fetchWeatherData = useCallback(async () => {
    if (!location) return null;
    
    const { weatherService } = await import('../services/weatherService');
    const [summary, alerts] = await Promise.all([
      weatherService.getWeatherSummary(location),
      weatherService.getLocationAlerts(location)
    ]);
    
    return { summary, alerts };
  }, [location]);

  return useAsyncData(fetchWeatherData, [location], options);
};

/**
 * Hook for fetching barangay data
 */
export const useBarangayData = (barangay, options = {}) => {
  const fetchBarangayData = useCallback(async () => {
    if (!barangay) return null;
    
    const response = await fetch(`http://localhost:5500/barangays/${barangay}`);
    if (!response.ok) throw new Error('Failed to fetch barangay data');
    
    return response.json();
  }, [barangay]);

  return useAsyncData(fetchBarangayData, [barangay], options);
};

/**
 * Hook for managing multiple API calls
 */
export const useMultipleAsyncData = (requests) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErrors({});

    const promises = Object.entries(requests).map(async ([key, fetchFn]) => {
      try {
        const data = await fetchFn();
        return [key, { data, error: null }];
      } catch (error) {
        return [key, { data: null, error }];
      }
    });

    const results = await Promise.all(promises);
    const resultsObj = Object.fromEntries(results);
    
    setResults(Object.fromEntries(
      Object.entries(resultsObj).map(([key, { data }]) => [key, data])
    ));
    setErrors(Object.fromEntries(
      Object.entries(resultsObj)
        .filter(([, { error }]) => error)
        .map(([key, { error }]) => [key, error])
    ));
    
    setLoading(false);
  }, [requests]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return {
    results,
    loading,
    errors,
    refetch: fetchAll
  };
};