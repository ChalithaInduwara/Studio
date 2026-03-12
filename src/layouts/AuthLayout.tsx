import { useState } from 'react';
import { Login } from '@/components/Login';
import { SignUp } from '@/components/SignUp';
import { User } from '@/types';

interface AuthLayoutProps {
    onLoginSuccess: (user: User) => void;
}

export function AuthLayout({ onLoginSuccess }: AuthLayoutProps) {
    const [authView, setAuthView] = useState<'login' | 'signup'>('login');

    if (authView === 'login') {
        return <Login onLogin={onLoginSuccess} onNavigateToSignUp={() => setAuthView('signup')} />;
    }
    return <SignUp onSignUp={onLoginSuccess} onNavigateToLogin={() => setAuthView('login')} />;
}
