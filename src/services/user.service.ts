import api from './api';

export const userService = {
    async getAll() {
        const response = await api.get('/users?limit=200');
        // Backend returns { success, data: { users: [...], pagination: {...} } }
        const data = response.data;
        if (data?.data?.users) {
            return { success: data.success, data: data.data.users };
        }
        return data;
    },
    async getTutors() {
        const response = await api.get('/users?role=tutor&limit=100');
        const data = response.data;
        if (data?.data?.users) {
            return { success: data.success, data: data.data.users };
        }
        return data;
    },
    async getByRole(role: string) {
        const response = await api.get(`/users?role=${role}&limit=100`);
        const data = response.data;
        if (data?.data?.users) {
            return { success: data.success, data: data.data.users };
        }
        return data;
    },
    async update(id: string, userData: any) {
        const response = await api.patch(`/users/${id}`, userData);
        return response.data;
    }
};
