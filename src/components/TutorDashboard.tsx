import { useState, useEffect } from 'react';
import {
    Calendar,
    Users,
    Clock,
    BookOpen,
    CheckCircle2,
    Video,
    FileText,
    Plus,
    Loader2,
    X,
    MapPin
} from 'lucide-react';
import { classService } from '@/services/class.service';
import { cn } from '@/utils/cn';
import { User } from '@/types';

interface TutorDashboardProps {
    user: User;
}

export function TutorDashboard({ user }: TutorDashboardProps) {
    const [myClasses, setMyClasses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingClass, setEditingClass] = useState<any | null>(null);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await classService.getMyClasses();
            if (res.success) {
                setMyClasses(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch classes:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const today = new Date().toLocaleDateString('en-GB', { weekday: 'long' });
    const todayClasses = myClasses.filter(c => c.schedule?.day === today);

    const stats = [
        {
            label: 'Your Classes',
            value: myClasses.length.toString(),
            icon: BookOpen,
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            label: 'Total Students',
            value: myClasses.reduce((acc, curr) => acc + (curr.enrolledCount || 0), 0).toString(),
            icon: Users,
            color: 'bg-emerald-100 text-emerald-600'
        },
        {
            label: 'Active Sessions',
            value: myClasses.filter(c => c.isActive).length.toString(),
            icon: Calendar,
            color: 'bg-amber-100 text-amber-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
                    <p className="text-gray-500 mt-1">Hello, {user.name}! Ready for your sessions today?</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    <Plus className="w-5 h-5" />
                    Add Learning Material
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Today's Schedule */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-indigo-600" />
                            Today's Schedule
                        </h2>
                        <div className="space-y-4">
                            {todayClasses.length > 0 ? (
                                todayClasses.map((session) => (
                                    <div key={session._id} className="group p-4 rounded-2xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/50 transition-all duration-200">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4">
                                                <div className="hidden sm:flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm min-w-[80px]">
                                                    <span className="text-sm font-bold text-indigo-600">{session.schedule?.startTime}</span>
                                                    <span className="text-xs text-gray-400">START</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                        {session.className}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-4 mt-2">
                                                        <span className="flex items-center gap-1.5 text-sm text-gray-500">
                                                            <Users className="w-4 h-4" />
                                                            {session.enrolledCount}/{session.capacity} Students
                                                        </span>
                                                        <span className={cn(
                                                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                                                            session.onlineLink ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                                                        )}>
                                                            {session.onlineLink ? <Video className="w-3.5 h-3.5" /> : null}
                                                            {session.onlineLink ? 'ONLINE' : 'ONSITE'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setEditingClass(session)}
                                                    className="px-4 py-2 text-sm font-bold text-indigo-600 bg-white border border-indigo-100 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                >
                                                    Edit Session
                                                </button>
                                                {session.onlineLink && (
                                                    <a
                                                        href={session.onlineLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                    >
                                                        <Video className="w-5 h-5" />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10">
                                    <p className="text-gray-500">No sessions scheduled for today</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900">Recent Class Activities</h2>
                            <button className="text-sm text-indigo-600 font-medium hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Attendance recorded for Advanced Guitar</p>
                                    <p className="text-xs text-gray-500 mt-1">Today at 10:30 AM</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">New material uploaded: "Intro to Scales.pdf"</p>
                                    <p className="text-xs text-gray-500 mt-1">Yesterday at 4:15 PM</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar panels */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h2>
                        <div className="grid grid-cols-1 gap-3">
                            <button className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <Users className="w-5 h-5 text-indigo-600" />
                                <span className="text-sm font-medium text-gray-700">Student Rosters</span>
                            </button>
                            <button className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <FileText className="w-5 h-5 text-purple-600" />
                                <span className="text-sm font-medium text-gray-700">Exam Materials</span>
                            </button>
                            <button className="flex items-center gap-3 p-3 text-left rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <Calendar className="w-5 h-5 text-amber-600" />
                                <span className="text-sm font-medium text-gray-700">Modify Schedule</span>
                            </button>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white overflow-hidden relative">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-2">Tutor Resources</h3>
                            <p className="text-indigo-100 text-sm mb-4">Access teaching guides, templates, and pedagogical resources.</p>
                            <button className="w-full py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition-colors">
                                Open Resource Hub
                            </button>
                        </div>
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>

            {editingClass && (
                <EditClassModal
                    classData={editingClass}
                    onClose={() => setEditingClass(null)}
                    onSuccess={() => {
                        setEditingClass(null);
                        fetchClasses();
                    }}
                />
            )}
        </div>
    );
}

function EditClassModal({ classData, onClose, onSuccess }: { classData: any, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        className: classData.className,
        description: classData.description || '',
        schedule: {
            day: classData.schedule.day,
            startTime: classData.schedule.startTime,
            endTime: classData.schedule.endTime,
        },
        capacity: classData.capacity,
        onlineLink: classData.onlineLink || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await classService.update(classData._id, formData);
            if (res.success) {
                onSuccess();
            }
        } catch (error) {
            console.error('Failed to update class:', error);
            alert('Failed to update class.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl overflow-y-auto max-h-[90vh]">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Edit Session</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
                        <input
                            type="text"
                            required
                            value={formData.className}
                            onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
                            <select
                                value={formData.schedule.day}
                                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, day: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                                    <option key={day} value={day}>{day}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                            <input
                                type="number"
                                value={formData.capacity}
                                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={formData.schedule.startTime}
                                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, startTime: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={formData.schedule.endTime}
                                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, endTime: e.target.value } })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Online Link</label>
                        <input
                            type="url"
                            value={formData.onlineLink}
                            onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="https://zoom.us/..."
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
