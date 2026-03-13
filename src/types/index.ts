export type UserRole = 'admin' | 'tutor' | 'student' | 'client' | 'studio_client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface Studio {
  _id: string;
  name: string;
  description?: string;
  hourlyRate: number;
  openTime: string;
  closeTime: string;
  amenities?: string[];
  isActive: boolean;
}

export interface StudioBooking {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  studioId: {
    _id: string;
    name: string;
    hourlyRate: number;
  };
  serviceType: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  totalAmount: number;
}

export interface StudioService {
  _id: string;
  name: string;
  description: string;
  price: number;
  unit?: string;
  duration?: number;
}

export interface ClassSession {
  id: string;
  title: string;
  tutorId: string;
  tutorName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'in-person' | 'online';
  recurring: boolean;
  meetingLink?: string;
  students: string[];
  maxStudents: number;
}

export interface ProjectFile {
  id: string;
  clientId: string;
  clientName: string;
  fileName: string;
  uploadDate: string;
  fileSize: string;
  type: 'track' | 'mix' | 'master';
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  date: string;
  type: 'studio' | 'tuition';
  status: 'paid' | 'pending' | 'overdue';
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'booking' | 'payment' | 'class' | 'system';
}
