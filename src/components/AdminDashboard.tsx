import {
  Calendar,
  DollarSign,
  Users,
  Mic2,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Music,
  GraduationCap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { studioBookings, classSessions, payments, revenueData, users } from '@/data/mockData';
import { cn } from '@/utils/cn';

export function AdminDashboard() {
  const totalStudioRevenue = payments.filter(p => p.type === 'studio' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalAcademyRevenue = payments.filter(p => p.type === 'tuition' && p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
  const totalStudents = users.filter(u => u.role === 'student').length;
  const totalClients = users.filter(u => u.role === 'studio_client').length;
  const pendingBookings = studioBookings.filter(b => b.status === 'pending').length;
  const upcomingClasses = classSessions.filter(c => new Date(c.date) >= new Date()).length;

  const stats = [
    {
      label: 'Studio Revenue',
      value: `$${totalStudioRevenue.toLocaleString()}`,
      change: '+12%',
      up: true,
      icon: Mic2,
      color: 'from-purple-500 to-purple-600'
    },
    {
      label: 'Academy Revenue',
      value: `$${totalAcademyRevenue.toLocaleString()}`,
      change: '+8%',
      up: true,
      icon: GraduationCap,
      color: 'from-blue-500 to-blue-600'
    },
    {
      label: 'Active Students',
      value: totalStudents.toString(),
      change: '+2',
      up: true,
      icon: Users,
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Studio Clients',
      value: totalClients.toString(),
      change: '+1',
      up: true,
      icon: Music,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const todayBookings = studioBookings.filter(b => b.date === '2025-01-15');
  const todayClasses = classSessions.filter(c => c.date === '2025-01-15');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={cn(
                "flex items-center gap-1 text-sm font-medium",
                stat.up ? "text-green-600" : "text-red-600"
              )}>
                {stat.up ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-4">{stat.value}</p>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
              <p className="text-sm text-gray-500">Monthly comparison</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-600">Studio</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Academy</span>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
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
                <Bar dataKey="studio" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="academy" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-sm font-medium text-gray-700">Pending Bookings</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{pendingBookings}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Upcoming Classes</span>
              </div>
              <span className="text-lg font-bold text-blue-600">{upcomingClasses}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl">
              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">Overdue Payments</span>
              </div>
              <span className="text-lg font-bold text-red-600">
                {payments.filter(p => p.status === 'overdue').length}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">This Month</span>
              </div>
              <span className="text-lg font-bold text-green-600">+15%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Bookings */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Studio Bookings</h2>
            <span className="text-sm text-gray-500">Jan 15, 2025</span>
          </div>
          {todayBookings.length > 0 ? (
            <div className="space-y-3">
              {todayBookings.map(booking => (
                <div key={booking.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Mic2 className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{booking.clientName}</p>
                    <p className="text-sm text-gray-500 capitalize">{booking.service} • {booking.startTime} - {booking.endTime}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full",
                    booking.status === 'confirmed' ? "bg-green-100 text-green-700" :
                      booking.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-700"
                  )}>
                    {booking.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No bookings scheduled for today</p>
          )}
        </div>

        {/* Today's Classes */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Classes</h2>
            <span className="text-sm text-gray-500">Jan 15, 2025</span>
          </div>
          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map(classItem => (
                <div key={classItem.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{classItem.title}</p>
                    <p className="text-sm text-gray-500">{classItem.tutorName} • {classItem.startTime} - {classItem.endTime}</p>
                  </div>
                  <span className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full",
                    classItem.type === 'online' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
                  )}>
                    {classItem.type}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No classes scheduled for today</p>
          )}
        </div>
      </div>
    </div>
  );
}
