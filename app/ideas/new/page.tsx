'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Lightbulb } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationSystem';

export default function NewIdeaPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { showNotification } = useNotification();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!session?.user?.id) {
            showNotification('error', 'Je moet ingelogd zijn om een idee te plaatsen');
            return;
        }
        if (!title) {
            showNotification('error', 'Titel is verplicht');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'IDEA',
                    title,
                    content,
                    authorId: session.user.id,
                    status: 'Nieuw',
                    category: category || undefined,
                }),
            });
            const data = await res.json();
            if (data.id) {
                showNotification('success', 'Idee geplaatst!');
                router.push('/ideas');
            } else {
                showNotification('error', 'Fout bij plaatsen: ' + data.error);
            }
        } catch (err) {
            console.error(err);
            showNotification('error', 'Systeemfout');
        } finally {
            setLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold text-dark mb-2">Log in om een idee te plaatsen</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <h1 className="text-3xl font-bold text-dark mb-6 flex items-center gap-2">
                    <Lightbulb className="w-6 h-6" /> Nieuw idee
                </h1>
                <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">Titel</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full input"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">Beschrijving</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full textarea"
                            rows={4}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-dark mb-1">Categorie (optioneel)</label>
                        <input
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full input"
                        />
                    </div>
                    <button disabled={loading} className="btn btn-primary">
                        {loading ? 'Bezig...' : 'Plaats idee'}
                    </button>
                </form>
            </div>
        </div>
    );
}