import { AdminDashboard } from '@/components/AdminDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
import { TutorDashboard } from '@/components/TutorDashboard';
import { ClientDashboard } from '@/components/ClientDashboard';
import { InvoiceManagement } from '@/components/InvoiceManagement';
import { StudioManagement } from '@/components/StudioManagement';
import { AcademyManagement } from '@/components/AcademyManagement';
import { CalendarView } from '@/components/CalendarView';
import { UserManagement } from '@/components/UserManagement';
import { Analytics } from '@/components/Analytics';
import { User } from '@/types';

interface PageRendererProps {
    currentPage: string;
    user: User;
}

export function PageRenderer({ currentPage, user }: PageRendererProps) {
    switch (currentPage) {
        case 'dashboard':
            if (user.role === 'admin') return <AdminDashboard />;
            if (user.role === 'tutor') return <TutorDashboard user={user} />;
            if (user.role === 'client') return <ClientDashboard user={user} />;
            return <StudentDashboard user={user} />;
        case 'studio':
            return <StudioManagement user={user} />;
        case 'academy':
            return <AcademyManagement user={user} />;

        case 'calendar':
            return <CalendarView />;
        case 'invoices':
            return <InvoiceManagement />;
        case 'users':
            return <UserManagement />;
        case 'analytics':
            return <Analytics />;
        default:
            if (user.role === 'admin') return <AdminDashboard />;
            if (user.role === 'tutor') return <TutorDashboard user={user} />;
            if (user.role === 'client') return <ClientDashboard user={user} />;
            return <StudentDashboard user={user} />;
    }
}
