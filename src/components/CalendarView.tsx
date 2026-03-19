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
import { classService } from '@/services/class.service';
import { cn } from '@/utils/cn';
import { StudioBooking } from '@/types';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week'>('month');
  const [bookings, setBookings] = useState<StudioBooking[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, classesRes] = await Promise.all([
          bookingService.getAll(),
          classService.getAll()
        ]);
        if (bookingsRes.success) setBookings(bookingsRes.data);
        if (classesRes.success) setClasses(classesRes.data);
      } catch (error) {
        console.error('Failed to fetch calendar data:', error);
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

  // Map day string to number for comparison
  const dayMap: Record<string, number> = {
    'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6
  };

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
    const dayName = Object.keys(dayMap).find(key => dayMap[key] === date.getDay());

    const dayBookings = bookings.filter(b => b.date.startsWith(dateStr));

    const dayClasses = classes.filter(c => {
      if (c.schedule?.day !== dayName) return false;

      const classStart = c.schedule?.startDate ? new Date(c.schedule.startDate) : null;
      const classEnd = c.schedule?.endDate ? new Date(c.schedule.endDate) : null;

      if (classStart && date < classStart) return false;
      if (classEnd && date > classEnd) return false;

      return true;
    });

    return { dayBookings, dayClasses };
  };

  const checkConflicts = (date: Date) => {
    const { dayBookings, dayClasses } = getEventsForDate(date);

    for (const booking of dayBookings) {
      for (const classSession of dayClasses) {
        const bookingStart = parseInt(booking.startTime.replace(':', ''));
        const bookingEnd = parseInt(booking.endTime.replace(':', ''));
        const classStart = parseInt(classSession.schedule.startTime.replace(':', ''));
        const classEnd = parseInt(classSession.schedule.endTime.replace(':', ''));

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
  const { dayBookings: todayBookings, dayClasses: todayClasses } = getEventsForDate(new Date());

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
                  "min-h-[100px] border-t border-r border-gray-100 p-2 transition-colors hover:bg-gray-50 flex flex-col",
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
                <div className="space-y-1 flex-1 overflow-hidden">
                  {dayBookings.slice(0, 3).map(booking => (
                    <div
                      key={booking._id}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-medium border border-purple-100 truncate"
                      title={`${booking.startTime} - ${booking.endTime}: ${booking.serviceType}`}
                    >
                      <Mic2 className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{booking.serviceType || 'Studio'}</span>
                    </div>
                  ))}
                  {dayClasses.slice(0, 3).map(classItem => (
                    <div
                      key={classItem._id}
                      className="flex items-center gap-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded text-[10px] font-medium border border-blue-100 truncate"
                      title={`${classItem.schedule?.startTime} - ${classItem.schedule?.endTime}: ${classItem.className}`}
                    >
                      <GraduationCap className="w-2.5 h-2.5 flex-shrink-0" />
                      <span className="truncate">{classItem.className}</span>
                    </div>
                  ))}
                  {(dayBookings.length + dayClasses.length) > 3 && (
                    <span className="text-[10px] text-gray-500 font-medium pl-1">
                      +{dayBookings.length + dayClasses.length - 3} more
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Mic2 className="w-5 h-5 text-purple-600" />
            Studio Bookings - Today
          </h3>
          <div className="space-y-3">
            {todayBookings.map(booking => (
              <div key={booking._id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                <div className="w-10 h-10 bg-purple-200 rounded-lg flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-purple-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{booking.userId?.name || 'Studio Client'}</p>
                  <p className="text-sm text-gray-600">{booking.startTime} - {booking.endTime}</p>
                </div>
                <span className="px-2.5 py-1 text-xs font-bold bg-white text-purple-700 rounded-full border border-purple-200 uppercase tracking-wider">
                  {booking.serviceType || 'Studio'}
                </span>
              </div>
            ))}
            {todayBookings.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No bookings scheduled for today.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            Academy Classes - Today
          </h3>
          <div className="space-y-3">
            {todayClasses.map(classItem => (
              <div key={classItem._id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-5 h-5 text-blue-700" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{classItem.className}</p>
                  <p className="text-sm text-gray-600">{classItem.schedule?.startTime} - {classItem.schedule?.endTime}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider",
                    classItem.onlineLink ? "bg-white text-blue-600 border border-blue-200" : "bg-white text-green-600 border border-green-200"
                  )}>
                    {classItem.onlineLink ? 'Online' : 'In-Person'}
                  </span>
                  <p className="text-[10px] text-gray-500 font-medium">with {classItem.tutorId?.name}</p>
                </div>
              </div>
            ))}
            {todayClasses.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <p>No classes scheduled for today.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
