import api from './api';

export const bookingService = {
    async getAll() {
        const response = await api.get('/bookings');
        return response.data;
    },
    async getMyBookings() {
        const response = await api.get('/bookings/me');
        return response.data;
    },
    async create(bookingData: any) {
        const response = await api.post('/bookings', bookingData);
        return response.data;
    },
    async update(id: string, bookingData: any) {
        const response = await api.patch(`/bookings/${id}`, bookingData);
        return response.data;
    },
    async cancel(id: string) {
        const response = await api.patch(`/bookings/${id}/cancel`);
        return response.data;
    }
};
