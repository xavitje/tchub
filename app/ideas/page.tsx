'use client';

import { useState, useEffect } from 'react';
import { Lightbulb, TrendingUp, Users, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/ui/NotificationSystem';

export default function IdeasPage() {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [ideas, setIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTab, setSelectedTab] = useState<'trending' | 'new' | 'inProgress' | 'implemented'>('trending');
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

    // fetch ideas based on tab
    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                let url = '/api/posts?type=IDEA';
                if (selectedTab === 'trending') {
                    url += '&sort=trending';
                } else if (selectedTab === 'new') {
                    url += '&sort=new';
                } else if (selectedTab === 'inProgress') {
                    url += `&status=${encodeURIComponent('In Behandeling')}`;
                } else if (selectedTab === 'implemented') {
                    url += `&status=${encodeURIComponent('Geïmplementeerd')}`;
                }

                const res = await fetch(url);
                const data = await res.json();
                if (Array.isArray(data)) {
                    setIdeas(data);
                }
            } catch (error) {
                console.error('Failed to fetch ideas:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [selectedTab, categoryFilter]);

    // stats derived from all ideas (ignore current filter)
    const totalIdeas = ideas.length;
    const implementedCount = ideas.filter((i) => i.status === 'Geïmplementeerd').length;
    const uniqueAuthors = new Set(ideas.map((i) => i.author?.id)).size;
    const totalVotes = ideas.reduce((sum, i) => sum + (i.likeCount || 0), 0);

    const handleLike = async (idea: any, e: React.MouseEvent) => {
        e.preventDefault();
        if (!session?.user?.id) return;

        const updated = ideas.map((i) => {
            if (i.id === idea.id) {
                const liked = i.likedByMe;
                return {
                    ...i,
                    likedByMe: !liked,
                    likeCount: liked ? i.likeCount - 1 : i.likeCount + 1,
                };
            }
            return i;
        });
        setIdeas(updated);

        try {
            const res = await fetch(`/api/posts/${idea.id}/like`, { method: 'POST' });
            if (!res.ok) throw new Error();
        } catch (err) {
            setIdeas(ideas); // revert
            showNotification('error', 'Kon like niet updaten');
        }
    };

    // compute sidebar info from all ideas
    const categories = ideas.reduce((acc: any, i) => {
        const cat = i.category || 'Overig';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const recentImplemented = ideas
        .filter((i) => i.status === 'Geïmplementeerd')
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 3)
        .map((i) => i.title);

    const topContributors = Object.entries(
        ideas.reduce((acc: any, i) => {
            const name = i.author?.displayName || 'Onbekend';
            acc[name] = (acc[name] || 0) + 1;
            return acc;
        }, {} as Record<string, number>)
    )
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, count]) => ({ name, ideas: count }));

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-dark">Ideas Portal</h1>
                    <Link href="/ideas/new" className="btn btn-primary">
                        Deel je idee
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <Lightbulb className="w-8 h-8 text-warning" />
                            <div>
                                <p className="text-2xl font-bold text-dark">{totalIdeas}</p>
                                <p className="text-sm text-dark-100">Totaal ideeën</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-success" />
                            <div>
                                <p className="text-2xl font-bold text-dark">{implementedCount}</p>
                                <p className="text-sm text-dark-100">Geïmplementeerd</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <Users className="w-8 h-8 text-info" />
                            <div>
                                <p className="text-2xl font-bold text-dark">{uniqueAuthors}</p>
                                <p className="text-sm text-dark-100">Actieve deelnemers</p>
                            </div>
                        </div>
                    </div>
                    <div className="card p-4">
                        <div className="flex items-center gap-3">
                            <ThumbsUp className="w-8 h-8 text-primary" />
                            <div>
                                <p className="text-2xl font-bold text-dark">{totalVotes}</p>
                                <p className="text-sm text-dark-100">Totaal votes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-light-400">
                    <button
                        onClick={() => setSelectedTab('trending')}
                        className={`px-4 py-2 font-medium ${selectedTab === 'trending' ? 'text-primary border-b-2 border-primary' : 'text-dark-100 hover:text-primary transition-colors'}`}>
                        Trending
                    </button>
                    <button
                        onClick={() => setSelectedTab('new')}
                        className={`px-4 py-2 font-medium ${selectedTab === 'new' ? 'text-primary border-b-2 border-primary' : 'text-dark-100 hover:text-primary transition-colors'}`}>
                        Nieuw
                    </button>
                    <button
                        onClick={() => setSelectedTab('inProgress')}
                        className={`px-4 py-2 font-medium ${selectedTab === 'inProgress' ? 'text-primary border-b-2 border-primary' : 'text-dark-100 hover:text-primary transition-colors'}`}>
                        In Behandeling
                    </button>
                    <button
                        onClick={() => setSelectedTab('implemented')}
                        className={`px-4 py-2 font-medium ${selectedTab === 'implemented' ? 'text-primary border-b-2 border-primary' : 'text-dark-100 hover:text-primary transition-colors'}`}>
                        Geïmplementeerd
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : ideas.length === 0 ? (
                            <div className="card p-12 text-center text-dark-100">
                                <p>Geen ideeën gevonden.</p>
                            </div>
                        ) : (
                            ideas.map((idea) => (
                                <div key={idea.id} className="card p-6 hover:shadow-medium transition-shadow">
                                    <div className="flex gap-4">
                                        {/* Vote Section */}
                                        <div className="flex flex-col items-center gap-1">
                                            <button className="w-8 h-8 rounded-lg hover:bg-primary-50 flex items-center justify-center transition-colors">
                                                <span className="text-primary">▲</span>
                                            </button>
                                            <span className="font-bold text-dark">{idea.likeCount}</span>
                                            <button className="w-8 h-8 rounded-lg hover:bg-light-300 flex items-center justify-center transition-colors">
                                                <span className="text-dark-100">▼</span>
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                {idea.category && (
                                                    <span className="badge bg-primary-50 text-primary text-xs">
                                                        {idea.category}
                                                    </span>
                                                )}
                                                {idea.status && (
                                                    <span className={`badge text-xs ${idea.status === 'In Behandeling'
                                                            ? 'bg-warning/20 text-warning'
                                                            : idea.status === 'Onder Review'
                                                                ? 'bg-info/20 text-info'
                                                                : 'bg-light-300 text-dark-100'
                                                        }`}>
                                                        {idea.status}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-lg font-semibold text-dark mb-2">
                                                <Link href={`/discussions/${idea.id}`} className="hover:text-primary transition-colors">
                                                    {idea.title}
                                                </Link>
                                            </h3>
                                            <p className="text-dark-100 mb-3">{idea.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-dark-100">
                                                <span>Door {idea.author?.displayName || 'Onbekend'}</span>
                                                <span>•</span>
                                                <Link href={`/discussions/${idea.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                                                    💬 {idea.commentCount} reacties
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Submit Idea */}
                        <div className="card p-6 bg-gradient-to-br from-primary to-primary-700 text-white">
                            <Lightbulb className="w-12 h-12 mb-3" />
                            <h3 className="text-lg font-semibold mb-2">Heb je een idee?</h3>
                            <p className="text-primary-100 text-sm mb-4">
                                Deel je innovatieve ideeën met het team en help ons beter te worden!
                            </p>
                            <Link href="/ideas/new" className="btn bg-white text-primary hover:bg-primary-50 w-full">
                                Deel je idee
                            </Link>
                        </div>

                        {/* Categories */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">Categorieën</h3>
                            {categoryFilter && (
                                <button
                                    onClick={() => setCategoryFilter(null)}
                                    className="text-sm text-primary underline mb-2">
                                    Alle categorieën weergeven
                                </button>
                            )}
                            <div className="space-y-2">
                                {Object.entries(categories).map(([name, count], i) => (
                                    <button
                                        key={i}
                                        onClick={() => setCategoryFilter(name)}
                                        className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left ${categoryFilter === name ? 'bg-light-300' : 'hover:bg-light-200'}`}
                                    >
                                        <span className="text-dark">{name}</span>
                                        <span className="text-sm text-dark-100">{count}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recently Implemented */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">
                                Recent Geïmplementeerd
                            </h3>
                            <div className="space-y-3">
                                {recentImplemented.length > 0 ? (
                                    recentImplemented.map((item, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="text-success mt-1">✓</span>
                                            <span className="text-sm text-dark-100">{item}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-dark-100">Geen recent geïmplementeerde ideeën.</p>
                                )}
                            </div>
                        </div>

                        {/* Top Contributors */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4">
                                Top Contributors
                            </h3>
                            <div className="space-y-3">
                                {topContributors.map((user, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                                {user.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="text-sm text-dark">{user.name}</span>
                                        </div>
                                        <span className="text-xs text-dark-100">{user.ideas} ideeën</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
