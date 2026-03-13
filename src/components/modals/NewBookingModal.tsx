import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Music, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { studioServiceService } from '@/services/studio-service.service';
import { studioService } from '@/services/studio.service';
import { userService } from '@/services/user.service';
import { User, StudioService, Studio } from '@/types';

interface NewBookingModalProps {
    user: User;
    onClose: () => void;
    onSuccess?: () => void;
}

export function NewBookingModal({ user, onClose, onSuccess }: NewBookingModalProps) {
    const [formData, setFormData] = useState({
        userId: user.role === 'client' ? user._id : '',
        studioId: '',
        serviceType: '',
        date: '',
        startTime: '',
        endTime: '',
        notes: ''
    });

    const [clients, setClients] = useState<User[]>([]);
    const [services, setServices] = useState<StudioService[]>([]);
    const [studios, setStudios] = useState<Studio[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [servicesRes, studiosRes] = await Promise.all([
                    studioServiceService.getAll(),
                    studioService.getAll()
                ]);

                if (servicesRes.success) setServices(servicesRes.data);
                if (studiosRes.success) {
                    setStudios(studiosRes.data);
                    if (studiosRes.data.length > 0) {
                        setFormData(prev => ({ ...prev, studioId: studiosRes.data[0]._id }));
                    }
                }

                if (user.role === 'admin') {
                    const clientsRes = await userService.getByRole('client');
                    if (clientsRes.success) setClients(clientsRes.data);
                }
            } catch (err) {
                console.error('Failed to fetch modal data:', err);
                setError('Failed to load required information');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user.role]);

    const calculateTotal = () => {
        if (!formData.startTime || !formData.endTime || !formData.studioId) return 0;

        const studio = studios.find(s => s._id === formData.studioId);
        if (!studio) return 0;

        const start = formData.startTime.split(':').map(Number);
        const end = formData.endTime.split(':').map(Number);
        const durationHours = (end[0] * 60 + end[1] - (start[0] * 60 + start[1])) / 60;

        return Math.max(0, durationHours * studio.hourlyRate);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (!formData.userId || !formData.studioId || !formData.date || !formData.startTime || !formData.endTime) {
                throw new Error('Please fill in all required fields');
            }

            const response = await bookingService.create(formData);

            if (response.success) {
                onSuccess?.();
                onClose();
            } else {
                throw new Error(response.message || 'Failed to create booking');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl w-full max-w-md p-12 shadow-xl flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-purple-600 animate-spin mb-4" />
                    <p className="text-gray-600 font-medium">Preparing booking form...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white">Book a Session</h2>
                        <p className="text-purple-100 text-sm mt-1">Professional Studio Services</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-xl flex items-start gap-2 text-sm">
                            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {user.role === 'admin' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-purple-500" />
                                Client
                            </label>
                            <select
                                value={formData.userId}
                                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                required
                            >
                                <option value="">Select a client</option>
                                {clients.map(client => (
                                    <option key={client._id} value={client._id}>{client.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <Music className="w-4 h-4 text-purple-500" />
                            Studio Room
                        </label>
                        <select
                            value={formData.studioId}
                            onChange={(e) => setFormData({ ...formData, studioId: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        >
                            <option value="">Select a studio</option>
                            {studios.map(studio => (
                                <option key={studio._id} value={studio._id}>
                                    {studio.name} (LKR {studio.hourlyRate.toLocaleString()}/hr)
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <Music className="w-4 h-4 text-purple-500" />
                            Service Type
                        </label>
                        <select
                            value={formData.serviceType}
                            onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        >
                            <option value="">Select a service</option>
                            {services.map(service => (
                                <option key={service._id} value={service.name}>
                                    {service.name} (LKR {service.price.toLocaleString()} {service.unit})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={formData.date}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-500" />
                                Start Time
                            </label>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-500" />
                                End Time
                            </label>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (Optional)</label>
                        <textarea
                            rows={2}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all placeholder:text-gray-400"
                            placeholder="Gear requests, project details..."
                        />
                    </div>

                    <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-purple-700 font-medium">Estimated Total</span>
                            <span className="text-xl font-bold text-purple-900">LKR {calculateTotal().toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 border border-gray-200 rounded-xl font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-[2] py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-purple-200 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Booking...
                                </>
                            ) : (
                                'Confirm Booking'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
