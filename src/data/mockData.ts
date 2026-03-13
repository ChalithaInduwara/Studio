import { User, StudioBooking, ClassSession, ProjectFile, Payment, Notification } from '../types';

export const users: User[] = [
    { _id: 'u1', name: 'Admin User', email: 'admin@studiosync.com', role: 'admin', phone: '077 123 4567' },
    { _id: 'u2', name: 'Dr. Sarah Williams', email: 'sarah@swara.edu', role: 'tutor', phone: '071 234 5678' },
    { _id: 'u3', name: 'Jason Derulo', email: 'jason@recording.com', role: 'client', phone: '072 345 6789' },
    { _id: 'u4', name: 'Amila Perera', email: 'amila@gmail.com', role: 'student', phone: '075 456 7890' },
    { _id: 'u5', name: 'Mike Chen', email: 'mike@tutor.com', role: 'tutor', phone: '076 567 8901' },
];

export const currentUser: User | null = users[0];

export const studioBookings: StudioBooking[] = [
    {
        _id: 'b1',
        userId: { _id: 'u3', name: 'Jason Derulo' },
        studioId: { _id: 's1', name: 'Studio A', hourlyRate: 5000 },
        date: '2025-01-15',
        startTime: '10:00',
        endTime: '13:00',
        serviceType: 'Recording',
        status: 'confirmed',
        totalAmount: 15000,
        notes: 'Vocals for new single'
    },
    {
        _id: 'b2',
        userId: { _id: 'u3', name: 'Jason Derulo' },
        studioId: { _id: 's1', name: 'Studio A', hourlyRate: 5000 },
        date: '2025-01-20',
        startTime: '14:00',
        endTime: '16:00',
        serviceType: 'Mixing',
        status: 'pending',
        totalAmount: 8500
    },
];

export const classSessions: ClassSession[] = [
    {
        id: 'c1',
        title: 'Advanced Guitar Theory',
        tutorId: 'u2',
        tutorName: 'Dr. Sarah Williams',
        date: '2025-01-15',
        startTime: '16:00',
        endTime: '18:00',
        type: 'in-person',
        recurring: true,
        students: ['u4', 'u6'],
        maxStudents: 10
    },
    {
        id: 'c2',
        title: 'Music Production 101',
        tutorId: 'u5',
        tutorName: 'Mike Chen',
        date: '2025-01-15',
        startTime: '19:00',
        endTime: '21:00',
        type: 'online',
        recurring: false,
        meetingLink: 'https://zoom.us/j/123456789',
        students: ['u4'],
        maxStudents: 20
    },
];

export const projectFiles: ProjectFile[] = [
    {
        id: 'f1',
        clientId: 'u3',
        clientName: 'Jason Derulo',
        fileName: 'Vocal_Track_Main.wav',
        uploadDate: '2025-01-14',
        fileSize: '45 MB',
        type: 'track'
    },
    {
        id: 'f2',
        clientId: 'u3',
        clientName: 'Jason Derulo',
        fileName: 'Final_Mix_V1.mp3',
        uploadDate: '2025-01-15',
        fileSize: '8 MB',
        type: 'mix'
    },
];

export const payments: Payment[] = [
    {
        id: 'INV-2025-001',
        userId: 'u3',
        userName: 'Jason Derulo',
        amount: 15000,
        date: '2025-01-10',
        type: 'studio',
        status: 'paid'
    },
    {
        id: 'INV-2025-002',
        userId: 'u4',
        userName: 'Amila Perera',
        amount: 5000,
        date: '2025-01-12',
        type: 'tuition',
        status: 'pending'
    },
    {
        id: 'INV-2025-003',
        userId: 'u3',
        userName: 'Jason Derulo',
        amount: 8500,
        date: '2024-12-20',
        type: 'studio',
        status: 'overdue'
    },
];

export const notifications: Notification[] = [
    {
        id: 'n1',
        title: 'Booking Confirmed',
        message: 'Your recording session for Jan 15 has been confirmed.',
        date: '2025-01-10',
        read: false,
        type: 'booking'
    },
    {
        id: 'n2',
        title: 'New Material Uploaded',
        message: 'Mike Chen uploaded "Production Basics.pdf" to Music Production 101.',
        date: '2025-01-14',
        read: true,
        type: 'class'
    },
];

export const revenueData = [
    { month: 'Aug', studio: 45000, academy: 30000 },
    { month: 'Sep', studio: 52000, academy: 35000 },
    { month: 'Oct', studio: 48000, academy: 42000 },
    { month: 'Nov', studio: 61000, academy: 45000 },
    { month: 'Dec', studio: 55000, academy: 38000 },
    { month: 'Jan', studio: 68000, academy: 52000 },
];

export const serviceRates = [
    { id: 's1', service: 'Recording', rate: 5000, unit: 'hour' },
    { id: 's2', service: 'Mixing', rate: 8500, unit: 'track' },
    { id: 's3', service: 'Mastering', rate: 4500, unit: 'track' },
];
