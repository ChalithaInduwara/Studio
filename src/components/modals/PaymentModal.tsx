import { useState } from 'react';
import { X, CreditCard, ShieldCheck, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { cn } from '@/utils/cn';

interface PaymentModalProps {
    payment: any;
    onClose: () => void;
    onSuccess: () => void;
}

export function PaymentModal({ payment, onClose, onSuccess }: PaymentModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [cardData, setCardData] = useState({
        number: '**** **** **** 4242',
        expiry: '12/28',
        cvc: '123'
    });

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setStatus('idle');

        try {
            // Simulate processing delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            const res = await paymentService.pay(payment._id);
            if (res.success) {
                setStatus('success');
                setTimeout(() => {
                    onSuccess();
                    onClose();
                }, 1500);
            } else {
                setStatus('error');
            }
        } catch (error) {
            console.error('Payment failed:', error);
            setStatus('error');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 text-white relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-4 backdrop-blur-sm">
                            <CreditCard className="w-8 h-8" />
                        </div>
                        <h2 className="text-2xl font-bold">Secure Checkout</h2>
                        <p className="text-purple-100/80 text-sm mt-1">Invoice: {payment.invoiceNumber}</p>
                    </div>
                </div>

                <div className="p-8">
                    {status === 'success' ? (
                        <div className="py-12 flex flex-col items-center text-center animate-in fade-in scale-in duration-500">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Payment Successful!</h3>
                            <p className="text-gray-500 mt-2">Your booking is now confirmed.</p>
                        </div>
                    ) : (
                        <form onSubmit={handlePayment} className="space-y-6">
                            {/* Summary */}
                            <div className="bg-gray-50 rounded-2xl p-4 flex justify-between items-center border border-gray-100">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">Total Amount</p>
                                    <p className="text-2xl font-black text-gray-900">LKR {payment.amount?.toLocaleString()}</p>
                                </div>
                                <ShieldCheck className="w-8 h-8 text-green-500" />
                            </div>

                            {/* Card Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Card Number</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            readOnly
                                            value={cardData.number}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white transition-all outline-none font-medium"
                                        />
                                        <CreditCard className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">Expiry</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={cardData.expiry}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white transition-all outline-none font-medium"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">CVC</label>
                                        <input
                                            type="text"
                                            readOnly
                                            value={cardData.cvc}
                                            className="w-full px-5 py-4 bg-gray-50 border-2 border-transparent rounded-2xl focus:border-purple-500 focus:bg-white transition-all outline-none font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {status === 'error' && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p className="text-sm font-medium">Payment could not be processed.</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-purple-200 hover:shadow-2xl hover:shadow-purple-300 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                            >
                                {submitting ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    `Pay LKR ${payment.amount?.toLocaleString()}`
                                )}
                            </button>

                            <p className="text-[10px] text-center text-gray-400 font-medium px-4">
                                This is a secure demo transaction. No real funds will be charged. Powered by StudioSync SecurePay.
                            </p>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
