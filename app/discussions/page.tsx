'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';

import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/ui/NotificationSystem';

export default function DiscussionsPage() {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPosts() {
            try {
                const res = await fetch('/api/posts');
                const data = await res.json();
                if (Array.isArray(data)) {
                    setPosts(data);
                }
            } catch (error) {
                console.error('Failed to fetch posts:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPosts();
    }, []);

    const handleLike = async (post: any, e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigation
        if (!session?.user?.id) return;

        // Optimistic update
        const updatedPosts = posts.map(p => {
            if (p.id === post.id) {
                const isLiked = p.likedByMe;
                return {
                    ...p,
                    likedByMe: !isLiked,
                    likeCount: isLiked ? p.likeCount - 1 : p.likeCount + 1
                };
            }
            return p;
        });
        setPosts(updatedPosts);

        try {
            const res = await fetch(`/api/posts/${post.id}/like`, { method: 'POST' });
            if (!res.ok) throw new Error('Failed to toggle like');
        } catch (error) {
            // Revert
            setPosts(posts); // Reset to original state
            showNotification('error', 'Kon like niet updaten');
        }
    };

    return (
        <div className="min-h-screen bg-light">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-3xl font-bold text-dark">Discussies</h1>
                    <Link href="/discussions/new" className="btn btn-primary">
                        Nieuw bericht
                    </Link>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 border-b border-light-400">
                    <button className="px-4 py-2 font-medium text-primary border-b-2 border-primary">
                        Alle berichten
                    </button>
                    <button className="px-4 py-2 font-medium text-dark-100 hover:text-primary transition-colors">
                        Populair
                    </button>
                    <button className="px-4 py-2 font-medium text-dark-100 hover:text-primary transition-colors">
                        Nieuw
                    </button>
                    <button className="px-4 py-2 font-medium text-dark-100 hover:text-primary transition-colors">
                        Mijn berichten
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Feed */}
                    <div className="lg:col-span-2 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        ) : posts.length === 0 ? (
                            <div className="card p-12 text-center text-dark-100">
                                <p>Nog geen discussies beschikbaar.</p>
                            </div>
                        ) : (
                            posts.map((post) => (
                                <div key={post.id} className={`card p-6 hover:shadow-medium transition-shadow ${post.isPinned ? 'border-2 border-primary' : ''}`}>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                                            {post.author?.profileImage ? (
                                                <img src={post.author.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                                            ) : (
                                                <span>{post.author?.displayName?.substring(0, 2).toUpperCase() || '??'}</span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                {post.isPinned && <span className="badge bg-primary text-white text-xs">Gepind</span>}
                                                <span className="font-semibold text-dark">{post.author?.displayName}</span>
                                                <span className="text-sm text-dark-100">• {new Date(post.createdAt).toLocaleDateString('nl-NL')}</span>
                                            </div>
                                            <Link href={`/discussions/${post.id}`} className="hover:text-primary transition-colors">
                                                <h3 className="text-lg font-semibold text-dark mb-2 truncate">
                                                    {post.title}
                                                </h3>
                                            </Link>
                                            <p className="text-dark-100 mb-4 line-clamp-3">{post.content}</p>
                                            <div className="flex items-center gap-4 text-sm text-dark-100">
                                                <Link href={`/discussions/${post.id}`} className="hover:text-primary transition-colors flex items-center gap-1">
                                                    <MessageSquare className="w-4 h-4" />
                                                    {post.commentCount} reacties
                                                </Link>
                                                <button
                                                    onClick={(e) => handleLike(post, e)}
                                                    className={`hover:text-primary transition-colors flex items-center gap-1 ${post.likedByMe ? 'text-primary font-medium' : ''}`}
                                                >
                                                    👍 {post.likeCount} likes
                                                </button>
                                                <button className="hover:text-primary transition-colors">
                                                    🔖 Opslaan
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Trending Topics */}
                        <div className="card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-dark">Trending Topics</h3>
                            </div>
                            <div className="space-y-3">
                                {['Marketing', 'Klantservice', 'Training', 'Productiviteit'].map((topic, i) => (
                                    <button
                                        key={i}
                                        className="w-full text-left p-2 rounded-lg hover:bg-light-200 transition-colors"
                                    >
                                        <span className="text-primary font-medium">#{topic}</span>
                                        <span className="text-xs text-dark-100 ml-2">{12 - i * 2} posts</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="card p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Clock className="w-5 h-5 text-primary" />
                                <h3 className="text-lg font-semibold text-dark">Recente Activiteit</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    'Nieuwe reactie op "Q1 Richtlijnen"',
                                    'Sarah heeft een bericht geliked',
                                    'Nieuwe poll: "Beste training tijd"',
                                    'Michael heeft gereageerd',
                                ].map((activity, i) => (
                                    <div key={i} className="text-sm text-dark-100 flex items-start gap-2">
                                        <span className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5"></span>
                                        <span>{activity}</span>
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
