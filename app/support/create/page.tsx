'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function CreateTicketPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form State
    const [subject, setSubject] = useState('');
    const [category, setCategory] = useState('TECHNICAL');
    const [priority, setPriority] = useState('NORMAL');
    const [content, setContent] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/support/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject,
                    category,
                    priority,
                    content
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create ticket');
            }

            const ticket = await res.json();
            router.push(`/support/tickets/${ticket.id}`);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-3xl mx-auto px-4 py-8">
                <Link href="/support" className="flex items-center gap-2 text-dark-100 hover:text-primary mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Terug naar Support
                </Link>

                <div className="card p-8">
                    <h1 className="text-2xl font-bold text-dark mb-6">Nieuw Ticket Aanmaken</h1>

                    {error && (
                        <div className="bg-error/10 text-error p-4 rounded-lg mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Onderwerp</label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                className="input"
                                placeholder="Korte beschrijving van het probleem"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Categorie</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="input"
                                >
                                    <option value="TECHNICAL">Technisch Probleem</option>
                                    <option value="HR">HR / Personeelszaken</option>
                                    <option value="TRAVEL">Reizen & Onkosten</option>
                                    <option value="ACCESS">Toegang & Accounts</option>
                                    <option value="OTHER">Overig</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-dark mb-2">Prioriteit</label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="input"
                                >
                                    <option value="LOW">Laag</option>
                                    <option value="NORMAL">Normaal</option>
                                    <option value="HIGH">Hoog</option>
                                    <option value="URGENT">Urgent</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-dark mb-2">Bericht</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="input min-h-[200px]"
                                placeholder="Beschrijf je vraag of probleem zo gedetailleerd mogelijk..."
                                required
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary flex items-center gap-2 px-8"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                                Ticket Versturen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
