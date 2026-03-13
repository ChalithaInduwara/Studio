import api from './api';

export const classService = {
    async getAll() {
        const response = await api.get('/classes');
        return response.data;
    },
    async getMyClasses() {
        const response = await api.get('/classes/me');
        return response.data;
    },
    async create(classData: any) {
        const response = await api.post('/classes', classData);
        return response.data;
    },
    async update(id: string, classData: any) {
        const response = await api.put(`/classes/${id}`, classData);
        return response.data;
    },
    async delete(id: string) {
        const response = await api.delete(`/classes/${id}`);
        return response.data;
    },
    async enroll(classId: string) {
        const response = await api.post(`/classes/${classId}/enroll`);
        return response.data;
    },
    async getPendingRequests() {
        const response = await api.get('/classes/pending-requests');
        return response.data;
    },
    async approveEnrollment(enrollmentId: string) {
        const response = await api.patch(`/classes/enrollments/${enrollmentId}/approve`);
        return response.data;
    },
    async rejectEnrollment(enrollmentId: string) {
        const response = await api.patch(`/classes/enrollments/${enrollmentId}/reject`);
        return response.data;
    },
    async getMyEnrollments() {
        const response = await api.get('/classes/my/enrollments');
        return response.data;
    }
};
