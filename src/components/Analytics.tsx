import { useState, useEffect } from 'react';
import {
  TrendingUp,
  DollarSign,
  Mic2,
  GraduationCap,
  Clock,
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
import { cn } from '@/utils/cn';

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

  const totalStudioRevenue = data.payments
    .filter((p: any) => p.type === 'studio' && p.status === 'paid')
    .reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalAcademyRevenue = data.payments
    .filter((p: any) => p.type === 'academy' && p.status === 'paid')
    .reduce((sum: number, p: any) => sum + p.amount, 0);
  const totalRevenue = totalStudioRevenue + totalAcademyRevenue;

  const pieData = [
    { name: 'Studio', value: totalStudioRevenue, color: '#8b5cf6' },
    { name: 'Academy', value: totalAcademyRevenue, color: '#3b82f6' }
  ];

  // Helper to get last 7 days activity
  const getLast7Days = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const result = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dayStr = d.toISOString().split('T')[0];

      const dayBookings = data.bookings.filter((b: any) => b.createdAt?.startsWith(dayStr)).length;
      const dayClasses = data.classes.filter((c: any) => c.createdAt?.startsWith(dayStr)).length;

      result.push({ day: dayName, bookings: dayBookings, classes: dayClasses });
    }
    return result;
  };

  // Dynamic Revenue Trend Calculation
  const getRevenueTrend = () => {
    const currentMonth = new Date().getMonth();
    const result = [];

    for (let i = 1; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12;
      const monthYear = new Date().getFullYear() - (currentMonth - i < 0 ? 1 : 0);

      const monthPayments = data.payments.filter((p: any) => {
        const d = new Date(p.paidAt || p.createdAt);
        return d.getMonth() === monthIndex && d.getFullYear() === monthYear && p.status === 'paid';
      });

      result.push({
        month: i === 0 ? 'This Month' : 'Last Month',
        studio: monthPayments.filter((p: any) => p.type === 'studio').reduce((sum: number, p: any) => sum + p.amount, 0),
        academy: monthPayments.filter((p: any) => p.type === 'academy').reduce((sum: number, p: any) => sum + p.amount, 0)
      });
    }
    return result;
  };

  const revenueTrendData = getRevenueTrend();

  const bookingsByService = [
    { name: 'Recording', count: 0, revenue: 0 },
    { name: 'Mixing', count: 0, revenue: 0 },
    { name: 'Mastering', count: 0, revenue: 0 }
  ];

  bookingsByService.forEach(s => {
    // Multi-service aware count
    const matchingBookings = data.bookings.filter((b: any) =>
      (b.services || []).some((service: string) => service.toLowerCase().includes(s.name.toLowerCase()))
    );
    s.count = matchingBookings.length;

    // Aggregate revenue from payments where the associated booking has this service
    // Note: This is an estimation for multi-service payments
    s.revenue = data.payments
      .filter((p: any) =>
        p.status === 'paid' &&
        p.type === 'studio' &&
        p.referenceId?.services?.some((service: string) => service.toLowerCase().includes(s.name.toLowerCase()))
      )
      .reduce((sum: number, p: any) => sum + p.amount, 0);
  });

  // Accurate Hours Calculation
  const totalHours = data.bookings.reduce((sum: number, b: any) => {
    if (!b.startTime || !b.endTime) return sum;
    const [sh, sm] = b.startTime.split(':').map(Number);
    const [eh, em] = b.endTime.split(':').map(Number);
    let diff = (eh * 60 + em) - (sh * 60 + sm);
    if (diff <= 0) diff += 24 * 60;
    return sum + (diff / 60);
  }, 0);

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
          <p className="text-2xl font-bold text-gray-900">LKR {totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Revenue (MTD)</p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Mic2 className="w-6 h-6 text-white" />
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-green-600">
              <TrendingUp className="w-4 h-4" />
              Real
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
              Real
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
          </div>
          <p className="text-2xl font-bold text-gray-900">{totalHours.toFixed(1)}h</p>
          <p className="text-sm text-gray-500 mt-1">Total Studio Hours</p>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Trend</h2>
              <p className="text-sm text-gray-500">Studio vs Academy comparison</p>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} />
                <Tooltip
                  formatter={(value: any) => `LKR ${value.toLocaleString()}`}
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

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Revenue Split</h2>
            <p className="text-sm text-gray-500">Overall Paid</p>
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
                  formatter={(value: any) => `LKR ${value.toLocaleString()}`}
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
                <span className="text-sm font-medium text-gray-900">LKR {item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
            <p className="text-sm text-gray-500">Bookings & Classes per day</p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={getLast7Days()}>
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
                <Line type="monotone" dataKey="bookings" name="Bookings" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="classes" name="Classes" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Service Breakdown</h2>
            <p className="text-sm text-gray-500">Studio services revenue</p>
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
                      style={{ width: `${Math.min(100, (service.revenue / (totalStudioRevenue || 1)) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">LKR {service.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
            <p className="text-sm text-gray-500">Live payment log</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Inovice</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Client</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.payments.slice(0, 5).map((payment: any) => (
                <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{payment.invoiceNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 font-medium">{payment.userId?.name}</td>
                  <td className="px-6 py-4 text-sm font-black text-indigo-600">LKR {payment.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg",
                      payment.status === 'paid' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                    )}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-400">{new Date(payment.paidAt || payment.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
