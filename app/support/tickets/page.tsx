'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Search, Filter, MessageCircle, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function TicketListPage() {
    const { data: session } = useSession();
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, OPEN, CLOSED

    useEffect(() => {
        async function fetchTickets() {
            try {
                const res = await fetch('/api/support/tickets');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setTickets(data);
                }
            } catch (error) {
                console.error('Failed to fetch tickets:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchTickets();
    }, []);

    const filteredTickets = tickets.filter(ticket => {
        if (filter === 'ALL') return true;
        if (filter === 'OPEN') return ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED';
        if (filter === 'CLOSED') return ticket.status === 'CLOSED' || ticket.status === 'RESOLVED';
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'bg-blue-100 text-blue-700';
            case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-700';
            case 'WAITING_FOR_USER': return 'bg-purple-100 text-purple-700';
            case 'RESOLVED': return 'bg-green-100 text-green-700';
            case 'CLOSED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'OPEN': return 'Open';
            case 'IN_PROGRESS': return 'In Behandeling';
            case 'WAITING_FOR_USER': return 'Wacht op reactie';
            case 'RESOLVED': return 'Opgelost';
            case 'CLOSED': return 'Gesloten';
            default: return status;
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-light flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-5xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                    <Link href="/support" className="flex items-center gap-2 text-dark-100 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Terug naar Support
                    </Link>
                    <Link href="/support/create" className="btn btn-primary">
                        Nieuw Ticket
                    </Link>
                </div>

                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-dark">Mijn Tickets</h1>

                    <div className="flex bg-white rounded-lg border border-light-300 p-1">
                        <button
                            onClick={() => setFilter('ALL')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'ALL' ? 'bg-light-200 text-dark' : 'text-dark-100 hover:text-dark'}`}
                        >
                            Alles
                        </button>
                        <button
                            onClick={() => setFilter('OPEN')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'OPEN' ? 'bg-light-200 text-dark' : 'text-dark-100 hover:text-dark'}`}
                        >
                            Open
                        </button>
                        <button
                            onClick={() => setFilter('CLOSED')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filter === 'CLOSED' ? 'bg-light-200 text-dark' : 'text-dark-100 hover:text-dark'}`}
                        >
                            Gesloten
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {filteredTickets.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-light-300">
                            <Ticket className="w-12 h-12 text-dark-100 mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-dark">Geen tickets gevonden</h3>
                            <p className="text-dark-100 mt-1">Je hebt nog geen support tickets aangemaakt.</p>
                        </div>
                    ) : (
                        filteredTickets.map((ticket) => (
                            <Link
                                key={ticket.id}
                                href={`/support/tickets/${ticket.id}`}
                                className="block bg-white border border-light-300 rounded-xl p-6 hover:shadow-md hover:border-primary transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                            <span className="text-xs text-dark-100 font-medium">
                                                #{ticket.id.slice(-6).toUpperCase()}
                                            </span>
                                            <span className="text-xs text-dark-100">
                                                • {new Date(ticket.createdAt).toLocaleDateString('nl-NL')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-dark mb-1">{ticket.subject}</h3>
                                        <p className="text-sm text-dark-100 line-clamp-1">
                                            {ticket.messages?.[0]?.content || 'Geen preview beschikbaar'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 pl-4">
                                        <div className="text-xs font-bold uppercase tracking-wider text-dark-100 bg-light-200 px-2 py-1 rounded">
                                            {ticket.category}
                                        </div>
                                        {ticket._count?.messages > 0 && (
                                            <div className="flex items-center gap-1 text-xs text-dark-100">
                                                <MessageCircle className="w-3 h-3" />
                                                {ticket._count.messages}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

function Ticket({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2" />
            <path d="M13 17v2" />
            <path d="M13 11v2" />
        </svg>
    )
}
