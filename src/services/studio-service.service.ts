import api from './api';

export const studioServiceService = {
    async getAll() {
        const response = await api.get('/services');
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/services', data);
        return response.data;
    },
    async update(id: string, data: any) {
        const response = await api.put(`/services/${id}`, data);
        return response.data;
    },
    async delete(id: string) {
        const response = await api.delete(`/services/${id}`);
        return response.data;
    }
};
