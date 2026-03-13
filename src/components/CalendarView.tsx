import { useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Mic2,
  GraduationCap,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { bookingService } from '@/services/booking.service';
import { classSessions as mockClasses } from '@/data/mockData';
import { cn } from '@/utils/cn';
import { StudioBooking, ClassSession } from '@/types';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [classes] = useState<ClassSession[]>(mockClasses);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await bookingService.getAll();
        if (res.success) {
          setBookings(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch calendar bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const dayBookings = bookings.filter(b => b.date.startsWith(dateStr));
    const dayClasses = classes.filter(c => c.date.startsWith(dateStr));
    return { dayBookings, dayClasses };
  };

  const checkConflicts = (date: Date) => {
    const { dayBookings, dayClasses } = getEventsForDate(date);

    for (const booking of dayBookings) {
      for (const classSession of dayClasses) {
        const bookingStart = parseInt(booking.startTime.replace(':', ''));
        const bookingEnd = parseInt(booking.endTime.replace(':', ''));
        const classStart = parseInt(classSession.startTime.replace(':', ''));
        const classEnd = parseInt(classSession.endTime.replace(':', ''));

        if (bookingStart < classEnd && bookingEnd > classStart) {
          return true;
        }
      }
    }
    return false;
  };

  const days = getDaysInMonth(currentDate);

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1));
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-500 mt-1">View all bookings and classes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('month')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              view === 'month' ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Month
          </button>
          <button
            onClick={() => setView('week')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              view === 'week' ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            Week
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-purple-500" />
          <span className="text-sm text-gray-600">Studio Booking</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-blue-500" />
          <span className="text-sm text-gray-600">Academy Class</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-sm text-gray-600">Time Conflict</span>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 bg-gray-50">
          {daysOfWeek.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="min-h-[100px] border-t border-r border-gray-100 bg-gray-50" />;
            }

            const { dayBookings, dayClasses } = getEventsForDate(day);
            const hasConflict = checkConflicts(day);
            const isToday = day.toISOString().split('T')[0] === todayStr;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[100px] border-t border-r border-gray-100 p-2 transition-colors hover:bg-gray-50",
                  isToday && "bg-purple-50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-sm font-medium",
                    isToday ? "w-7 h-7 bg-purple-600 text-white rounded-full flex items-center justify-center" : "text-gray-900"
                  )}>
                    {day.getDate()}
                  </span>
                  {hasConflict && (
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  )}
                </div>
                <div className="space-y-1">
                  {dayBookings.slice(0, 2).map(booking => (
                    <div
                      key={booking._id}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs truncate"
                    >
                      <Mic2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{booking.userId?.name || 'Studio'}</span>
                    </div>
                  ))}
                  {dayClasses.slice(0, 2).map(classItem => (
                    <div
                      key={classItem.id}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs truncate"
                    >
                      <GraduationCap className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{classItem.title}</span>
                    </div>
                  ))}
                  {(dayBookings.length + dayClasses.length) > 2 && (
                    <span className="text-xs text-gray-500">
                      +{dayBookings.length + dayClasses.length - 2} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio Bookings - Today</h3>
          <div className="space-y-3">
            {bookings.filter(b => b.date.startsWith(todayStr)).map(booking => (
              <div key={booking._id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{booking.userId?.name || 'Client'}</p>
                  <p className="text-sm text-gray-500">{booking.startTime} - {booking.endTime}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-purple-200 text-purple-700 rounded-full capitalize">
                  {booking.serviceType || 'Studio'}
                </span>
              </div>
            ))}
            {bookings.filter(b => b.date.startsWith(todayStr)).length === 0 && (
              <p className="text-gray-500 text-center py-4">No bookings scheduled for today.</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes - Today</h3>
          <div className="space-y-3">
            {classes.filter(c => c.date.startsWith(todayStr)).map(classItem => (
              <div key={classItem.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{classItem.title}</p>
                  <p className="text-sm text-gray-500">{classItem.startTime} - {classItem.endTime}</p>
                </div>
                <span className={cn(
                  "px-2 py-1 text-xs font-medium rounded-full",
                  classItem.type === 'online' ? "bg-blue-200 text-blue-700" : "bg-green-200 text-green-700"
                )}>
                  {classItem.type}
                </span>
              </div>
            ))}
            {classes.filter(c => c.date.startsWith(todayStr)).length === 0 && (
              <p className="text-gray-500 text-center py-4">No classes scheduled for today.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
