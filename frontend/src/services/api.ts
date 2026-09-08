import axios from 'axios';
import type { AuthResponse, User, TenantOnboardingPayload } from '../types/auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auto token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/auth/refresh/`, {
            refresh: refreshToken,
          });
          if (res.data.access) {
            localStorage.setItem('access_token', res.data.access);
            originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('current_user');
          window.dispatchEvent(new Event('auth:logout'));
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  async register(data: Record<string, any>): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/register/', data);
    return res.data;
  },

  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await api.post<AuthResponse>('/api/auth/login/', credentials);
    return res.data;
  },

  async getCurrentUser(): Promise<User> {
    const res = await api.get<User>('/api/auth/me/');
    return res.data;
  },

  async submitOnboarding(data: Partial<TenantOnboardingPayload>): Promise<{ message: string; profile: any }> {
    const res = await api.post('/api/auth/onboarding/', data);
    return res.data;
  },

  async switchRole(targetRole: 'TENANT' | 'LANDLORD'): Promise<any> {
    const res = await api.post('/api/auth/switch-role/', { role: targetRole });
    return res.data;
  },

  async forgotPassword(data: { email: string; new_password: string; confirm_password: string }): Promise<{ message: string; email: string }> {
    const res = await api.post('/api/auth/forgot-password/', data);
    return res.data;
  }
};
