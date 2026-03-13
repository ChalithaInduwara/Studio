import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Mic2,
  GraduationCap,
  Clock,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { bookingService } from '@/services/booking.service';
import { classService } from '@/services/class.service';
import { paymentService } from '@/services/payment.service';

export function Analytics() {
  const [data, setData] = useState<any>({
    bookings: [],
    classes: [],
    payments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [bookingsRes, classesRes, paymentsRes] = await Promise.all([
          bookingService.getAll(),
          classService.getAll(),
          paymentService.getAll()
        ]);

        setData({
          bookings: bookingsRes.success ? bookingsRes.data : [],
          classes: classesRes.success ? classesRes.data : [],
          payments: paymentsRes.success ? paymentsRes.data : []
        });
      } catch (error) {
        console.error('Failed to fetch analytics data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  const totalStudioRevenue = data.payments.filter((p: any) => p.referenceModel === 'Booking' && p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalAcademyRevenue = data.payments.filter((p: any) => p.referenceModel === 'Class' && p.status === 'paid').reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalRevenue = totalStudioRevenue + totalAcademyRevenue;

  const pendingPayments = data.payments.filter((p: any) => p.status === 'pending').reduce((sum: number, p: any) => sum + p.amount, 0);
  const overduePayments = data.payments.filter((p: any) => p.status === 'failed').reduce((sum: number, p: any) => sum + p.amount, 0);

  const pieData = [
    { name: 'Studio', value: totalStudioRevenue, color: '#8b5cf6' },
    { name: 'Academy', value: totalAcademyRevenue, color: '#3b82f6' }
  ];

  const bookingsByService = [
    { name: 'Recording', count: data.bookings.filter((b: any) => (b.serviceType || b.serviceId?.name || '').toLowerCase().includes('recording')).length, revenue: 0 },
    { name: 'Mixing', count: data.bookings.filter((b: any) => (b.serviceType || b.serviceId?.name || '').toLowerCase().includes('mixing')).length, revenue: 0 },
    { name: 'Mastering', count: data.bookings.filter((b: any) => (b.serviceType || b.serviceId?.name || '').toLowerCase().includes('mastering')).length, revenue: 0 }
  ];

  // Map revenue if available
  bookingsByService.forEach(s => {
    s.revenue = data.payments
      .filter((p: any) => p.referenceModel === 'Booking' && p.status === 'paid')
      .reduce((sum: number, p: any) => sum + p.amount, 0); // Simplified mapping
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track performance and revenue metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              +15%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue (MTD)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              +8%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.bookings.length}</p>
          <p className="text-sm text-gray-500 mt-1">Studio Bookings</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              +12%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.classes.length}</p>
          <p className="text-sm text-gray-500 mt-1">Active Classes</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              0%
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.bookings.length * 2}h</p>
          <p className="text-sm text-gray-500 mt-1">Studio Hours Used</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Studio vs Academy comparison</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[] /* TODO */}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="studio" name="Studio" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="academy" name="Academy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Split */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Split</h2>
            <p className="text-sm text-gray-500">This month</p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">${item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
            <p className="text-sm text-gray-500">Bookings & Classes per day</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[] /* TODO */}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="classes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Service Breakdown</h2>
            <p className="text-sm text-gray-500">Studio services performance</p>
          </div>
          <div className="space-y-4">
            {bookingsByService.map((service, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-900">{service.name}</span>
                  <span className="text-sm text-gray-500">{service.count} bookings</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full"
                      style={{ width: `${(service.revenue / 2000) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">${service.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Payment Status</h2>
            <p className="text-sm text-gray-500">Outstanding amounts</p>
          </div>
          <button className="flex items-center gap-2 text-purple-600 text-sm font-medium hover:underline">
            View All
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Collected</p>
            <p className="text-2xl font-bold text-green-600">${totalRevenue.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">${pendingPayments.toLocaleString()}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-xl">
            <p className="text-sm text-gray-600 mb-1">Overdue</p>
            <p className="text-2xl font-bold text-red-600">${overduePayments.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
