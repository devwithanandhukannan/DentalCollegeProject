import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Map of role prefixes to token keys
const tokenKeys = {
  doctor: 'doctorToken',
  staff: 'staffToken',
  patient: 'patientToken',
  admin: 'adminToken',
};

// Interceptor to set the correct token based on URL prefix
api.interceptors.request.use((config) => {
  let token = null;

  if (config.url.startsWith('/doctor')) {
    token = localStorage.getItem(tokenKeys.doctor);
  } else if (config.url.startsWith('/staff')) {
    token = localStorage.getItem(tokenKeys.staff);
  } else if (config.url.startsWith('/patient')) {
    token = localStorage.getItem(tokenKeys.patient);
  } else if (config.url.startsWith('/admin')) {
    token = localStorage.getItem(tokenKeys.admin);
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;