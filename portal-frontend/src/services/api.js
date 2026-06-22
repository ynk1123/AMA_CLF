import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' }
});

// JWT Token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors (auto-logout)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {

  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  adminLogin: (data) => api.post('/auth/admin-login', data),
  forgotPassword: (data) => api.post('/auth/requestPasswordReset', data),

  // Backend expects: POST /api/auth/resetPassword/:id/:token with body { password }
  resetPassword: ({ id, token, password }) =>
    api.post(`/auth/resetPassword/${id}/${token}`, { password })
};


export const itemService = {
  getItems: () => api.get('/items'),
  createItem: (data) => api.post('/items', data, { 
    headers: { 'Content-Type': 'multipart/form-data' } 
  }),
  claimItem: (data) => api.post('/items/claim', data),
  getMyItems: () => api.get('/items/my-items'),
  getMyClaims: () => api.get('/items/my-claims')
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
  getStats: () => api.get('/admin/stats'),
  getLocationStats: () => api.get('/admin/stats/locations'),
  approveItem: (id) => api.put(`/admin/items/${id}/approve`),
  updateItemStatus: (id, status) => api.put(`/admin/items/${id}/status`, { status }),
  deleteItem: (id) => api.delete(`/admin/items/${id}`),
  getPendingClaims: () => api.get('/admin/claims/pending'),
  approveClaim: (data) => api.post('/admin/claims/approve', data),
  // New multi-claim endpoints
  getItemClaims: (itemId) => api.get(`/admin/items/${itemId}/claims`),
  approveOrRejectClaim: (claimId, status) => api.post(`/admin/claims/${claimId}/decision`, { claimId, status }),
  getAllPendingClaims: () => api.get('/admin/claims/all-pending'),
  getAllClaims: () => api.get('/admin/claims/all'),
  // User management
  getAllUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  reactivateUser: (id) => api.put(`/admin/users/${id}/reactivate`)
};

// Contact service - no auth required
export const contactService = {
  submitContact: (data) => api.post('/contact', data)
};

// NOTE: authService already contains request/reset endpoints in this file.

