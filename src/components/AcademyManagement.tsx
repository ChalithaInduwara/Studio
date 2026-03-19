import { useState, useEffect } from 'react';
import { GraduationCap, Plus, Search, Filter, Clock, Users, Video, MapPin, Calendar, User as UserIcon, ExternalLink, X, Repeat, CheckCircle, Loader2 } from 'lucide-react';
import { classService } from '@/services/class.service';
import { userService } from '@/services/user.service';
import { cn } from '@/utils/cn';
import { User } from '@/types';
import { AttendanceModal } from './modals/AttendanceModal';

type TabType = 'classes' | 'students' | 'tutors' | 'requests';

interface AcademyManagementProps {
  user?: User;
}

export function AcademyManagement({ user }: AcademyManagementProps = {}) {
  const isAdmin = user?.role === 'admin';
  const isTutor = user?.role === 'tutor';
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [showNewClassModal, setShowNewClassModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState<{ show: boolean, session: any }>({ show: false, session: null });
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          // Admin gets all classes, all users, and all pending enrollment requests
          const [classesRes, usersRes, requestsRes] = await Promise.all([
            classService.getAll(),
            userService.getAll(),
            classService.getPendingRequests()
          ]);
          if (classesRes.success) setClasses(classesRes.data);
          if (usersRes.success) {
            setStudents(usersRes.data.filter((u: any) => u.role === 'student'));
            setTutors(usersRes.data.filter((u: any) => u.role === 'tutor'));
          }
          if (requestsRes.success) setRequests(requestsRes.data);
        } else if (isTutor) {
          // Tutor only sees their own classes
          const classesRes = await classService.getMyClasses();
          if (classesRes.success) setClasses(classesRes.data);
        } else {
          // Students and others just see all available classes
          const classesRes = await classService.getAll();
          if (classesRes.success) setClasses(classesRes.data);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin, isTutor]);

  const handleApprove = async (requestId: string) => {
    try {
      const res = await classService.approveEnrollment(requestId);
      if (res.success) {
        setRequests(prev => prev.filter(r => r._id !== requestId));
        // Refresh classes to update enrollment count
        const classesRes = await classService.getAll();
        if (classesRes.success) setClasses(classesRes.data);
      }
    } catch (error) {
      console.error('Failed to approve enrollment:', error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      const res = await classService.rejectEnrollment(requestId);
      if (res.success) {
        setRequests(prev => prev.filter(r => r._id !== requestId));
      }
    } catch (error) {
      console.error('Failed to reject enrollment:', error);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete class "${name}"?`)) return;
    try {
      const res = await classService.delete(id);
      if (res.success) {
        setClasses(prev => prev.filter(c => c._id !== id));
      }
    } catch (error) {
      console.error('Failed to delete class:', error);
      alert('Failed to delete class.');
    }
  };

  const filteredClasses = classes.filter(session => {
    const matchesSearch = (session.className || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (session.tutorId?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'online' ? session.onlineLink : !session.onlineLink);

    // Archiving logic: if not recurring and endDate passed, it's archived
    // Or if it's explicitly marked as archived (though we don't have that field yet, let's use date)
    const isPast = session.schedule?.endDate && new Date(session.schedule.endDate) < new Date();
    const matchesStatus = statusFilter === 'archived' ? isPast : !isPast;

    return matchesSearch && matchesType && matchesStatus;
  });

  const tabs = isAdmin ? [
    { id: 'classes', label: 'Classes', icon: Calendar },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'tutors', label: 'Tutors', icon: GraduationCap },
    { id: 'requests', label: `Requests (${requests.length})`, icon: CheckCircle },
  ] : [
    // Tutors and students only see Classes tab
    { id: 'classes', label: 'My Classes', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Music Academy</h1>
          <p className="text-gray-500 mt-1">Manage classes, students, and tutors</p>
        </div>
        {(isAdmin || isTutor) && (
          <button
            onClick={() => setShowNewClassModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            New Class
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{classes.length}</p>
              <p className="text-sm text-gray-500">Total Classes</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              <p className="text-sm text-gray-500">Total Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{tutors.length}</p>
              <p className="text-sm text-gray-500">Active Tutors</p>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as TabType)}
            className={cn(
              "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Classes Tab */}
      {activeTab === 'classes' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search classes or tutors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  onClick={() => setStatusFilter('active')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    statusFilter === 'active' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Active
                </button>
                <button
                  onClick={() => setStatusFilter('archived')}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                    statusFilter === 'archived' ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  )}
                >
                  Archived
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Types</option>
                  <option value="in-person">In-Person</option>
                  <option value="online">Online</option>
                </select>
              </div>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClasses.length > 0 ? filteredClasses.map(session => (
              <ClassCard
                key={session._id}
                session={session}
                isAdmin={isAdmin}
                isTutor={isTutor}
                onDelete={() => handleDeleteClass(session._id, session.className)}
                onMarkAttendance={() => setShowAttendanceModal({ show: true, session })}
              />
            )) : (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-dashed border-gray-200">
                No {statusFilter} classes found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Students Tab */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Student</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.map(student => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{student.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{student.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{student.phone}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 text-sm font-medium hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tutors Tab */}
      {activeTab === 'tutors' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Tutor</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden sm:table-cell">Email</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Phone</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Specialization</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tutors.map(tutor => (
                <tr key={tutor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{tutor.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">{tutor.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{tutor.phone || 'N/A'}</td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                      Professional Tutor
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-blue-600 text-sm font-medium hover:underline">View Profile</button>
                  </td>
                </tr>
              ))}
              {tutors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No tutors found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Enrollment Requests Tab */}
      {activeTab === 'requests' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Student</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Class</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Requested Date</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {requests.length > 0 ? requests.map(request => (
                <tr key={request._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{request.studentId?.name}</p>
                        <p className="text-xs text-gray-500">{request.studentId?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                    {request.classId?.className}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="px-3 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700 transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(request._id)}
                        className="px-3 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No pending enrollment requests
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* New Class Modal */}
      {showNewClassModal && (
        <NewClassModal
          onClose={() => setShowNewClassModal(false)}
          onSuccess={async () => {
            setShowNewClassModal(false);
            const res = await classService.getAll();
            if (res.success) setClasses(res.data);
          }}
        />
      )}

      {/* Attendance Modal */}
      {showAttendanceModal.show && (
        <AttendanceModal
          session={showAttendanceModal.session}
          onClose={() => setShowAttendanceModal({ show: false, session: null })}
        />
      )}
    </div>
  );
}

function ClassCard({ session, isAdmin, isTutor, onDelete, onMarkAttendance }:
  { session: any, isAdmin: boolean, isTutor: boolean, onDelete: () => void, onMarkAttendance: () => void }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative group">
      {isAdmin && (
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 p-2 bg-red-50 text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
          title="Delete Class"
        >
          <X className="w-4 h-4" />
        </button>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{session.className}</h3>
          <p className="text-sm text-gray-500">{session.tutorId?.name || 'Assigned Tutor'}</p>
        </div>
        <span className={cn(
          "px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1",
          session.onlineLink ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
        )}>
          {session.onlineLink ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
          {session.onlineLink ? 'Online' : 'In-Person'}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{session.schedule?.day}</span>
          {session.isRecurring && (
            <span className="flex items-center gap-1 text-blue-600 text-xs font-bold">
              <Repeat className="w-3 h-3" />
              Weekly
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{session.schedule?.startTime} - {session.schedule?.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{session.enrolledCount || 0} / {session.capacity} students</span>
        </div>
      </div>

      <div className="flex gap-2">
        {session.onlineLink && (
          <a
            href={session.onlineLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            <Video className="w-4 h-4" />
            Join
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {(isAdmin || isTutor) && (
          <button
            onClick={onMarkAttendance}
            className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4" />
            Attendance
          </button>
        )}
      </div>
    </div>
  );
}


function NewClassModal({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [tutors, setTutors] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    className: '',
    description: '',
    tutorId: '',
    schedule: {
      day: 'Monday',
      startTime: '',
      endTime: '',
      startDate: new Date().toISOString().split('T')[0]
    },
    capacity: 10,
    isRecurring: false,
    onlineLink: ''
  });

  // Fetch tutors whenever the modal opens
  useEffect(() => {
    userService.getTutors().then(res => {
      if (res.success) setTutors(res.data);
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await classService.create(formData);
      if (res.success) {
        onSuccess();
      }
    } catch (error) {
      console.error('Failed to create class:', error);
      alert('Failed to create class. Check for schedule conflicts.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
            <input
              type="text"
              required
              value={formData.className}
              onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Guitar Basics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe the class..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor</label>
            <select
              required
              value={formData.tutorId}
              onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a tutor</option>
              {tutors.map(tutor => (
                <option key={tutor._id} value={tutor._id}>{tutor.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Day</label>
            <select
              required
              value={formData.schedule.day}
              onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, day: e.target.value } })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                required
                value={formData.schedule.startTime}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, startTime: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                required
                value={formData.schedule.endTime}
                onChange={(e) => setFormData({ ...formData, schedule: { ...formData.schedule, endTime: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="number"
              min="1"
              max="100"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Online Link (Optional)</label>
            <input
              type="url"
              placeholder="https://zoom.us/..."
              value={formData.onlineLink}
              onChange={(e) => setFormData({ ...formData, onlineLink: e.target.value })}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={formData.isRecurring}
              onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="rounded text-blue-600"
            />
            <label htmlFor="recurring" className="text-sm text-gray-700">Recurring weekly class</label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-2 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Class'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
