'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, BarChart3 } from 'lucide-react';

export default function AllPollsPage() {
    const router = useRouter();
    const [polls, setPolls] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPolls() {
            try {
                const res = await fetch('/api/posts');
                const posts = await res.json();
                const pollPosts = posts.filter((p: any) => p.type === 'POLL' && p.poll);
                setPolls(pollPosts);
            } catch (error) {
                console.error('Failed to fetch polls:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPolls();
    }, []);

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

                <h1 className="text-3xl font-bold text-dark mb-8">Alle Actieve Polls</h1>

                {polls.length === 0 ? (
                    <div className="card p-12 text-center">
                        <BarChart3 className="w-12 h-12 text-dark-100 mx-auto mb-3" />
                        <p className="text-dark-100">Geen polls beschikbaar</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {polls.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => router.push(`/discussions/${post.id}`)}
                                className="card p-6 hover:shadow-medium transition-all cursor-pointer group"
                            >
                                <h2 className="text-xl font-bold text-dark group-hover:text-primary transition-colors mb-3">
                                    {post.title}
                                </h2>

                                {post.content && (
                                    <p className="text-dark-100 mb-4">
                                        {post.content}
                                    </p>
                                )}

                                <div className="space-y-2">
                                    {post.poll?.options?.map((option: any, index: number) => (
                                        <div key={option.id} className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-sm text-dark">{option.text}</span>
                                                    <span className="text-xs text-dark-100">{option.voteCount} stemmen</span>
                                                </div>
                                                <div className="w-full bg-light-200 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className="bg-primary h-full transition-all"
                                                        style={{
                                                            width: `${Math.max(10, (option.voteCount / Math.max(1, post.poll.options.reduce((sum: number, opt: any) => sum + opt.voteCount, 0))) * 100)}%`
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-4 pt-4 border-t border-light-400 text-xs text-dark-100">
                                    {post.poll?.endsAt ? (
                                        <span>
                                            Eindigt op {new Date(post.poll.endsAt).toLocaleDateString('nl-NL')}
                                        </span>
                                    ) : (
                                        <span>Geen einddatum</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
