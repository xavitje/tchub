'use client';

import { useSession } from 'next-auth/react';
import { User, Mail, Briefcase, Building2 } from 'lucide-react';

export default function ProfilePage() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-dark mb-2">Log in om je profiel te bekijken</h1>
                </div>
            </div>
        );
    }

    const user = session.user;

    return (
        <div className="min-h-screen bg-light py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="card p-8">
                    {/* Profile Header */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b border-light-400">
                        <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                            {user.image ? (
                                <img
                                    src={user.image}
                                    alt={user.name || 'User'}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <span>{user.name?.substring(0, 2).toUpperCase() || 'U'}</span>
                            )}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-dark mb-2">
                                {user.name || 'Gebruiker'}
                            </h1>
                            <p className="text-dark-100">{user.email}</p>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="space-y-6">
                        <h2 className="text-xl font-semibold text-dark mb-4">Profiel Informatie</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <User className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-dark-100">Naam</p>
                                    <p className="font-medium text-dark">{user.name || 'Niet ingesteld'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-5 h-5 text-info" />
                                </div>
                                <div>
                                    <p className="text-sm text-dark-100">E-mail</p>
                                    <p className="font-medium text-dark">{user.email}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Briefcase className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="text-sm text-dark-100">Rol</p>
                                    <p className="font-medium text-dark">{user.role || 'Employee'}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Building2 className="w-5 h-5 text-warning" />
                                </div>
                                <div>
                                    <p className="text-sm text-dark-100">Organisatie</p>
                                    <p className="font-medium text-dark">Travel Counsellors</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
