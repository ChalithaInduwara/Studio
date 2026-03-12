import { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  User,
  Mail,
  Phone,
  Shield,
  X,
  Edit,
  MoreVertical
} from 'lucide-react';
import { users } from '@/data/mockData';
import { cn } from '@/utils/cn';
import { UserRole } from '@/types';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const roleColors: Record<UserRole, string> = {
    admin: 'bg-red-100 text-red-700',
    tutor: 'bg-purple-100 text-purple-700',
    student: 'bg-blue-100 text-blue-700',
    studio_client: 'bg-green-100 text-green-700'
  };

  const roleLabels: Record<UserRole, string> = {
    admin: 'Administrator',
    tutor: 'Tutor',
    student: 'Student',
    studio_client: 'Studio Client'
  };

  const roleCounts = {
    all: users.length,
    admin: users.filter(u => u.role === 'admin').length,
    tutor: users.filter(u => u.role === 'tutor').length,
    student: users.filter(u => u.role === 'student').length,
    studio_client: users.filter(u => u.role === 'studio_client').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500 mt-1">Manage all users and their roles</p>
        </div>
        <button 
          onClick={() => setShowAddUserModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-purple-200 hover:shadow-xl transition-shadow"
        >
          <Plus className="w-5 h-5" />
          Add User
        </button>
      </div>

      {/* Role Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.all}</p>
              <p className="text-xs text-gray-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.student}</p>
              <p className="text-xs text-gray-500">Students</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.tutor}</p>
              <p className="text-xs text-gray-500">Tutors</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{roleCounts.studio_client}</p>
              <p className="text-xs text-gray-500">Studio Clients</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="tutor">Tutors</option>
            <option value="student">Students</option>
            <option value="studio_client">Studio Clients</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">User</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden md:table-cell">Contact</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 hidden lg:table-cell">Status</th>
                <th className="px-6 py-4 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-pink-500' :
                        user.role === 'tutor' ? 'bg-gradient-to-br from-purple-500 to-indigo-500' :
                        user.role === 'student' ? 'bg-gradient-to-br from-blue-500 to-cyan-500' :
                        'bg-gradient-to-br from-green-500 to-emerald-500'
                      )}>
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500 md:hidden">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-3 py-1 text-xs font-medium rounded-full",
                      roleColors[user.role]
                    )}>
                      {roleLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal onClose={() => setShowAddUserModal(false)} />
      )}
    </div>
  );
}

function AddUserModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input 
              type="text"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter full name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input 
              type="email"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter email address"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input 
              type="tel"
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter phone number"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option value="">Select a role</option>
              <option value="admin">Administrator</option>
              <option value="tutor">Tutor</option>
              <option value="student">Student</option>
              <option value="studio_client">Studio Client</option>
            </select>
          </div>
          
          <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
            <Shield className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Role-based Access</p>
              <p className="text-xs text-gray-500">User will have access based on their assigned role</p>
            </div>
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
              className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
