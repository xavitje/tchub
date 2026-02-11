'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Search, Plus, Ticket, FileText, MessageCircle, ChevronRight, LifeBuoy, Book, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SupportPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');

    const quickLinks = [
        {
            title: 'Stel een vraag',
            description: 'Maak een support ticket aan voor technische problemen of vragen.',
            icon: <MessageCircle className="w-6 h-6 text-primary" />,
            href: '/support/create',
            color: 'bg-primary/10'
        },
        {
            title: 'Mijn Tickets',
            description: 'Bekijk de status van je lopende en gesloten tickets.',
            icon: <Ticket className="w-6 h-6 text-info" />,
            href: '/support/tickets',
            color: 'bg-info/10'
        },
        {
            title: 'Documentatie',
            description: 'Handleidingen, policy documenten en veelgestelde vragen.',
            icon: <Book className="w-6 h-6 text-success" />,
            href: '/support/docs',
            color: 'bg-success/10'
        }
    ];

    const commonTopics = [
        { title: 'Wachtwoord resetten', href: '#' },
        { title: 'Outlook instellen', href: '#' },
        { title: 'VPN verbinding', href: '#' },
        { title: 'Vakantiedagen aanvragen', href: '#' },
    ];

    return (
        <div className="min-h-screen bg-light">
            {/* Hero Section */}
            <div className="bg-white border-b border-light-300">
                <div className="max-w-5xl mx-auto px-4 py-12 md:py-16 text-center">
                    <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-6">
                        <LifeBuoy className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-dark mb-4">
                        Hoe kunnen we je helpen, {session?.user?.name?.split(' ')[0] || 'collega'}?
                    </h1>
                    <p className="text-lg text-dark-100 max-w-2xl mx-auto mb-8">
                        Doorzoek onze kennisbank of neem contact op met support.
                    </p>

                    <div className="relative max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder="Zoek in documentatie..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 rounded-xl border border-light-300 shadow-sm focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                        />
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-dark-100 w-5 h-5" />
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 py-12">
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {quickLinks.map((link) => (
                        <Link
                            key={link.title}
                            href={link.href}
                            className="card p-6 hover:shadow-lg transition-all group border-t-4 border-transparent hover:border-primary"
                        >
                            <div className={`w-12 h-12 ${link.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                {link.icon}
                            </div>
                            <h3 className="text-xl font-bold text-dark mb-2 group-hover:text-primary transition-colors">{link.title}</h3>
                            <p className="text-dark-100 mb-4">{link.description}</p>
                            <div className="flex items-center text-sm font-semibold text-primary">
                                Ga verder <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Popular Topics */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-dark">Veelgezochte onderwerpen</h2>
                            <Link href="/support/docs" className="text-primary text-sm font-semibold hover:underline">
                                Bekijk alles
                            </Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {commonTopics.map((topic) => (
                                <Link
                                    key={topic.title}
                                    href={topic.href}
                                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-light-300 hover:border-primary hover:shadow-sm transition-all group"
                                >
                                    <span className="font-medium text-dark group-hover:text-primary">{topic.title}</span>
                                    <ExternalLink className="w-4 h-4 text-dark-100 group-hover:text-primary opacity-0 group-hover:opacity-100 transition-all" />
                                </Link>
                            ))}
                        </div>

                        {/* Recent Activity Placeholder (Future Feature) */}
                        <div className="card p-6 mt-8 bg-blue-50 border-blue-100">
                            <div className="flex items-start gap-4">
                                <div className="bg-blue-100 p-2 rounded-full">
                                    <Ticket className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-blue-900">Heb je een lopend ticket?</h3>
                                    <p className="text-blue-700 text-sm mt-1">
                                        Je kunt de status van je aanvragen volgen in het ticket overzicht.
                                        We proberen binnen 24 uur te reageren.
                                    </p>
                                    <Link href="/support/tickets" className="inline-block mt-3 text-sm font-bold text-blue-700 hover:text-blue-900 underline">
                                        Naar mijn tickets &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-6">
                        <div className="card p-6">
                            <h3 className="font-bold text-dark mb-4">Direct Contact</h3>
                            <div className="space-y-4 text-sm">
                                <div>
                                    <p className="text-dark-100 font-medium">IT Support</p>
                                    <p className="text-primary font-bold">support@hubtc.com</p>
                                    <p className="text-dark">Unavailable (09:00 - 17:00)</p>
                                </div>
                                <hr className="border-light-300" />
                                <div>
                                    <p className="text-dark-100 font-medium">Noodgevallen (24/7)</p>
                                    <p className="text-error font-bold">+31 20 123 4567</p>
                                </div>
                            </div>
                        </div>

                        <div className="card p-6 bg-dark text-white">
                            <h3 className="font-bold mb-2">Systeem Status</h3>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-3 h-3 bg-success rounded-full animate-pulse"></span>
                                <span className="text-sm font-medium">Alle systemen operationeel</span>
                            </div>
                            <Link href="/status" className="text-xs text-white/70 hover:text-white underline">
                                Bekijk details
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
