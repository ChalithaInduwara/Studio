import { useState } from 'react';
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
  X
} from 'lucide-react';
import { studioBookings, projectFiles, serviceRates } from '@/data/mockData';
import { cn } from '@/utils/cn';
import { StudioBooking } from '@/types';

type TabType = 'bookings' | 'files' | 'services';

export function StudioManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewBookingModal, setShowNewBookingModal] = useState(false);

  const filteredBookings = studioBookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase());
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

          {/* Bookings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredBookings.map(booking => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
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
                {projectFiles.map(file => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <FileAudio className="w-5 h-5 text-purple-500" />
                        <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{file.clientName}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full capitalize">
                        {file.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{file.fileSize}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{file.uploadDate}</td>
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
          {serviceRates.map(service => (
            <div key={service.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Mic2 className="w-6 h-6 text-purple-600" />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{service.service}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-purple-600">${service.rate}</span>
                <span className="text-gray-500">{service.unit}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Booking Modal */}
      {showNewBookingModal && (
        <NewBookingModal onClose={() => setShowNewBookingModal(false)} />
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
            <p className="font-medium text-gray-900">{booking.clientName}</p>
            <p className="text-sm text-gray-500 capitalize">{booking.service}</p>
          </div>
        </div>
        <span className={cn("px-3 py-1 text-xs font-medium rounded-full capitalize", statusColors[booking.status])}>
          {booking.status}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{booking.date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{booking.startTime} - {booking.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>${booking.totalAmount}</span>
        </div>
      </div>

      {booking.status === 'pending' && (
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
      )}
    </div>
  );
}

function NewBookingModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Booking</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Select a client</option>
              <option>Robert Taylor</option>
              <option>Maria Garcia</option>
              <option>David Lee</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Recording ($100/hr)</option>
              <option>Mixing ($100/hr)</option>
              <option>Mastering ($150/hr)</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input 
              type="date" 
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input 
                type="time" 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input 
                type="time" 
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Any special requirements..."
            />
          </div>
          
          <div className="flex gap-3 pt-4">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Create Booking
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
