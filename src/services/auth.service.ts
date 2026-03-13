import api from './api';

export const authService = {
    async login(credentials: any) {
        const response = await api.post('/auth/login', credentials);
        if (response.data.success && response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data;
    },

    async register(userData: any) {
        const response = await api.post('/auth/register', userData);
        if (response.data.success && response.data.data?.token) {
            localStorage.setItem('token', response.data.data.token);
        }
        return response.data;
    },

    async getMe() {
        const response = await api.get('/auth/me');
        return response.data;
    },

    logout() {
        localStorage.removeItem('token');
    }
};
