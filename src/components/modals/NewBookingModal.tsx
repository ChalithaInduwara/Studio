import { useState, useEffect } from 'react';
import { X, Calendar, Clock, Music, FileText, AlertCircle, Loader2, Check } from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { studioServiceService } from '@/services/studio-service.service';
import { studioService } from '@/services/studio.service';
import { userService } from '@/services/user.service';
import { User, StudioService, Studio } from '@/types';
import { cn } from '@/utils/cn';

interface NewBookingModalProps {
    user: User;
    onClose: () => void;
    onSuccess?: () => void;
}

export function NewBookingModal({ user, onClose, onSuccess }: NewBookingModalProps) {
    const [formData, setFormData] = useState({
        userId: user.role === 'client' ? user._id : '',
        studioId: '',
        services: [] as string[],
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

    const toggleService = (serviceName: string) => {
        setFormData(prev => {
            const isSelected = prev.services.includes(serviceName);
            if (isSelected) {
                return { ...prev, services: prev.services.filter(s => s !== serviceName) };
            } else {
                return { ...prev, services: [...prev.services, serviceName] };
            }
        });
    };

    const calculateTotal = () => {
        const { startTime, endTime, studioId, services: selectedServices } = formData;
        if (!startTime || !endTime || !studioId) return 0;

        const studio = studios.find(s => s._id === studioId);
        if (!studio) return 0;

        const startParts = startTime.split(':');
        const endParts = endTime.split(':');

        if (startParts.length !== 2 || endParts.length !== 2) return 0;

        const start = startParts.map(Number);
        const end = endParts.map(Number);

        let minutes = (end[0] * 60 + end[1]) - (start[0] * 60 + start[1]);
        if (minutes <= 0) minutes += 24 * 60;
        const durationHours = minutes / 60;

        let total = durationHours * studio.hourlyRate;

        selectedServices.forEach(sName => {
            const service = services.find(s => s.name === sName);
            if (service) {
                if (service.unit === 'per hour') {
                    total += durationHours * service.price;
                } else {
                    total += service.price;
                }
            }
        });

        return Math.max(0, Math.round(total * 100) / 100);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        try {
            if (!formData.userId || !formData.studioId || !formData.date || !formData.startTime || !formData.endTime) {
                throw new Error('Please fill in all required fields');
            }
            if (formData.services.length === 0) {
                throw new Error('Please select at least one service');
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
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-purple-600 p-8 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                    <div className="relative z-10">
                        <h2 className="text-2xl font-black text-white tracking-tight">Book a Session</h2>
                        <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">Studio Sync Premium</p>
                    </div>
                    <button onClick={onClose} className="relative z-10 p-2 hover:bg-white/10 rounded-xl transition-all text-white active:scale-90">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-start gap-3 text-sm animate-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    {user.role === 'admin' && (
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Client Association</label>
                            <div className="relative group">
                                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <select
                                    value={formData.userId}
                                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-900 appearance-none shadow-sm"
                                    required
                                >
                                    <option value="">Select a client</option>
                                    {clients.map(client => (
                                        <option key={client._id} value={client._id}>{client.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Studio Space</label>
                        <div className="relative group">
                            <Music className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <select
                                value={formData.studioId}
                                onChange={(e) => setFormData({ ...formData, studioId: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-900 appearance-none shadow-sm"
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
                    </div>

                    <div className="space-y-4">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Select Services</label>
                        <div className="grid grid-cols-1 gap-2">
                            {services.map(service => {
                                const isSelected = formData.services.includes(service.name);
                                return (
                                    <button
                                        key={service._id}
                                        type="button"
                                        onClick={() => toggleService(service.name)}
                                        className={cn(
                                            "flex items-center justify-between p-4 rounded-2xl border transition-all text-left group",
                                            isSelected
                                                ? "bg-indigo-50 border-indigo-200 shadow-sm"
                                                : "bg-white border-gray-100 hover:border-indigo-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                                isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-200 group-hover:border-indigo-200"
                                            )}>
                                                {isSelected && <Check className="w-4 h-4 text-white" />}
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-black transition-colors", isSelected ? "text-indigo-900" : "text-gray-700")}>
                                                    {service.name}
                                                </p>
                                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tight">
                                                    LKR {service.price.toLocaleString()} {service.unit}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Session Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                            <input
                                type="date"
                                value={formData.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-900 shadow-sm"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Start</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">End</label>
                            <div className="relative group">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                                <input
                                    type="time"
                                    value={formData.endTime}
                                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all font-bold text-gray-900 shadow-sm"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Additional Notes</label>
                        <textarea
                            rows={3}
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-[1.25rem] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-100 transition-all font-medium text-gray-900 placeholder:text-gray-300 resize-none shadow-sm"
                            placeholder="Gear requests, technical specs..."
                        />
                    </div>

                    <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-50">
                        <div className="bg-gray-900 rounded-[1.5rem] p-6 text-white shadow-2xl shadow-indigo-100">
                            <div className="flex justify-between items-center mb-2 opacity-60">
                                <span className="text-xs font-black uppercase tracking-widest">Total Cost Estimate</span>
                                <span className="text-[10px] font-bold tracking-tight">{formData.services.length} services selected</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-3xl font-black tracking-tighter">LKR {calculateTotal().toLocaleString()}</span>
                                <div className="h-8 w-[1px] bg-white/20 mx-4" />
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-3 px-6 bg-white text-gray-900 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {submitting ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'BOOK NOW'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
