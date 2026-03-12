import { useState } from 'react';
import { Navbar, Sidebar } from '@/components/Navbar';
import { User } from '@/types';

interface DashboardLayoutProps {
    user: User;
    onLogout: () => void;
    currentPage: string;
    setCurrentPage: (page: string) => void;
    children: React.ReactNode;
}

export function DashboardLayout({ user, onLogout, currentPage, setCurrentPage, children }: DashboardLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <Navbar
                user={user}
                onLogout={onLogout}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Sidebar */}
            <Sidebar
                user={user}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />

            {/* Main Content */}
            <main className="lg:ml-64 p-4 lg:p-6 pt-4">
                {children}
            </main>
        </div>
    );
}
