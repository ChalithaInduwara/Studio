import { useState, useEffect } from 'react';
import {
    Calendar,
    Mic2,
    FileAudio,
    Loader2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { NewBookingModal } from './modals/NewBookingModal';
import { cn } from '@/utils/cn';
import { User, StudioBooking } from '@/types';

interface ClientDashboardProps {
    user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
    const [myBookings, setMyBookings] = useState<StudioBooking[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const fetchBookings = async () => {
        try {
            const res = await bookingService.getMyBookings();
            if (res.success) {
                setMyBookings(res.data);
            }
        } catch (error) {
            console.error('Failed to fetch bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const stats = [
        {
            label: 'Your Bookings',
            value: myBookings.length.toString(),
            icon: Mic2,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            label: 'Project Files',
            value: '0',
            icon: FileAudio,
            color: 'bg-indigo-100 text-indigo-600'
        },
        {
            label: 'Total Spending',
            value: `LKR ${myBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0).toLocaleString()}`,
            icon: Mic2,
            color: 'bg-green-100 text-green-600'
        },
        {
            label: 'Next Session',
            value: myBookings.length > 0
                ? new Date(myBookings.filter(b => b.status !== 'cancelled')[0]?.date || Date.now()).toLocaleDateString()
                : 'None',
            icon: Calendar,
            color: 'bg-blue-100 text-blue-600'
        }
    ];

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Studio Portal</h1>
                    <p className="text-gray-500 mt-1">Manage your recordings, bookings, and project files.</p>
                </div>
                <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg hover:shadow-purple-200 transition-all active:scale-95"
                >
                    <Mic2 className="w-5 h-5" />
                    Book New Session
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
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
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <Mic2 className="w-5 h-5 text-purple-600" />
                                Upcoming Bookings
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {myBookings.length > 0 ? (
                                myBookings.map((booking) => (
                                    <div key={booking._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                                                <Calendar className="w-5 h-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500 line-clamp-1">{booking.serviceType || 'Studio'} Session</p>
                                                <p className="text-sm text-gray-500">{new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">LKR {booking.totalAmount?.toLocaleString()}</p>
                                                <p className="text-xs text-gray-400">Total</p>
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wider",
                                                booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                                                    booking.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                        booking.status === 'cancelled' ? "bg-red-100 text-red-700" :
                                                            "bg-gray-100 text-gray-700"
                                            )}>
                                                {booking.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                    <p className="text-gray-500">You don't have any upcoming bookings.</p>
                                    <button
                                        onClick={() => setShowBookingModal(true)}
                                        className="mt-2 text-purple-600 font-bold text-sm hover:underline"
                                    >
                                        Schedule your first session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <FileAudio className="w-5 h-5 text-indigo-600" />
                            Recent Project Files
                        </h2>
                        <p className="text-gray-500 text-center py-8">No files shared yet.</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-2">Need Engineering?</h3>
                        <p className="text-purple-100 text-sm mb-4">Our world-class engineers are available for your mixing and mastering needs.</p>
                        <button className="w-full py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-purple-50 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>

            {showBookingModal && (
                <NewBookingModal
                    user={user}
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={fetchBookings}
                />
            )}
        </div>
    );
}
