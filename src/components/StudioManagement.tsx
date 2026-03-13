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
  Edit,
  Loader2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { studioServiceService } from '@/services/studio-service.service';
import { materialService } from '@/services/material.service';
import { NewBookingModal } from './modals/NewBookingModal';
import { cn } from '@/utils/cn';
import { StudioBooking, User as UserType } from '@/types';

type TabType = 'bookings' | 'files' | 'services';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, materialsRes, servicesRes] = await Promise.all([
          bookingService.getAll(),
          materialService.getAll(),
          studioServiceService.getAll()
        ]);

        setBookings(bookingsRes.success ? bookingsRes.data : []);
        setFiles(materialsRes.success ? materialsRes.data : []);
        setServices(servicesRes.success ? servicesRes.data : []);
      } catch (error) {
        console.error('Failed to fetch studio data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = (booking.clientId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const tabs = [
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'files', label: 'Project Files', icon: FileAudio },
    { id: 'services', label: 'Services & Rates', icon: DollarSign },
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
          {/* Filters */}
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
              {filteredBookings.map(booking => (
                <BookingCard key={booking._id} booking={booking} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Files Tab */}
      {activeTab === 'files' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-medium hover:bg-purple-200 transition-colors">
              <Upload className="w-5 h-5" />
              Upload File
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
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {services.map(service => (
            <div key={service._id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Mic2 className="w-6 h-6 text-purple-600" />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-600">LKR {service.price.toLocaleString()}</span>
                <span className="text-gray-500">/hr</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <NewBookingModal
          user={user}
          onClose={() => setShowNewBookingModal(false)}
          onSuccess={() => {
            // Trigger a re-fetch of bookings
            const fetchBookings = async () => {
              const bookingsRes = await bookingService.getAll();
              setBookings(bookingsRes.success ? bookingsRes.data : []);
            };
            fetchBookings();
          }}
        />
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: StudioBooking }) {
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
            <div className="font-medium text-gray-900">{booking.userId.name}</div>
            <div className="text-sm text-gray-500">{booking.serviceType}</div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-gray-900">LKR {booking.totalAmount.toLocaleString()}</p>
          <p className="text-xs text-gray-500 text-purple-600">Total</p>
        </div>
        <span className={cn("px-3 py-1 text-xs font-medium rounded-full capitalize", statusColors[booking.status as keyof typeof statusColors])}>
          {booking.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date(booking.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{booking.startTime} - {booking.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>LKR {booking.totalAmount?.toLocaleString() || '0'}</span>
        </div>
      </div>

      {
        booking.status === 'pending' && (
          <div className="flex gap-2 pt-4 border-t border-gray-100">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-colors">
              <CheckCircle className="w-4 h-4" />
              Confirm
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors">
              <XCircle className="w-4 h-4" />
              Cancel
            </button>
          </div>
        )
      }
    </div >
  );
}

// Shared NewBookingModal component is now in @/components/modals/NewBookingModal.tsx
