import { useState, useEffect } from 'react';
import { authService } from '@/services/auth.service';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageRenderer } from '@/routes/PageRenderer';
import { User } from '@/types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const res = await authService.getMe();
          if (res.success) {
            setUser(res.data);
          }
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthLayout onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage}>
      <PageRenderer user={user} currentPage={currentPage} />
    </DashboardLayout>
  );
}
