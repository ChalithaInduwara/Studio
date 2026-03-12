import { useState } from 'react';
import {
  Music,
  Bell,
  User,
  Menu,
  X,
  Home,
  Calendar,
  GraduationCap,
  Mic2,
  BarChart3,
  Users,
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { notifications as notificationData } from '@/data/mockData';

import { User as UserType } from '@/types';

interface NavbarProps {
  user: UserType;
  onLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export function Navbar({ user, onLogout, isSidebarOpen, setIsSidebarOpen }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notificationData.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        {/* Left side - Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-200">
              <Music className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Studio Sync</h1>
              <p className="text-xs text-gray-500">Studio & Academy</p>
            </div>
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfile(false);
              }}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell className="w-5 h-5 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 py-2 max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                {notificationData.map(notification => (
                  <div
                    key={notification.id}
                    className={cn(
                      "px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-50",
                      !notification.read && "bg-purple-50"
                    )}
                  >
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                    <p className="text-xs text-gray-500 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{notification.date}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => {
                setShowProfile(!showProfile);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700">{user.name}</span>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 py-2">
                <div className="px-4 py-2 border-b border-gray-100">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
                <button
                  onClick={() => {
                    setShowProfile(false);
                    onLogout();
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

interface SidebarProps {
  user: UserType;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function Sidebar({ user, currentPage, setCurrentPage, isOpen, setIsOpen }: SidebarProps) {
  const adminMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'studio', label: 'Studio Bookings', icon: Mic2 },
    { id: 'academy', label: 'Academy Classes', icon: GraduationCap },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const studentMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'academy', label: 'My Classes', icon: GraduationCap },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
  ];

  const menuItems = user.role === 'student' ? studentMenuItems : adminMenuItems;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <nav className="p-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setCurrentPage(item.id);
                setIsOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                currentPage === item.id
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl p-4">
            <p className="text-sm font-medium text-purple-900">Need Help?</p>
            <p className="text-xs text-purple-700 mt-1">Contact support for assistance</p>
            <button className="mt-3 w-full py-2 bg-white text-purple-600 text-sm font-medium rounded-lg shadow-sm hover:shadow transition-shadow">
              Get Support
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
