'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Users, MapPin, Video } from 'lucide-react';

export default function AllEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch('/api/posts');
                const posts = await res.json();
                const eventPosts = posts.filter((p: any) => p.type === 'EVENT' && p.event);
                setEvents(eventPosts);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
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

                <h1 className="text-3xl font-bold text-dark mb-8">Alle Aankomende Evenementen</h1>

                {events.length === 0 ? (
                    <div className="card p-12 text-center">
                        <Calendar className="w-12 h-12 text-dark-100 mx-auto mb-3" />
                        <p className="text-dark-100">Geen evenementen gepland</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((post) => (
                            <div
                                key={post.id}
                                onClick={() => router.push(`/discussions/${post.id}`)}
                                className="card p-6 hover:shadow-medium transition-all cursor-pointer group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <h2 className="text-xl font-bold text-dark group-hover:text-primary transition-colors mb-2">
                                            {post.title}
                                        </h2>
                                        <p className="text-dark-100 mb-4 line-clamp-2">
                                            {post.content}
                                        </p>

                                        <div className="space-y-2 text-sm text-dark-100">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    {new Date(post.event.startDate).toLocaleDateString('nl-NL', {
                                                        weekday: 'long',
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>

                                            {post.event.isVirtual ? (
                                                <div className="flex items-center gap-2">
                                                    <Video className="w-4 h-4" />
                                                    <span>Virtueel</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{post.event.location}</span>
                                                </div>
                                            )}

                                            {post.event.maxAttendees && (
                                                <div className="flex items-center gap-2">
                                                    <Users className="w-4 h-4" />
                                                    <span>Max {post.event.maxAttendees} deelnemers</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {post.imageUrl && (
                                        <img
                                            src={post.imageUrl}
                                            alt={post.title}
                                            className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                                        />
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
