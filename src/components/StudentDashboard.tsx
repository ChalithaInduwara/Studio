import { BookOpen, Calendar, Clock, GraduationCap, PlayCircle, Trophy, Music } from 'lucide-react';
import { User } from '@/types';

interface StudentDashboardProps {
    user: User;
}

export function StudentDashboard({ user }: StudentDashboardProps) {

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
                    <p className="text-2xl font-bold text-gray-900">3</p>
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Next Lesson Card */}
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-md">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-indigo-100 text-sm font-medium mb-1">Up Next</p>
                            <h2 className="text-xl font-bold">Guitar Basics</h2>
                            <p className="text-indigo-100 mt-2 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Today at 4:00 PM
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                            <PlayCircle className="w-6 h-6 text-white" />
                        </div>
                    </div>
                    <button className="mt-6 w-full py-2 bg-white text-indigo-600 rounded-lg font-medium text-sm hover:bg-indigo-50 transition-colors">
                        Join Online Room
                    </button>
                </div>

                {/* My Enrolled Classes */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">My Classes</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Guitar Basics</p>
                                <p className="text-sm text-gray-500">Sarah Williams</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                <Music className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-gray-900">Music Theory Workshop</p>
                                <p className="text-sm text-gray-500">Mike Chen</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
