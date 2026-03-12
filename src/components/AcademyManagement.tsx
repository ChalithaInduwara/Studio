import { useState } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  Filter,
  Clock,
  Users,
  Video,
  MapPin,
  Calendar,
  User,
  ExternalLink,
  X,
  Repeat,
  CheckCircle
} from 'lucide-react';
import { classSessions, users } from '@/data/mockData';
import { cn } from '@/utils/cn';
import { ClassSession } from '@/types';

type TabType = 'classes' | 'students' | 'tutors';

export function AcademyManagement() {
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showNewClassModal, setShowNewClassModal] = useState(false);

  const students = users.filter(u => u.role === 'student');
  const tutors = users.filter(u => u.role === 'tutor');

  const filteredClasses = classSessions.filter(session => {
    const matchesSearch = session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.tutorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || session.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const tabs = [
    { id: 'classes', label: 'Classes', icon: Calendar },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'tutors', label: 'Tutors', icon: GraduationCap },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Music Academy</h1>
          <p className="text-gray-500 mt-1">Manage classes, students, and tutors</p>
        </div>
        <button
          onClick={() => setShowNewClassModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-200 hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          New Class
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{classSessions.length}</p>
              <p className="text-sm text-gray-500">Active Classes</p>
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
              <p className="text-sm text-gray-500">Enrolled Students</p>
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
              <p className="text-sm text-gray-500">Tutors</p>
            </div>
          </div>
        </div>
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

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredClasses.map(session => (
              <ClassCard key={session.id} session={session} />
            ))}
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
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tutors.map(tutor => (
            <div key={tutor.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <User className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{tutor.name}</h3>
                  <p className="text-sm text-gray-500">{tutor.email}</p>
                  <p className="text-sm text-gray-500">{tutor.phone}</p>

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Classes:</p>
                    <div className="flex flex-wrap gap-2">
                      {classSessions.filter(c => c.tutorId === tutor.id).map(c => (
                        <span key={c.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                          {c.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Class Modal */}
      {showNewClassModal && (
        <NewClassModal onClose={() => setShowNewClassModal(false)} />
      )}
    </div>
  );
}

function ClassCard({ session }: { session: ClassSession }) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-semibold text-gray-900">{session.title}</h3>
          <p className="text-sm text-gray-500">{session.tutorName}</p>
        </div>
        <span className={cn(
          "px-3 py-1 text-xs font-medium rounded-full flex items-center gap-1",
          session.type === 'online' ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"
        )}>
          {session.type === 'online' ? <Video className="w-3 h-3" /> : <MapPin className="w-3 h-3" />}
          {session.type}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{session.date}</span>
          {session.recurring && (
            <span className="flex items-center gap-1 text-blue-600">
              <Repeat className="w-3 h-3" />
              Weekly
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{session.startTime} - {session.endTime}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>{session.students.length} / {session.maxStudents} students</span>
        </div>
      </div>

      {session.type === 'online' && session.meetingLink && (
        <a
          href={session.meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
        >
          <Video className="w-4 h-4" />
          Join Meeting
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {session.type === 'in-person' && (
        <button className="flex items-center justify-center gap-2 w-full py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
          <CheckCircle className="w-4 h-4" />
          Mark Attendance
        </button>
      )}
    </div>
  );
}

function NewClassModal({ onClose }: { onClose: () => void }) {
  const [isOnline, setIsOnline] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">New Class</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Guitar Basics"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tutor</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Select a tutor</option>
              <option>Sarah Williams</option>
              <option>Mike Chen</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={!isOnline}
                  onChange={() => setIsOnline(false)}
                  className="text-blue-600"
                />
                <span className="text-sm">In-Person</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  checked={isOnline}
                  onChange={() => setIsOnline(true)}
                  className="text-blue-600"
                />
                <span className="text-sm">Online</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Students</label>
            <input
              type="number"
              min="1"
              max="20"
              defaultValue="6"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="recurring" className="rounded text-blue-600" />
            <label htmlFor="recurring" className="text-sm text-gray-700">Recurring weekly class</label>
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
              className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Create Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
