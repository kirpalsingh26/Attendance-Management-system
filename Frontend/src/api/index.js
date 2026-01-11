import axios from 'axios';

// Auto-detect API URL based on environment
const getBaseURL = () => {
  // If running on Vercel, use relative path
  if (window.location.hostname !== 'localhost') {
    return '/api';
  }
  // Otherwise use localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if it exists
API.interceptors.request.use(
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

// Auth endpoints
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  logout: () => API.post('/auth/logout'),
  getMe: () => API.get('/auth/me')
};

// User endpoints
export const userAPI = {
  updateProfile: (data) => API.put('/user/profile', data),
  updatePassword: (data) => API.put('/user/password', data)
};

// Timetable endpoints
export const timetableAPI = {
  get: () => API.get('/timetable'),
  create: (data) => API.post('/timetable', data),
  update: (id, data) => API.put(`/timetable/${id}`, data),
  delete: (id) => API.delete(`/timetable/${id}`)
};

// Attendance endpoints
export const attendanceAPI = {
  getAll: (params) => API.get('/attendance', { params }),
  getByDate: (date) => API.get(`/attendance/${date}`),
  create: (data) => API.post('/attendance', data),
  getStats: () => API.get('/attendance/stats/summary'),
  getDetailedStats: (subject) => API.get(`/attendance/stats/detailed/${encodeURIComponent(subject)}`),
  delete: (id) => API.delete(`/attendance/${id}`)
};

export default API;
