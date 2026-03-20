import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface MiniCalendarProps {
    bookings: any[];
    enrollments: any[];
}

export function MiniCalendar({ bookings, enrollments }: MiniCalendarProps) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];
        for (let i = 0; i < firstDay; i++) days.push(null);
        for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
        return days;
    };

    const days = getDaysInMonth(currentMonth);
    const monthName = currentMonth.toLocaleString('default', { month: 'long' });

    const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    return (
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-900">{monthName} {currentMonth.getFullYear()}</h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-400">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                    <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
                {days.map((day, i) => {
                    if (!day) return <div key={i} className="h-8" />;
                    const dateStr = day.toISOString().split('T')[0];
                    const dayLabel = dayNames[day.getDay()];

                    const hasBooking = bookings.some(b => b.date.startsWith(dateStr) && b.status !== 'cancelled');
                    const hasClass = enrollments.some(e => {
                        const classData = e.classId || e; // Handle both Enrollment objects and direct Class objects
                        if (!classData.schedule) return false;
                        if (classData.schedule.day !== dayLabel) return false;

                        const classStart = classData.schedule.startDate ? new Date(classData.schedule.startDate) : null;
                        const classEnd = classData.schedule.endDate ? new Date(classData.schedule.endDate) : null;

                        if (classStart && day < classStart) return false;
                        if (classEnd && day > classEnd) return false;

                        return true;
                    });
                    const isToday = day.toDateString() === today.toDateString();

                    return (
                        <div
                            key={i}
                            className={cn(
                                "h-8 flex flex-col items-center justify-center text-xs font-semibold rounded-xl relative cursor-default transition-all",
                                isToday ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "text-gray-600 hover:bg-indigo-50",
                                (hasBooking || hasClass) && !isToday && "bg-indigo-50 text-indigo-600"
                            )}
                        >
                            {day.getDate()}
                            <div className="flex gap-0.5 mt-0.5">
                                {hasBooking && (
                                    <div className={cn("w-1 h-1 rounded-full", isToday ? "bg-white" : "bg-indigo-600")} />
                                )}
                                {hasClass && (
                                    <div className={cn("w-1 h-1 rounded-full", isToday ? "bg-white/60" : "bg-blue-400")} />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
