import axios, {  AxiosError } from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import { authService } from './auth';
import { deliveryPartnerAuthService } from './deliveryPartnerAuth';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    let token;
    if(config.url?.startsWith('/partner')){
       token = deliveryPartnerAuthService.getAccessToken();
    } else {
      token = authService.getAccessToken(); 
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshAccessToken();
        if (newToken) {
          if (!originalRequest.headers) {
            originalRequest.headers = {};
          }
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch {
        // Redirect to login or handle refresh failure
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;