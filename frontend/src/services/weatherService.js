import axios from 'axios';

const API_BASE_URL = 'http://localhost:5500';

const weatherAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Weather Forecast API calls
export const weatherService = {
  // Get 7-day forecast for a location
  getForecast: async (location) => {
    try {
      const response = await weatherAPI.get(`/weather/forecast/${location}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
  },

  // Get hourly forecast for a location
  getHourlyForecast: async (location) => {
    try {
      const response = await weatherAPI.get(`/weather/forecast/hourly/${location}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching hourly forecast:', error);
      throw error;
    }
  },

  // Get weather summary for a location
  getWeatherSummary: async (location) => {
    try {
      const response = await weatherAPI.get(`/weather/summary/${location}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching weather summary:', error);
      throw error;
    }
  },

  // Get expert analysis for a location
  getExpertAnalysis: async (location) => {
    try {
      const response = await weatherAPI.get(`/weather/analysis/${location}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expert analysis:', error);
      throw error;
    }
  },

  // Get all weather alerts
  getWeatherAlerts: async () => {
    try {
      const response = await weatherAPI.get('/weather/alerts');
      return response.data;
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      throw error;
    }
  },

  // Get alerts for specific location
  getLocationAlerts: async (location) => {
    try {
      const response = await weatherAPI.get(`/weather/alerts/${location}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching location alerts:', error);
      throw error;
    }
  },

  // User Locations API calls
  getUserLocations: async () => {
    try {
      const response = await weatherAPI.get('/weather/locations');
      return response.data;
    } catch (error) {
      console.error('Error fetching user locations:', error);
      throw error;
    }
  },

  addUserLocation: async (locationData) => {
    try {
      const response = await weatherAPI.post('/weather/locations', locationData);
      return response.data;
    } catch (error) {
      console.error('Error adding user location:', error);
      throw error;
    }
  },

  updateUserLocation: async (id, locationData) => {
    try {
      const response = await weatherAPI.put(`/weather/locations/${id}`, locationData);
      return response.data;
    } catch (error) {
      console.error('Error updating user location:', error);
      throw error;
    }
  },

  deleteUserLocation: async (id) => {
    try {
      const response = await weatherAPI.delete(`/weather/locations/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting user location:', error);
      throw error;
    }
  },

  // Weather Triggers API calls
  getWeatherTriggers: async () => {
    try {
      const response = await weatherAPI.get('/weather/triggers');
      return response.data;
    } catch (error) {
      console.error('Error fetching weather triggers:', error);
      throw error;
    }
  },

  addWeatherTrigger: async (triggerData) => {
    try {
      const response = await weatherAPI.post('/weather/triggers', triggerData);
      return response.data;
    } catch (error) {
      console.error('Error adding weather trigger:', error);
      throw error;
    }
  },

  updateWeatherTrigger: async (id, triggerData) => {
    try {
      const response = await weatherAPI.put(`/weather/triggers/${id}`, triggerData);
      return response.data;
    } catch (error) {
      console.error('Error updating weather trigger:', error);
      throw error;
    }
  },

  deleteWeatherTrigger: async (id) => {
    try {
      const response = await weatherAPI.delete(`/weather/triggers/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting weather trigger:', error);
      throw error;
    }
  },

  // Notifications API calls
  getNotifications: async () => {
    try {
      const response = await weatherAPI.get('/weather/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const response = await weatherAPI.put(`/weather/notifications/${id}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Environmental data (existing)
  getEnvironmentalData: async (barangay) => {
    try {
      const response = await weatherAPI.get(`/environmental/${barangay}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching environmental data:', error);
      throw error;
    }
  },
};

export default weatherService;
