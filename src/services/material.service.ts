import api from './api';

export const materialService = {
    async getAll() {
        const response = await api.get('/materials');
        return response.data;
    },
    async upload(formData: FormData) {
        const response = await api.post('/materials', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },
    async getById(id: string) {
        const response = await api.get(`/materials/${id}`);
        return response.data;
    },
    async delete(id: string) {
        const response = await api.delete(`/materials/${id}`);
        return response.data;
    }
};
