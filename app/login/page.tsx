'use client';

import { signIn } from 'next-auth/react';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { Hexagon } from 'lucide-react';

function LoginContent() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/';
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await signIn('azure-ad', { callbackUrl });
        } catch (error) {
            console.error('Login error:', error);
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8">
            <div className="text-center mb-8">
                <h2 className="text-xl font-semibold text-dark mb-2">Welkom terug</h2>
                <p className="text-dark-100/70 text-sm">
                    Log in met je bedrijfsaccount om toegang te krijgen tot het platform.
                </p>
            </div>

            <button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-black text-white p-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed shadow-lg font-medium"
            >
                {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <svg className="w-5 h-5" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#f35325" d="M1 1h10v10H1z" />
                        <path fill="#81bc06" d="M12 1h10v10H12z" />
                        <path fill="#05a6f0" d="M1 12h10v10H1z" />
                        <path fill="#ffba08" d="M12 12h10v10H12z" />
                    </svg>
                )}
                <span>{isLoading ? 'Even geduld...' : 'Inloggen met Microsoft'}</span>
            </button>

            <div className="mt-8 text-center">
                <p className="text-xs text-dark-100/50">
                    © {new Date().getFullYear()} HubTC. All rights reserved.
                </p>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-light-100 p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="bg-primary p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4 backdrop-blur-sm">
                        <Hexagon className="w-8 h-8 text-white fill-current" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">HubTC</h1>
                    <p className="text-primary-100">Travel Counsellors Community</p>
                </div>

                {/* Login Content wrapped in Suspense */}
                <Suspense fallback={
                    <div className="p-12 flex justify-center">
                        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                    </div>
                }>
                    <LoginContent />
                </Suspense>
            </div>
        </div>
    );
}
