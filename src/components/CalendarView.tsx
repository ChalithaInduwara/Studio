import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Mic2,
  GraduationCap,
  AlertTriangle
} from 'lucide-react';
import { studioBookings, classSessions } from '@/data/mockData';
import { cn } from '@/utils/cn';

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 15)); // January 2025
  const [view, setView] = useState<'month' | 'week'>('month');

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

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const bookings = studioBookings.filter(b => b.date === dateStr);
    const classes = classSessions.filter(c => c.date === dateStr);
    return { bookings, classes };
  };

  const checkConflicts = (date: Date) => {
    const { bookings, classes } = getEventsForDate(date);

    // Check for time overlaps between bookings and classes
    for (const booking of bookings) {
      for (const classSession of classes) {
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

            const { bookings, classes } = getEventsForDate(day);
            const hasConflict = checkConflicts(day);
            const isToday = day.toDateString() === new Date(2025, 0, 15).toDateString();

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
                  {bookings.slice(0, 2).map(booking => (
                    <div
                      key={booking.id}
                      className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs truncate"
                    >
                      <Mic2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{booking.clientName}</span>
                    </div>
                  ))}
                  {classes.slice(0, 2).map(classItem => (
                    <div
                      key={classItem.id}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs truncate"
                    >
                      <GraduationCap className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{classItem.title}</span>
                    </div>
                  ))}
                  {(bookings.length + classes.length) > 2 && (
                    <span className="text-xs text-gray-500">
                      +{bookings.length + classes.length - 2} more
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Studio Bookings - Jan 15</h3>
          <div className="space-y-3">
            {studioBookings.filter(b => b.date === '2025-01-15').map(booking => (
              <div key={booking.id} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Mic2 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{booking.clientName}</p>
                  <p className="text-sm text-gray-500">{booking.startTime} - {booking.endTime}</p>
                </div>
                <span className="px-2 py-1 text-xs font-medium bg-purple-200 text-purple-700 rounded-full capitalize">
                  {booking.service}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes - Jan 15</h3>
          <div className="space-y-3">
            {classSessions.filter(c => c.date === '2025-01-15').map(classItem => (
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
          </div>
        </div>
      </div>
    </div>
  );
}
