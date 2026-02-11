import axios from 'axios';

// Use environment variable or fallback to localhost:8000 (matching your backend port)
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add Authorization header
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Employee API calls
export const employeeAPI = {
    getAll: () => api.get('/employees/'),
    getById: (employeeId) => api.get(`/employees/${employeeId}`),
    create: (employeeData) => api.post('/employees/', employeeData),
    delete: (employeeId) => api.delete(`/employees/${employeeId}`),
};

// Dashboard API calls
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

// Attendance API calls
export const attendanceAPI = {
    getByEmployee: (employeeId) => api.get(`/attendance/${employeeId}`),
    getByDate: (date) => api.get(`/attendance/date/${date}`),
    create: (attendanceData) => api.post('/attendance/', attendanceData),
};

export default api;
