'use client';

import { useSearchParams } from 'next/navigation';
import { AlertCircle } from 'lucide-react';
import { Suspense } from 'react';

function ErrorContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    let errorMessage = "Er is een fout opgetreden bij het inloggen.";

    // Map NextAuth error codes to user friendly messages
    switch (error) {
        case 'Configuration':
            errorMessage = "Er is een probleem met de server configuratie.";
            break;
        case 'AccessDenied':
            errorMessage = "Toegang geweigerd. Je hebt geen rechten om in te loggen.";
            break;
        case 'Verification':
            errorMessage = "De verificatie is mislukt of verlopen.";
            break;
        case 'OAuthSignin':
        case 'OAuthCallback':
        case 'OAuthCreateAccount':
        case 'EmailCreateAccount':
        case 'Callback':
            errorMessage = "Er is een fout opgetreden bij de authenticatie provider.";
            break;
        case 'OAuthAccountNotLinked':
            errorMessage = "Dit emailadres is al gekoppeld aan een ander account.";
            break;
        case 'SessionRequired':
            errorMessage = "Je moet ingelogd zijn om deze pagina te bekijken.";
            break;
        case 'Default':
        default:
            break;
    }

    return (
        <div className="flex flex-col items-center text-center max-w-md mx-auto p-6 bg-white rounded-xl shadow-lg border border-light-400">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-error" />
            </div>
            <h1 className="text-2xl font-bold text-dark mb-2">Inloggen mislukt</h1>
            <p className="text-dark-100 mb-6">{errorMessage}</p>
            <a href="/api/auth/signin" className="btn btn-primary w-full justify-center">
                Probeer opnieuw
            </a>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-light-100 p-4">
            <Suspense fallback={<div>Laden...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    );
}
