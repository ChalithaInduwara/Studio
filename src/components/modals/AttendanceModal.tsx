import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { classService } from '@/services/class.service';

interface AttendanceModalProps {
    session: any;
    onClose: () => void;
}

export function AttendanceModal({ session, onClose }: AttendanceModalProps) {
    const [students, setStudents] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const sessionDate = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const [studentsRes, attendanceRes] = await Promise.all([
                    classService.getClassStudents(session._id),
                    classService.getAttendance(session._id, sessionDate)
                ]);

                if (studentsRes.success) {
                    setStudents(studentsRes.data);
                    // Initialize attendance from previous records if any
                    const initialAttendance: any = {};
                    studentsRes.data.forEach((s: any) => initialAttendance[s._id] = 'present');

                    if (attendanceRes.success && attendanceRes.data?.length > 0) {
                        attendanceRes.data.forEach((rec: any) => {
                            initialAttendance[rec.studentId] = rec.status;
                        });
                    }
                    setAttendance(initialAttendance);
                }
            } catch (error) {
                console.error('Failed to fetch attendance data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudents();
    }, [session._id, sessionDate]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const records = Object.entries(attendance).map(([studentId, status]) => ({
                studentId,
                status
            }));

            const res = await classService.markAttendance({
                classId: session._id,
                sessionDate,
                records
            });

            if (res.success) {
                onClose();
            }
        } catch (error) {
            console.error('Failed to save attendance:', error);
            alert('Failed to save attendance.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl p-6 shadow-xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
                        <p className="text-sm text-gray-500">{session.className} - {new Date().toLocaleDateString()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                ) : (
                    <>
                        <div className="flex-1 overflow-y-auto mb-6">
                            <table className="w-full">
                                <thead className="sticky top-0 bg-white">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">Student</th>
                                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Present</th>
                                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Late</th>
                                        <th className="px-4 py-2 text-center text-sm font-medium text-gray-500">Absent</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {students.map(enrollment => {
                                        const student = enrollment.studentId;
                                        return (
                                            <tr key={student._id}>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">
                                                            {student.name?.charAt(0) || '?'}
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{student.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${student._id}`}
                                                        checked={attendance[student._id] === 'present'}
                                                        onChange={() => setAttendance({ ...attendance, [student._id]: 'present' })}
                                                        className="w-4 h-4 text-green-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${student._id}`}
                                                        checked={attendance[student._id] === 'late'}
                                                        onChange={() => setAttendance({ ...attendance, [student._id]: 'late' })}
                                                        className="w-4 h-4 text-orange-600"
                                                    />
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`attendance-${student._id}`}
                                                        checked={attendance[student._id] === 'absent'}
                                                        onChange={() => setAttendance({ ...attendance, [student._id]: 'absent' })}
                                                        className="w-4 h-4 text-red-600"
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {students.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 italic">
                                                No students enrolled in this class yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex gap-3 pt-4 border-t border-gray-100">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={saving || students.length === 0}
                                className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 flex items-center justify-center"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Attendance'}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
