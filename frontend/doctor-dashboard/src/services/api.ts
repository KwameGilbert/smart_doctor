import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to automatically attach authorization headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry or global errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirect to login if token expired and not on auth pages
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/signup')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const authAPI = {
  login: (data: any) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  verify: (data: any) => api.post('/auth/verify', data),
  resendOtp: (data: any) => api.post('/auth/resend-otp', data),
  forgotPassword: (data: any) => api.post('/auth/forgot-password', data),
  resetPassword: (data: any) => api.post('/auth/reset-password', data),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getHomeDashboard: () => api.get('/users/home'),
};

export const appointmentAPI = {
  list: (params?: any) => api.get('/appointments', { params }),
  getDetails: (id: string) => api.get(`/appointments/${id}`),
  confirm: (id: string) => api.patch(`/appointments/${id}/confirm`),
  reject: (id: string) => api.patch(`/appointments/${id}/reject`),
  cancel: (id: string) => api.patch(`/appointments/${id}/cancel`),
  reschedule: (id: string, data: any) => api.patch(`/appointments/${id}/reschedule`, data),
};

export const consultationAPI = {
  getDetails: (id: string) => api.get(`/consultations/${id}`),
  start: (id: string) => api.patch(`/consultations/${id}/start`),
  end: (id: string) => api.patch(`/consultations/${id}/end`),
  updateNotes: (id: string, notes: string, diagnosis?: string, recommendations?: string) => 
    api.patch(`/consultations/${id}/notes`, { notes, diagnosis, recommendations }),
};

export const messageAPI = {
  getMessages: (consultationId: string, params?: { page?: number; limit?: number }) => 
    api.get(`/consultations/${consultationId}/messages`, { params }),
  sendMessage: (consultationId: string, data: { content?: string; attachmentUrl?: string; attachmentType?: string }) => 
    api.post(`/consultations/${consultationId}/messages`, data),
  markDelivered: (consultationId: string) => 
    api.post(`/consultations/${consultationId}/messages/delivered`),
  markRead: (consultationId: string) => 
    api.post(`/consultations/${consultationId}/messages/read`),
};
