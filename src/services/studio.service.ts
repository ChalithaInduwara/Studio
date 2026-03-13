import api from './api';
import { Studio } from '@/types';

export const studioService = {
    async getAll() {
        const response = await api.get('/studios');
        return response.data;
    },
    async getById(id: string) {
        const response = await api.get(`/studios/${id}`);
        return response.data;
    },
    async create(data: Partial<Studio>) {
        const response = await api.post('/studios', data);
        return response.data;
    },
    async update(id: string, data: Partial<Studio>) {
        const response = await api.put(`/studios/${id}`, data);
        return response.data;
    },
    async delete(id: string) {
        const response = await api.delete(`/studios/${id}`);
        return response.data;
    }
};
