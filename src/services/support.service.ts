import api from './api';

export const supportService = {
    /**
     * Send a support request to the admin
     * @param message The issue description
     */
    async sendRequest(message: string) {
        const response = await api.post('/support', { message });
        return response.data;
    }
};
