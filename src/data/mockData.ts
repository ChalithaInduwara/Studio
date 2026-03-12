import { User, StudioBooking, ClassSession, ProjectFile, Payment, Notification } from '../types';

export const currentUser: User | null = null;

export const users: User[] = [];

export const studioBookings: StudioBooking[] = [];

export const classSessions: ClassSession[] = [];

export const projectFiles: ProjectFile[] = [];

export const payments: Payment[] = [];

export const notifications: Notification[] = [];

export const revenueData: { month: string; studio: number; academy: number }[] = [];

export const serviceRates: { id: string; service: string; rate: number; unit: string }[] = [];
