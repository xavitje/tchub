'use client';

import { useState } from 'react';
import { Search, Book, FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function DocumentationPage() {
    const [searchQuery, setSearchQuery] = useState('');

    const categories = [
        {
            title: 'Aan de slag',
            icon: <Book className="w-6 h-6 text-primary" />,
            articles: [
                { title: 'Inloggen en account beheer', slug: 'account-setup' },
                { title: 'Je profiel instellen', slug: 'profile-setup' },
                { title: 'Navigeren in de Hub', slug: 'navigation' }
            ]
        },
        {
            title: 'Technisch',
            icon: <FileText className="w-6 h-6 text-info" />,
            articles: [
                { title: 'Outlook koppelen', slug: 'outlook-sync' },
                { title: 'Wachtwoord wijzigen', slug: 'password-reset' },
                { title: 'VPN instellingen', slug: 'vpn-setup' }
            ]
        },
        {
            title: 'HR & Beleid',
            icon: <FileText className="w-6 h-6 text-success" />,
            articles: [
                { title: 'Verlof aanvragen', slug: 'leave-request' },
                { title: 'Ziekmelding procedure', slug: 'sick-leave' },
                { title: 'Declaraties indienen', slug: 'expenses' }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-light">
            {/* Hero */}
            <div className="bg-white border-b border-light-300">
                <div className="max-w-5xl mx-auto px-4 py-12 text-center">
                    <h1 className="text-3xl font-bold text-dark mb-4">Documentatie & Kennisbank</h1>
                    <p className="text-dark-100 max-w-2xl mx-auto mb-8">
                        Vind antwoorden, handleidingen en beleidsdocumenten.
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Zoek in artikelen..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 rounded-lg border border-light-300 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-100 w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category) => (
                        <div key={category.title} className="card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-light-200 rounded-lg">
                                    {category.icon}
                                </div>
                                <h2 className="text-xl font-bold text-dark">{category.title}</h2>
                            </div>

                            <ul className="space-y-3">
                                {category.articles.map((article) => (
                                    <li key={article.slug}>
                                        <Link
                                            href={`/support/docs/${article.slug}`}
                                            className="flex items-center justify-between text-dark-100 hover:text-primary group"
                                        >
                                            <span className="group-hover:translate-x-1 transition-transform">{article.title}</span>
                                            <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* FAQ Section Placeholder */}
                <div className="mt-16">
                    <h2 className="text-2xl font-bold text-dark mb-8 text-center">Veelgestelde vragen</h2>
                    <div className="max-w-3xl mx-auto space-y-4">
                        {[1, 2, 3].map((i) => (
                            <details key={i} className="group bg-white border border-light-300 rounded-lg p-4 open:shadow-sm cursor-pointer">
                                <summary className="flex items-center justify-between font-medium text-dark list-none">
                                    <span>Hoe reset ik mijn wachtwoord?</span>
                                    <ChevronRight className="w-5 h-5 text-dark-100 group-open:rotate-90 transition-transform" />
                                </summary>
                                <p className="mt-4 text-dark-100 pl-4 border-l-2 border-primary">
                                    Ga naar je profiel instellingen en klik op "Beveiliging". Hier kun je je wachtwoord wijzigen.
                                    Als je niet meer kunt inloggen, neem dan contact op met IT support.
                                </p>
                            </details>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
