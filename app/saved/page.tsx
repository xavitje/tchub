'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bookmark, Clock, BarChart3, Calendar } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function SavedItemsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [savedItems, setSavedItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSavedItems() {
            try {
                const res = await fetch('/api/posts');
                const posts = await res.json();
                // Filter posts that are favorited by the current user
                // The /api/posts route should ideally return favorited status or we filter here
                // For this implementation, we'll fetch all and filter client-side if the API supports it
                // Or we create a specialized API /api/users/me/favorites
                const favoritesRes = await fetch('/api/posts?filter=favorites');
                const data = await favoritesRes.json();
                setSavedItems(data);
            } catch (error) {
                console.error('Failed to fetch saved items:', error);
            } finally {
                setLoading(false);
            }
        }
        if (session?.user?.id) {
            fetchSavedItems();
        }
    }, [session?.user?.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-dark-100 hover:text-primary mb-6 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Terug
                </button>

                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-bold text-dark flex items-center gap-3">
                        <Bookmark className="w-8 h-8 text-primary" />
                        Opgeslagen Items
                    </h1>
                </div>

                {savedItems.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Bookmark className="w-12 h-12 text-dark-400 mx-auto mb-4 opacity-20" />
                        <h2 className="text-xl font-semibold text-dark mb-2">Nog niets opgeslagen</h2>
                        <p className="text-dark-100 mb-6">Bewaar interessante posts, polls of events om ze hier later terug te vinden.</p>
                        <Link href="/discussions" className="btn btn-primary inline-flex items-center gap-2">
                            Ontdek discussies
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {savedItems.map((item) => (
                            <Link
                                key={item.id}
                                href={`/discussions/${item.id}`}
                                className="card p-6 hover:shadow-medium transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${item.type === 'POLL' ? 'bg-orange-100 text-orange-600' :
                                                    item.type === 'EVENT' ? 'bg-purple-100 text-purple-600' :
                                                        'bg-primary-100 text-primary'
                                                }`}>
                                                {item.type}
                                            </span>
                                            <span className="text-xs text-dark-100 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(item.createdAt).toLocaleDateString('nl-NL')}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-dark group-hover:text-primary transition-colors mb-2">
                                            {item.title}
                                        </h3>
                                        <p className="text-sm text-dark-100 line-clamp-2">{item.content}</p>
                                    </div>
                                    <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowLeft className="w-5 h-5 rotate-180" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
