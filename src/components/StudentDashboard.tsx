import { useState, useEffect } from 'react';
import {
    BookOpen,
    Calendar,
    Clock,
    GraduationCap,
    Trophy,
    Loader2,
    Download,
    FileText,
    FileAudio,
    Video,
    File
} from 'lucide-react';
import { User } from '@/types';
import { classService } from '@/services/class.service';
import { bookingService } from '@/services/booking.service';
import { materialService } from '@/services/material.service';
import { cn } from '@/utils/cn';
import { MiniCalendar } from './MiniCalendar';

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const DOWNLOAD_BASE = API_BASE.replace('/api/v1', '');

interface StudentDashboardProps {
    user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesRes, enrollmentsRes, materialsRes, bookingsRes] = await Promise.all([
                    classService.getAll(),
                    classService.getMyEnrollments(),
                    materialService.getAll(),
                    bookingService.getMyBookings()
                ]);
                if (classesRes.success) setAvailableClasses(classesRes.data);
                if (enrollmentsRes.success) setMyEnrollments(enrollmentsRes.data);
                if (materialsRes.success && enrollmentsRes.success) {
                    const enrolledClassIds = enrollmentsRes.data.map((e: any) => e.classId?._id);
                    const filtered = materialsRes.data.filter((m: any) =>
                        !m.classId || enrolledClassIds.includes(m.classId?._id)
                    );
                    setMaterials(filtered);
                }
                if (bookingsRes.success) setMyBookings(bookingsRes.data);
            } catch (error) {
                console.error('Failed to fetch dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleEnroll = async (classId: string) => {
        try {
            const res = await classService.enroll(classId);
            if (res.success) {
                const enrollmentsRes = await classService.getMyEnrollments();
                if (enrollmentsRes.success) setMyEnrollments(enrollmentsRes.data);
            }
        } catch (error: any) {
            alert(error.response?.data?.message || 'Failed to send enrollment request');
        }
    };

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                <p className="text-gray-500 mt-1">Ready for your next lesson?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{availableClasses.filter((c: any) => c.enrolledCount > 0).length}</p>
                    <p className="text-sm text-gray-500 mt-1">Active Courses</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                        <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">12h</p>
                    <p className="text-sm text-gray-500 mt-1">Practice This Week</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                        <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                    <p className="text-sm text-gray-500 mt-1">Upcoming Lessons</p>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mb-4">
                        <Trophy className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
                    <p className="text-sm text-gray-500 mt-1">Files Available</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <GraduationCap className="w-5 h-5 text-purple-600" />
                            Available Classes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableClasses.map((cls: any) => {
                                const isEnrolled = myEnrollments.some((e: any) => e.classId._id === cls._id);
                                const isPending = myEnrollments.some((e: any) => e.classId._id === cls._id && e.status === 'pending');

                                return (
                                    <div key={cls._id} className="p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                                        <h3 className="font-bold text-gray-900">{cls.className}</h3>
                                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cls.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-lg text-gray-600">
                                                {cls.schedule?.day} @ {cls.schedule?.startTime}
                                            </span>
                                            <button
                                                onClick={() => handleEnroll(cls._id)}
                                                disabled={isEnrolled || isPending}
                                                className={cn(
                                                    "text-xs font-bold px-4 py-2 rounded-xl transition-all",
                                                    isEnrolled ? "bg-green-100 text-green-700 pointer-events-none" :
                                                        isPending ? "bg-amber-100 text-amber-700 pointer-events-none" :
                                                            "bg-purple-600 text-white hover:bg-purple-700 shadow-sm"
                                                )}
                                            >
                                                {isEnrolled ? 'Enrolled' : isPending ? 'Pending' : 'Join Class'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <MiniCalendar bookings={myBookings} enrollments={myEnrollments} />

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            My Materials
                        </h2>
                        <div className="space-y-3">
                            {materials.length > 0 ? (
                                materials.map((item: any) => (
                                    <div key={item._id} className="group p-3 rounded-xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                {item.mimeType?.includes('pdf') ? <FileText className="w-4 h-4 text-red-500" /> :
                                                    item.mimeType?.startsWith('audio/') ? <FileAudio className="w-4 h-4 text-purple-500" /> :
                                                        item.mimeType?.startsWith('video/') ? <Video className="w-4 h-4 text-indigo-500" /> :
                                                            <File className="w-4 h-4 text-gray-500" />
                                                }
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{item.title}</p>
                                                <p className="text-xs text-gray-500">{item.classId?.className || 'General'}</p>
                                            </div>
                                            <a
                                                href={`${DOWNLOAD_BASE}${item.fileUrl}`}
                                                download={item.fileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    No materials shared yet
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white text-center relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium mb-1">Upgrade your skills</p>
                            <h3 className="text-xl font-bold mb-4">Get Certified</h3>
                            <button
                                onClick={() => window.open(DOWNLOAD_BASE, '_blank')}
                                className="w-full py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-lg hover:bg-blue-50 transition-all font-outfit"
                            >
                                View Learning Paths
                            </button>
                        </div>
                        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>
        </div>
    );
}
