import React, { useState } from 'react';
import {
    X,
    Send,
    MessageCircle,
    AlertCircle,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { supportService } from '@/services/support.service';
import { cn } from '@/utils/cn';
import { User } from '@/types';

interface SupportModalProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
}

export function SupportModal({ user, isOpen, onClose }: SupportModalProps) {
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setLoading(true);
        setStatus('idle');

        try {
            const res = await supportService.sendRequest(message);
            if (res.success) {
                setStatus('success');
                setMessage('');
                setTimeout(() => {
                    onClose();
                    setStatus('idle');
                }, 2000);
            } else {
                setStatus('error');
                setErrorMessage(res.message || 'Failed to send request');
            }
        } catch (error: any) {
            setStatus('error');
            setErrorMessage(error.response?.data?.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-br from-purple-600 to-indigo-600 p-8 flex items-end">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                            <MessageCircle className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white">Get Support</h2>
                            <p className="text-purple-100 text-xs font-bold uppercase tracking-widest">How can we help you today?</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-8">
                    {status === 'success' ? (
                        <div className="text-center py-12 space-y-4 animate-in zoom-in-95 duration-300">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                                <CheckCircle2 className="w-10 h-10" />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900">Request Sent!</h3>
                            <p className="text-gray-500 font-medium">Our team will get back to you shortly at <span className="text-indigo-600 font-bold">{user.email}</span>.</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Describe your issue</label>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Tell us what's happening..."
                                    className="w-full h-40 px-6 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 rounded-3xl outline-none transition-all resize-none font-medium placeholder:text-gray-400"
                                    required
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 animate-in slide-in-from-top-2">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-xs font-bold">{errorMessage}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || !message.trim()}
                                className={cn(
                                    "w-full py-4 rounded-3xl font-black text-white shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3 group",
                                    loading || !message.trim()
                                        ? "bg-gray-200 cursor-not-allowed shadow-none"
                                        : "bg-indigo-600 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98]"
                                )}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Send Support Ticket
                                    </>
                                )}
                            </button>

                            <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                You are signed in as <span className="text-gray-600">{user.name}</span>
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
