import api from './api';

export const paymentService = {
    async getAll() {
        const response = await api.get('/payments');
        return response.data;
    },
    async getMyPayments() {
        const response = await api.get('/payments/me');
        return response.data;
    },
    async create(data: any) {
        const response = await api.post('/payments', data);
        return response.data;
    },
    async updateStatus(id: string, status: string) {
        const response = await api.patch(`/payments/${id}/status`, { status });
        return response.data;
    },
    async sendInvoiceEmail(id: string) {
        const response = await api.post(`/payments/${id}/send-invoice`);
        return response.data;
    },
    async sendReminderEmail(id: string) {
        const response = await api.post(`/payments/${id}/send-reminder`);
        return response.data;
    },
    async downloadInvoice(id: string) {
        // For downloads, we might need a different approach with blob
        return api.get(`/payments/${id}/download-invoice`, { responseType: 'blob' });
    }
};
