import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Accept': 'application/json',
    },
});

// Add a request interceptor to include auth tokens if available
api.interceptors.request.use(
    (config) => {
        // Check for Admin token first, then User token
        const adminToken = localStorage.getItem('token');
        const userToken = localStorage.getItem('userToken');

        const token = adminToken || userToken;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
export { API_BASE_URL };
