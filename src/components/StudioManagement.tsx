import { useState, useEffect } from 'react';
import {
  Mic2,
  Plus,
  Search,
  Filter,
  Clock,
  DollarSign,
  Download,
  Upload,
  FileAudio,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { studioServiceService } from '@/services/studio-service.service';
import { materialService } from '@/services/material.service';
import { NewBookingModal } from './modals/NewBookingModal';
import { FileUploadModal } from './modals/FileUploadModal';
import { paymentService } from '@/services/payment.service';
import { cn } from '@/utils/cn';
import { User as UserType } from '@/types';

type TabType = 'bookings' | 'files' | 'services' | 'payments';

interface StudioManagementProps {
  user: UserType;
}

export function StudioManagement({ user }: StudioManagementProps) {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  const [bookings, setBookings] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewServiceModal, setShowNewServiceModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | undefined>(undefined);

  const API_BASE = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';
  const DOWNLOAD_BASE = API_BASE.replace('/api/v1', '');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bookingsRes, materialsRes, servicesRes, paymentsRes] = await Promise.all([
        bookingService.getAll(),
        materialService.getAll(),
        studioServiceService.getAll(),
        paymentService.getAll()
      ]);

      setBookings(bookingsRes.success ? bookingsRes.data : []);
      setFiles(materialsRes.success ? materialsRes.data : []);
      setServices(servicesRes.success ? servicesRes.data : []);
      setPayments(paymentsRes.success ? paymentsRes.data : []);
    } catch (error) {
      console.error('Failed to fetch studio data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConfirm = async (id: string) => {
    try {
      const res = await bookingService.confirm(id);
      if (res.success) fetchData();
    } catch (error) {
      console.error('Failed to confirm booking:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      const res = await bookingService.cancel(id);
      if (res.success) fetchData();
    } catch (error) {
      console.error('Failed to cancel booking:', error);
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      const res = await studioServiceService.delete(id);
      if (res.success) fetchData();
    } catch (error) {
      console.error('Failed to delete service:', error);
    }
  };

  const handleDeleteFile = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      const res = await materialService.delete(id);
      if (res.success) fetchData();
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const filteredBookings = bookings.filter((booking: any) => {
    const matchesSearch = (booking.userId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'files', label: 'Project Files', icon: FileAudio },
    { id: 'services', label: 'Services & Rates', icon: DollarSign },
    { id: 'payments', label: 'Payments', icon: CheckCircle },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Studio Management</h1>
          <p className="text-gray-500 mt-1">Manage bookings, files, and services</p>
        </div>
        <button
          onClick={() => setShowNewBookingModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          New Booking
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-purple-600 text-purple-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by client name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredBookings.map((booking: any) => (
                <BookingCard
                  key={booking._id}
                  booking={booking}
                  onConfirm={() => handleConfirm(booking._id)}
                  onCancel={() => handleCancel(booking._id)}
                  onUpload={() => {
                    setSelectedBookingId(booking._id);
                    setShowUploadModal(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-md shadow-purple-100 hover:shadow-lg transition-all"
            >
              <Upload className="w-5 h-5" />
              Upload Project File
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">File Name</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Size</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Date</th>
                  <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map(file => (
                  <tr key={file._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900">{file.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{file.classId?.className || 'Studio'}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{(file.size / 1024).toFixed(1)} KB</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{new Date(file.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`${DOWNLOAD_BASE}${file.fileUrl}`}
                          download={file.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-purple-600 transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </a>
                        <button
                          onClick={() => handleDeleteFile(file._id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          title="Delete"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => setShowNewServiceModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              <Plus className="w-5 h-5" />
              Add Service
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {services.map(service => (
              <div key={service._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 group relative text-center">
                <button
                  onClick={() => handleDeleteService(service._id)}
                  className="absolute top-4 right-4 p-2 text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircle className="w-4 h-4" />
                </button>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mic2 className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-purple-600">LKR {service.price.toLocaleString()}</span>
                  <span className="text-gray-500">{service.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(payment => (
                <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-black text-gray-900">{payment.invoiceNumber || `INV-${payment._id.slice(-6).toUpperCase()}`}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-gray-700">{payment.userId?.name || 'Unknown'}</p>
                    <p className="text-[10px] text-gray-400">{payment.userId?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-black text-indigo-600">LKR {payment.amount?.toLocaleString()}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                      payment.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</p>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-bold">No payment records found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showNewBookingModal && (
        <NewBookingModal
          user={user}
          onClose={() => setShowNewBookingModal(false)}
          onSuccess={() => {
            fetchData();
            setShowNewBookingModal(false);
          }}
        />
      )}

      {/* New Service Modal */}
      {showNewServiceModal && (
        <NewServiceModal
          onClose={() => setShowNewServiceModal(false)}
          onSuccess={() => {
            fetchData();
            setShowNewServiceModal(false);
          }}
        />
      )}

      {/* File Upload Modal */}
      {showUploadModal && (
        <FileUploadModal
          onClose={() => {
            setShowUploadModal(false);
            setSelectedBookingId(undefined);
          }}
          onSuccess={() => {
            fetchData();
            setShowUploadModal(false);
            setSelectedBookingId(undefined);
          }}
          bookingId={selectedBookingId}
          materialType="recording"
        />
      )}
    </div>
  );
}

function NewServiceModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 1500,
    unit: 'per hour',
    duration: 60
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await studioServiceService.create(formData);
      if (res.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create service:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Service</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="e.g., Mixing & Mastering"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Service details..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (LKR)</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="per hour">per hour</option>
                <option value="per session">per session</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (mins)</label>
            <input
              type="number"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-purple-600 text-white rounded-xl font-medium hover:shadow-lg disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingCard({ booking, onConfirm, onCancel, onUpload }: {
  booking: any,
  onConfirm: () => void,
  onCancel: () => void,
  onUpload: () => void
}) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700'
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{booking.userId?.name || 'Client'}</div>
            <div className="text-sm text-gray-500 text-purple-600">{booking.services?.join(', ') || 'Studio'}</div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">LKR {Math.abs(booking.totalAmount || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(booking.date).toLocaleDateString()}</span>
          </div>
          <span className={cn("px-3 py-1 text-xs font-medium rounded-full capitalize", statusColors[booking.status as keyof typeof statusColors])}>
            {booking.status}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{booking.startTime} - {booking.endTime}</span>
        </div>
      </div>

      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={onUpload}
          className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
        {booking.status === 'pending' && (
          <>
            <button
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Confirm
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}
