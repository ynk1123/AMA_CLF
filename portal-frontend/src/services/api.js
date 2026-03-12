import axios from 'axios';

// Update this to match your deployment URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data)
};

export const itemService = {
  getItems: () => api.get('/items'),
  createItem: (data) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/items', data, config);
  },
  claimItem: (data) => api.post('/items/claim', data),
  getMyItems: () => api.get('/items/my')
};

export const messageService = {
  getMessages: (itemId) => api.get(`/messages/${itemId}`),
  createMessage: (data) => api.post('/messages', data),
  deleteMessage: (id) => api.delete(`/messages/${id}`)
};

export const appointmentService = {
  createAppointment: (data) => api.post('/appointments', data),
  getAppointments: () => api.get('/appointments'),
  updateStatus: (id, status) => api.put(`/appointments/${id}/status`, { status })
};

export const adminService = {
  getAllItems: () => api.get('/admin/items'),
  approveItem: (id) => api.put(`/admin/items/${id}/approve`),
  updateItemStatus: (id, status)