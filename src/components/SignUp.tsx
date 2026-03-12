import { useState } from 'react';
import { Mail, Lock, User, Music } from 'lucide-react';

import { User as UserType } from '@/types';

interface SignUpProps {
    onSignUp: (user: UserType) => void;
    onNavigateToLogin: () => void;
}

export function SignUp({ onSignUp, onNavigateToLogin }: SignUpProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name && email && password) {
            onSignUp({
                id: 'new-user-id',
                name: name,
                email: email,
                role: 'student'
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                    <Music className="w-10 h-10 text-white transform rotate-3" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Join Harmony Hub
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Create an account to get started
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Full Name
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border outline-none transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Email address
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border outline-none transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg p-2.5 border outline-none transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:shadow-md"
                            >
                                Create Account
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <button
                                onClick={onNavigateToLogin}
                                className="w-full flex justify-center py-2.5 px-4 border shadow-sm text-sm font-medium rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 border-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                            >
                                Sign in instead
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
