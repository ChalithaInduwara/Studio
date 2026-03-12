import { useState } from 'react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PageRenderer } from '@/routes/PageRenderer';
import { User } from '@/types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <AuthLayout onLoginSuccess={(loggedInUser) => setUser(loggedInUser)} />;
  }

  return (
    <DashboardLayout user={user} onLogout={handleLogout} currentPage={currentPage} setCurrentPage={setCurrentPage}>
      <PageRenderer user={user} currentPage={currentPage} />
    </DashboardLayout>
  );
}
