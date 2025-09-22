import axios from 'axios';

// Create a centralized API client
const createApiClient = () => {
  const baseURL = import.meta.env.PROD 
    ? '/api' 
    : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5500';

  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor for debugging
  client.interceptors.request.use(
    (config) => {
      if (import.meta.env.DEV) {
        console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, config.data);
      }
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for debugging and error handling
  client.interceptors.response.use(
    (response) => {
      if (import.meta.env.DEV) {
        console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
      }
      return response;
    },
    (error) => {
      const errorMsg = error.response?.data?.error || error.message || 'Unknown error';
      
      if (import.meta.env.DEV) {
        console.error(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
          status: error.response?.status,
          message: errorMsg,
          data: error.response?.data
        });
      }

      // Transform error to a consistent format
      const transformedError = {
        message: errorMsg,
        status: error.response?.status,
        code: error.code,
        isNetworkError: !error.response,
        originalError: error
      };

      return Promise.reject(transformedError);
    }
  );

  return client;
};

export const apiClient = createApiClient();
export default apiClient;