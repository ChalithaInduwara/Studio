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
import { TutorResources } from '@/components/TutorResources';
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
            if (user.role === 'admin') return <StudioManagement user={user} />;
            return <ClientDashboard user={user} />;
        case 'academy':
            if (user.role === 'admin' || user.role === 'tutor') return <AcademyManagement user={user} />;
            return <StudentDashboard user={user} />;
        case 'resources':
            return <TutorResources />;

        case 'calendar':
            return <CalendarView user={user} />;
        case 'invoices':
            if (user.role !== 'admin') return <ClientDashboard user={user} />;
            return <InvoiceManagement />;
        case 'users':
            if (user.role !== 'admin') return <ClientDashboard user={user} />;
            return <UserManagement />;
        case 'analytics':
            if (user.role !== 'admin') return <ClientDashboard user={user} />;
            return <Analytics />;
        default:
            if (user.role === 'admin') return <AdminDashboard />;
            if (user.role === 'tutor') return <TutorDashboard user={user} />;
            if (user.role === 'client') return <ClientDashboard user={user} />;
            return <StudentDashboard user={user} />;
    }
}
