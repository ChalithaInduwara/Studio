import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, GraduationCap, PlayCircle, Trophy, Loader2 } from 'lucide-react';
import { User } from '@/types';
import { classService } from '@/services/class.service';
import { cn } from '@/utils/cn';

interface StudentDashboardProps {
    user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {
    const [availableClasses, setAvailableClasses] = useState<any[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [classesRes, enrollmentsRes] = await Promise.all([
                    classService.getAll(),
                    classService.getMyEnrollments()
                ]);
                if (classesRes.success) setAvailableClasses(classesRes.data);
                if (enrollmentsRes.success) setMyEnrollments(enrollmentsRes.data);
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
                // Refetch enrollments so the button state updates immediately
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
            {/* Welcome Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.name}!</h1>
                <p className="text-gray-500 mt-1">Ready for your next lesson?</p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{availableClasses.filter(c => c.enrolledCount > 0).length}</p>
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
                    <p className="text-2xl font-bold text-gray-900">Lvl 4</p>
                    <p className="text-sm text-gray-500 mt-1">Current Mastery</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Available Classes */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            Available Classes
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {availableClasses.map((cls) => {
                                const enrollment = myEnrollments.find(e => e.classId?._id === cls._id);
                                const isEnrolled = !!enrollment;
                                const isPending = enrollment?.status === 'pending';
                                const isActive = enrollment?.status === 'active';

                                return (
                                    <div key={cls._id} className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-bold text-gray-900">{cls.className}</h3>
                                            <span className={cn(
                                                "text-xs font-medium px-2 py-1 rounded-lg",
                                                isActive ? "bg-green-100 text-green-700" :
                                                    isPending ? "bg-orange-100 text-orange-700" :
                                                        "bg-blue-50 text-blue-600"
                                            )}>
                                                {isActive ? "Enrolled" :
                                                    isPending ? "Requested" :
                                                        `${cls.capacity - cls.enrolledCount} spots left`}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-4 text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>{cls.schedule.day}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4" />
                                                <span>{cls.schedule.startTime} - {cls.schedule.endTime}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <GraduationCap className="w-4 h-4" />
                                                <span>{cls.tutorId?.name}</span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEnroll(cls._id)}
                                            disabled={isEnrolled}
                                            className={cn(
                                                "w-full py-2 rounded-xl font-bold text-sm transition-colors",
                                                isEnrolled
                                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                                    : "bg-blue-600 text-white hover:bg-blue-700"
                                            )}
                                        >
                                            {isPending ? 'Request Pending' : isActive ? 'Already Joined' : 'Request to Join'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* My Enrolled Classes */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Dashboard</h2>
                        <div className="space-y-4">
                            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
                                <p className="text-sm font-bold text-indigo-600 mb-1">Academy Rank</p>
                                <p className="text-2xl font-black text-indigo-900">PRODIGY</p>
                                <div className="mt-3 w-full bg-indigo-200 rounded-full h-2">
                                    <div className="bg-indigo-600 h-2 rounded-full w-[70%]" />
                                </div>
                                <p className="text-[10px] text-indigo-500 mt-2 font-bold uppercase tracking-wider">70% to next level</p>
                            </div>

                            <button className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-colors flex items-center justify-center gap-2">
                                <PlayCircle className="w-5 h-5" />
                                Enter Virtual Classroom
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
