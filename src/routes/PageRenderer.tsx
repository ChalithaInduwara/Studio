import { AdminDashboard } from '@/components/AdminDashboard';
import { StudentDashboard } from '@/components/StudentDashboard';
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
            return user.role === 'admin' ?
                <AdminDashboard /> :
                <StudentDashboard user={user} />;
        case 'studio':
            return <StudioManagement />;
        case 'academy':
            return <AcademyManagement />;
        case 'calendar':
            return <CalendarView />;
        case 'users':
            return <UserManagement />;
        case 'analytics':
            return <Analytics />;
        default:
            return user.role === 'admin' ?
                <AdminDashboard /> :
                <StudentDashboard user={user} />;
    }
}
