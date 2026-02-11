import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

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
