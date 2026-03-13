import { useState, useEffect } from 'react';
import {
    Download,
    Mail,
    Search,
    Filter,
    CheckCircle2,
    Clock,
    AlertCircle,
    Plus,
    FileText,
    Loader2
} from 'lucide-react';
import { paymentService } from '@/services/payment.service';
import { cn } from '@/utils/cn';

export function InvoiceManagement() {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const res = await paymentService.getAll();
                if (res.success) {
                    setPayments(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch payments:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchPayments();
    }, []);

    const filteredInvoices = payments.filter(invoice => {
        const matchesSearch = (invoice.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (invoice.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const calculateTotal = (status?: string) => {
        return payments
            .filter(p => !status || p.status === status)
            .reduce((acc, curr) => acc + curr.amount, 0);
    };

    const stats = [
        {
            label: 'Total Outstanding',
            value: `LKR ${calculateTotal('pending').toLocaleString()}`,
            icon: Clock,
            color: 'text-amber-600',
            bg: 'bg-amber-100'
        },
        {
            label: 'Received Total',
            value: `LKR ${calculateTotal('paid').toLocaleString()}`,
            icon: CheckCircle2,
            color: 'text-green-600',
            bg: 'bg-green-100'
        },
        {
            label: 'Failed Payments',
            value: `LKR ${calculateTotal('failed').toLocaleString()}`,
            icon: AlertCircle,
            color: 'text-red-600',
            bg: 'bg-red-100'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices & Payments</h1>
                    <p className="text-gray-500 mt-1">Manage billing, track payments, and send invoices to clients.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                    <Plus className="w-5 h-5" />
                    Create New Invoice
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", stat.bg)}>
                                <stat.icon className={cn("w-6 h-6", stat.color)} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by client or invoice ID..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="flex-1 sm:flex-none bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-gray-700"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="overdue">Overdue</option>
                        </select>
                    </div>
                </div>

                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50/50 text-left">
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Invoice / Client</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredInvoices.map((invoice) => (
                                <tr key={invoice.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                                <FileText className="w-5 h-5 text-gray-500" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900 leading-none">{invoice.invoiceNumber || 'NEW'}</p>
                                                <p className="text-xs text-gray-500 mt-1">{invoice.userId?.name || 'Unknown'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                            invoice.referenceModel === 'Booking' ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                                        )}>
                                            {invoice.referenceModel || 'Other'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm font-bold text-gray-900">LKR {invoice.amount.toLocaleString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-500">{new Date(invoice.dueDate || invoice.invoiceDate).toLocaleDateString()}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn(
                                            "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                                            invoice.status === 'paid' ? "bg-green-100 text-green-700" :
                                                invoice.status === 'failed' ? "bg-red-100 text-red-700" :
                                                    "bg-amber-100 text-amber-700"
                                        )}>
                                            <div className={cn(
                                                "w-1.5 h-1.5 rounded-full",
                                                invoice.status === 'paid' ? "bg-green-500" :
                                                    invoice.status === 'failed' ? "bg-red-500" :
                                                        "bg-amber-500"
                                            )} />
                                            {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => paymentService.downloadInvoice(invoice._id)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="Download PDF"
                                            >
                                                <Download className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => paymentService.sendInvoiceEmail(invoice._id)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                                                title="Send Email"
                                            >
                                                <Mail className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
