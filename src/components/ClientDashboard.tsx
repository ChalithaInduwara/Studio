import { useState, useEffect } from 'react';
import {
    Mic2,
    CheckCircle,
    FileAudio,
    Loader2,
    DollarSign,
    Download,
    ChevronRight,
    ChevronLeft,
    Play,
    GraduationCap,
    Upload,
    FileText,
    File,
    Video
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { classService } from '@/services/class.service';
import { NewBookingModal } from './modals/NewBookingModal';
import { PaymentModal } from './modals/PaymentModal';
import { FileUploadModal } from './modals/FileUploadModal';
import { cn } from '@/utils/cn';
import { User } from '@/types';
import { paymentService } from '@/services/payment.service';
import { MiniCalendar } from './MiniCalendar';

const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
const DOWNLOAD_BASE = API_BASE.replace('/api/v1', '');


interface ClientDashboardProps {
    user: User;
}

export function ClientDashboard({ user }: ClientDashboardProps) {
    const [myBookings, setMyBookings] = useState<any[]>([]);
    const [myEnrollments, setMyEnrollments] = useState<any[]>([]);
    const [myPayments, setMyPayments] = useState<any[]>([]);
    const [allFiles, setAllFiles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [selectedBookingForUpload, setSelectedBookingForUpload] = useState<string | undefined>(undefined);

    const fetchData = async () => {
        try {
            const [bookingsRes, paymentsRes, enrollmentsRes] = await Promise.all([
                bookingService.getMyBookings(),
                paymentService.getMyPayments(),
                classService.getMyEnrollments()
            ]);

            let bookings = [];
            if (bookingsRes.success) {
                bookings = bookingsRes.data;
                setMyBookings(bookings);
            }
            if (paymentsRes.success) setMyPayments(paymentsRes.data);
            if (enrollmentsRes.success) setMyEnrollments(enrollmentsRes.data);

            // Consolidate files from all bookings
            const bFiles = bookings.flatMap((b: any) => (b.materials || []).map((m: any) => ({ ...m, source: (b.services?.join(', ') || 'Studio') + ' Session' })));
            // In a real app, we might also fetch class materials here.
            setAllFiles(bFiles.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenPayment = (payment: any) => {
        setSelectedPayment(payment);
        setShowPaymentModal(true);
    };

    const handleOpenUpload = (bookingId: string) => {
        setSelectedBookingForUpload(bookingId);
        setShowUploadModal(true);
    };

    const getFileIcon = (mime: string) => {
        if (mime?.startsWith('image/')) return <Play className="w-4 h-4 text-blue-500" />;
        if (mime?.startsWith('audio/')) return <FileAudio className="w-4 h-4 text-purple-500" />;
        if (mime?.startsWith('video/')) return <Video className="w-4 h-4 text-indigo-500" />;
        if (mime?.includes('pdf')) return <FileText className="w-4 h-4 text-red-500" />;
        return <File className="w-4 h-4 text-gray-500" />;
    };

    const stats = [
        {
            label: 'Total Sessions',
            value: (myBookings.length + myEnrollments.length).toString(),
            icon: Mic2,
            color: 'text-indigo-600',
            bg: 'bg-indigo-50'
        },
        {
            label: 'Academy',
            value: myEnrollments.filter((e: any) => e.status === 'active').length.toString() + ' Classes',
            icon: GraduationCap,
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            label: 'Total Paid',
            value: `LKR ${myPayments.filter((p: any) => p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0).toLocaleString()}`,
            icon: CheckCircle,
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            label: 'Balance Due',
            value: `LKR ${myPayments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + p.amount, 0).toLocaleString()}`,
            icon: DollarSign,
            color: 'text-amber-600',
            bg: 'bg-amber-50'
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
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tight">Studio Dashboard</h1>
                    <p className="text-gray-500 mt-2 text-lg font-medium">Welcome back, {user.name}. You have {myBookings.length + myEnrollments.length} upcoming sessions.</p>
                </div>
                <button
                    onClick={() => setShowBookingModal(true)}
                    className="flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-[1.5rem] font-bold shadow-2xl shadow-gray-200 hover:scale-[1.02] active:scale-[0.98] transition-all group"
                >
                    <Mic2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    Book New Session
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-4 rounded-2xl", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Unified Schedule View */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-8">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Play className="w-5 h-5 text-indigo-600" />
                            </div>
                            Your Schedule
                        </h2>

                        <div className="space-y-4">
                            {/* Classes Section */}
                            {myEnrollments.filter((e: any) => e.status === 'active').map((enrollment: any) => (
                                <div key={enrollment._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[2rem] border border-gray-100 bg-blue-50/30 hover:bg-white hover:shadow-xl hover:shadow-blue-100/20 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-blue-600">
                                            <GraduationCap className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-gray-900 leading-none mb-1">{enrollment.classId?.className}</p>
                                            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Every {enrollment.classId?.schedule?.day} • {enrollment.classId?.schedule?.startTime} - {enrollment.classId?.schedule?.endTime}</p>
                                        </div>
                                    </div>
                                    <span className="mt-4 sm:mt-0 px-4 py-1.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">
                                        Academy Class
                                    </span>
                                </div>
                            ))}

                            {/* Bookings Section */}
                            {myBookings.map((booking: any) => (
                                <div key={booking._id} className="flex flex-col space-y-4 p-6 rounded-[2rem] border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-xl hover:shadow-gray-100/20 transition-all group">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
                                                <Mic2 className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold text-gray-900 leading-none mb-1">{booking.services?.join(', ') || 'Studio'} Session</p>
                                                <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{new Date(booking.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} • {booking.startTime} - {booking.endTime}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-xl font-black text-gray-900">LKR {booking.totalAmount?.toLocaleString()}</p>
                                                <span className={cn(
                                                    "text-[10px] font-black uppercase px-2.5 py-1 rounded-full tracking-widest border transition-colors",
                                                    booking.status === 'confirmed' ? "bg-green-50 text-green-700 border-green-100" :
                                                        booking.status === 'pending' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                            "bg-gray-100 text-gray-400 border-gray-200"
                                                )}>
                                                    {booking.status}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleOpenUpload(booking._id)}
                                                className="w-10 h-10 bg-white border border-gray-200 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 rounded-xl flex items-center justify-center transition-all shadow-sm"
                                                title="Upload Reference Track"
                                            >
                                                <Upload className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Project Files for this booking */}
                                    {booking.materials?.length > 0 && (
                                        <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                                            {booking.materials.map((file: any) => (
                                                <div key={file._id} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-100 shadow-sm transition-all hover:border-indigo-100">
                                                    {getFileIcon(file.mimeType)}
                                                    <span className="text-xs font-bold text-gray-600 truncate max-w-[120px]">{file.title}</span>
                                                    <a
                                                        href={`${DOWNLOAD_BASE}${file.fileUrl}`}
                                                        download={file.fileName}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-gray-400 hover:text-indigo-600"
                                                    >
                                                        <Download className="w-3.5 h-3.5" />
                                                    </a>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {myBookings.length === 0 && myEnrollments.length === 0 && (
                                <div className="text-center py-16 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold mb-4">Your schedule is clear</p>
                                    <button
                                        onClick={() => setShowBookingModal(true)}
                                        className="text-indigo-600 font-black text-sm uppercase tracking-widest hover:text-indigo-700 underline underline-offset-4"
                                    >
                                        Book a new session
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Payments Grid */}
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <DollarSign className="w-5 h-5 text-green-600" />
                            </div>
                            Payments & Invoices
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {myPayments.length > 0 ? (
                                myPayments.map((payment: any) => (
                                    <div key={payment._id} className={cn(
                                        "p-6 rounded-[2rem] border flex flex-col justify-between group transition-all",
                                        payment.status === 'pending' ? "bg-amber-50/30 border-amber-100/50" : "bg-gray-50/30 border-gray-100 hover:border-indigo-100"
                                    )}>
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="font-black text-gray-900 text-lg leading-none">{payment.invoiceNumber || `INV-${payment._id.slice(-6).toUpperCase()}`}</p>
                                                <p className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-widest">{new Date(payment.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase px-2.5 py-1 rounded-lg tracking-widest",
                                                payment.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                            )}>
                                                {payment.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-2xl font-black text-gray-900">LKR {payment.amount?.toLocaleString()}</p>
                                            {payment.status === 'pending' ? (
                                                <button
                                                    onClick={() => handleOpenPayment(payment)}
                                                    className="w-12 h-12 bg-gray-900 text-white rounded-xl shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
                                                >
                                                    <DollarSign className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={async () => {
                                                        const res = await paymentService.downloadInvoice(payment._id);
                                                        const url = window.URL.createObjectURL(new Blob([res.data]));
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.setAttribute('download', `${payment.invoiceNumber || 'invoice'}.pdf`);
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                    }}
                                                    className="w-12 h-12 bg-white text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center hover:bg-indigo-50 transition-colors"
                                                >
                                                    <Download className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 text-center bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-200">
                                    <p className="text-gray-400 font-bold">No payment records found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <MiniCalendar bookings={myBookings} enrollments={myEnrollments} />

                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
                        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <FileAudio className="w-5 h-5 text-purple-600" />
                            Session Files
                        </h3>
                        <div className="space-y-3">
                            {allFiles.length > 0 ? (
                                allFiles.slice(0, 5).map((file: any) => (
                                    <div key={file._id} className="p-3 rounded-xl bg-gray-50 border border-transparent hover:border-purple-100 transition-all group">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                {getFileIcon(file.mimeType)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-gray-900 truncate">{file.title}</p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{file.source}</p>
                                            </div>
                                            <a
                                                href={`${DOWNLOAD_BASE}${file.fileUrl}`}
                                                download={file.fileName}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-white transition-all"
                                            >
                                                <Download className="w-4 h-4" />
                                            </a>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-gray-100">
                                    <FileAudio className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">No project files</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-indigo-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                                <Play className="w-8 h-8 fill-white" />
                            </div>
                            <h3 className="text-2xl font-black mb-3">Premium Support</h3>
                            <p className="text-indigo-50 font-medium mb-8 leading-relaxed opacity-80 uppercase text-[10px] tracking-widest">24/7 Priority Assistance for Studio Clients</p>
                            <button className="w-full py-4 bg-white text-indigo-700 rounded-2xl font-black text-sm hover:translate-y-[-2px] hover:shadow-xl active:translate-y-0 transition-all shadow-lg active:scale-95">
                                CONNECT NOW
                            </button>
                        </div>
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

            {showPaymentModal && selectedPayment && (
                <PaymentModal
                    payment={selectedPayment}
                    onClose={() => {
                        setShowPaymentModal(false);
                        setSelectedPayment(null);
                    }}
                    onSuccess={fetchData}
                />
            )}

            {showUploadModal && (
                <FileUploadModal
                    onClose={() => {
                        setShowUploadModal(false);
                        setSelectedBookingForUpload(undefined);
                    }}
                    onSuccess={() => {
                        fetchData();
                        setShowUploadModal(false);
                        setSelectedBookingForUpload(undefined);
                    }}
                    bookingId={selectedBookingForUpload}
                    materialType="project"
                />
            )}
        </div>
    );
}
