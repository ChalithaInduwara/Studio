import { useState, useEffect } from 'react';
import {
    Mic2,
    Calendar,
    CheckCircle,
    FileAudio,
    Loader2,
    DollarSign,
    Download
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { NewBookingModal } from './modals/NewBookingModal';
import { cn } from '@/utils/cn';
import { StudioBooking, User } from '@/types';

import { paymentService } from '@/services/payment.service';

interface ClientDashboardProps {
    user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
    const [myBookings, setMyBookings] = useState<StudioBooking[]>([]);
    const [myPayments, setMyPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);

    const fetchData = async () => {
        try {
            const [bookingsRes, paymentsRes] = await Promise.all([
                bookingService.getMyBookings(),
                paymentService.getMyPayments()
            ]);
            if (bookingsRes.success) setMyBookings(bookingsRes.data);
            if (paymentsRes.success) setMyPayments(paymentsRes.data);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePay = async (paymentId: string) => {
        try {
            const res = await paymentService.pay(paymentId);
            if (res.success) {
                alert('Payment successful! (Dummy Gateway)');
                fetchData();
            }
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed. Please try again.');
        }
    };

    const stats = [
        {
            label: 'Your Bookings',
            value: myBookings.length.toString(),
            icon: Mic2,
            color: 'bg-purple-100 text-purple-600'
        },
        {
            label: 'Pending Payments',
            value: myPayments.filter((p: any) => p.status === 'pending').length.toString(),
            icon: DollarSign,
            color: 'bg-amber-100 text-amber-600'
        },
        {
            label: 'Total Paid',
            value: `LKR ${myPayments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0).toLocaleString()}`,
            icon: CheckCircle,
            color: 'bg-green-100 text-green-600'
        },
        {
            label: 'Next Session',
            value: myBookings.length > 0
                ? new Date(myBookings.filter((b: any) => b.status !== 'cancelled')[0]?.date || Date.now()).toLocaleDateString()
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
                                myBookings.map((booking: any) => (
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
                            <DollarSign className="w-5 h-5 text-green-600" />
                            Payments & Invoices
                        </h2>
                        <div className="space-y-4">
                            {myPayments.length > 0 ? (
                                myPayments.map((payment: any) => (
                                    <div key={payment._id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100">
                                        <div>
                                            <p className="font-medium text-gray-900">{payment.invoiceNumber}</p>
                                            <p className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900">LKR {payment.amount.toLocaleString()}</p>
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase px-2 py-0.5 rounded-full",
                                                    payment.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                                )}>
                                                    {payment.status}
                                                </span>
                                            </div>
                                            {payment.status === 'pending' && (
                                                <button
                                                    onClick={() => handlePay(payment._id)}
                                                    className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 transition-colors"
                                                >
                                                    Pay Now
                                                </button>
                                            )}
                                            {payment.status === 'paid' && (
                                                <button
                                                    onClick={async () => {
                                                        const res = await paymentService.downloadInvoice(payment._id);
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `${payment.invoiceNumber}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                                                    title="Download Invoice"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4 text-sm italic">No payment records found.</p>
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
                    <div className="bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl p-4 text-white shadow-lg">
                        <h3 className="text-lg font-bold mb-2">Need Support?</h3>
                        <p className="text-purple-100 text-sm mb-4">Contact us for any help with your session.</p>
                        <button className="w-full py-2 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-purple-50 transition-colors">
                            Support
                        </button>
                    </div>
                </div>
            </div>

            {showBookingModal && (
                <NewBookingModal
                    user={user}
                    onClose={() => setShowBookingModal(false)}
                    onSuccess={fetchData}
                />
            )}
        </div>
    );
}
