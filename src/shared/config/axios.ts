/**
 * Axios Instance Configuration
 * Centralized HTTP client with interceptors and refresh token management
 * 
 * @author CHOUABBIA Amine
 * @created 12-22-2025
 * @updated 12-23-2025
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/iaas/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token state management
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];
let refreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 3;

/**
 * Subscribe to token refresh
 * Used to queue requests while token is being refreshed
 */
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

/**
 * Notify all subscribers when token is refreshed
 */
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

/**
 * Clear refresh state
 */
const clearRefreshState = () => {
  isRefreshing = false;
  refreshSubscribers = [];
  refreshAttempts = 0;
};

/**
 * Refresh the access token using refresh token
 */
const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  // Check if too many attempts
  if (refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
    console.error(`❌ Max refresh attempts (${MAX_REFRESH_ATTEMPTS}) reached`);
    throw new Error('Max refresh attempts exceeded');
  }

  refreshAttempts++;

  try {
    console.log(`🔄 Refreshing access token (attempt ${refreshAttempts}/${MAX_REFRESH_ATTEMPTS})...`);
    
    const response = await axios.post(
      `${axiosInstance.defaults.baseURL}/auth/refresh`,
      { refreshToken },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000, // 10 second timeout for refresh
      }
    );

    // Handle different response structures
    const data = response.data?.data || response.data;
    const token = data.token || data.accessToken || data.access_token;
    const newRefreshToken = data.refreshToken || data.refresh_token;
    
    if (!token) {
      throw new Error('No token in refresh response');
    }

    // Store new tokens
    localStorage.setItem('access_token', token);
    console.log('✅ Access token refreshed successfully');
    
    // Update refresh token if provided
    if (newRefreshToken) {
      localStorage.setItem('refresh_token', newRefreshToken);
      console.log('✅ Refresh token updated');
    }

    // Reset attempts on success
    refreshAttempts = 0;

    return token;
  } catch (error: any) {
    console.error('❌ Token refresh failed:', error);
    
    // Log detailed error information
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      // Handle specific error cases
      if (error.response.status === 500) {
        console.error('⚠️ Backend error (500) during token refresh');
        // Don't clear tokens on server errors - backend might be temporarily down
        if (refreshAttempts < MAX_REFRESH_ATTEMPTS) {
          console.log('⏳ Will retry on next request...');
          throw new Error('Token refresh failed - backend error');
        }
      } else if (error.response.status === 401 || error.response.status === 403) {
        console.error('🔒 Refresh token invalid or expired');
        // Clear tokens only on authentication errors
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
      }
    } else if (error.request) {
      console.error('⚠️ No response received from server');
      // Network error - don't clear tokens
      if (refreshAttempts < MAX_REFRESH_ATTEMPTS) {
        console.log('⏳ Will retry on next request...');
      }
    }
    
    throw error;
  }
};

/**
 * Request interceptor - Add auth token to requests
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh and errors
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Skip refresh for auth endpoints (except refresh itself)
    if (originalRequest?.url?.includes('/auth/login') || 
        originalRequest?.url?.includes('/auth/logout') ||
        originalRequest?.url?.includes('/auth/register')) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;

      if (!isRefreshing) {
        isRefreshing = true;

        try {
          const newToken = await refreshAccessToken();
          clearRefreshState();
          
          // Notify all queued requests
          onTokenRefreshed(newToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return axiosInstance(originalRequest);
        } catch (refreshError: any) {
          clearRefreshState();
          
          // Only redirect to login if authentication is truly invalid
          if (refreshError.response?.status === 401 || 
              refreshError.response?.status === 403 ||
              refreshAttempts >= MAX_REFRESH_ATTEMPTS) {
            console.error('🚪 Redirecting to login...');
            
            // Prevent redirect loop
            if (window.location.pathname !== '/login') {
              window.location.href = '/login';
            }
          } else {
            // For server errors or network issues, just fail the request
            console.warn('⚠️ Request failed but keeping session (backend might be down)');
          }
          
          return Promise.reject(refreshError);
        }
      } else {
        // Token is being refreshed, queue this request
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(originalRequest));
          });
          
          // Add timeout for queued requests
          setTimeout(() => {
            reject(new Error('Token refresh queue timeout'));
          }, 30000);
        });
      }
    }

    // Handle 403 Forbidden - Access denied
    if (error.response?.status === 403) {
      console.warn('⛔ Access denied:', error.response.data);
    }

    // Handle 500 Server Error
    if (error.response?.status === 500) {
      console.error('🔥 Server error (500):', error.config?.url);
    }

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
