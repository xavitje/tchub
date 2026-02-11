'use client';

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Calendar, TrendingUp, Users, Trash2, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/ui/NotificationSystem';
import PollInteraction from '@/components/discussions/PollInteraction';

export default function HomePage() {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [posts, setPosts] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [stats, setStats] = useState({ discussions: 0, events: 0, polls: 0, users: 0 });
    const [loading, setLoading] = useState(true);

    // Events and Polls
    const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
    const [activePolls, setActivePolls] = useState<any[]>([]);

    // Quick Links
    const [hubs, setHubs] = useState<any[]>([]);
    const [quickLinks, setQuickLinks] = useState<any[]>([]);
    const [showAddLink, setShowAddLink] = useState(false);
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');

    // Default Quick Links
    const DEFAULT_QUICK_LINKS = [
        { id: 'default-chat', title: 'Chat', url: '/chat', icon: '💬', isDefault: true },
        { id: 'default-discussions', title: 'Discussies', url: '/discussions', icon: '🗣️', isDefault: true },
        { id: 'default-support', title: 'Support Portal', url: '/support', icon: '🆘', isDefault: true },
    ];

    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch all data in one request for maximum performance
                const res = await fetch(`/api/home-data?t=${Date.now()}`);

                if (res.ok) {
                    const data = await res.json();

                    if (data.announcements) setAnnouncements(data.announcements);

                    if (data.posts) {
                        const nonAnnouncements = data.posts.filter((p: any) => p.type !== 'ANNOUNCEMENT');
                        setPosts(nonAnnouncements);

                        // Get events and polls
                        setUpcomingEvents(nonAnnouncements.filter((p: any) => p.type === 'EVENT').slice(0, 5));
                        setActivePolls(nonAnnouncements.filter((p: any) => p.type === 'POLL').slice(0, 3));
                    }

                    if (data.stats) setStats(data.stats);
                    if (data.quickLinks) setQuickLinks(data.quickLinks);
                    if (data.hubs) setHubs(data.hubs);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [session?.user?.id]);

    const handleAddQuickLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newLinkTitle || !newLinkUrl) return;

        try {
            const res = await fetch('/api/quicklinks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newLinkTitle,
                    url: newLinkUrl
                })
            });

            if (res.ok) {
                const newLink = await res.json();
                setQuickLinks([...quickLinks, newLink]);
                setNewLinkTitle('');
                setNewLinkUrl('');
                setShowAddLink(false);
                showNotification('success', 'Link toegevoegd');
            }
        } catch (error) {
            showNotification('error', 'Fout bij toevoegen link');
        }
    };

    const handleDeleteQuickLink = async (id: string) => {
        try {
            const res = await fetch(`/api/quicklinks/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setQuickLinks(quickLinks.filter(link => link.id !== id));
                showNotification('success', 'Link verwijderd');
            }
        } catch (error) {
            showNotification('error', 'Fout bij verwijderen link');
        }
    };

    return (
        <div className="min-h-screen bg-light">
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary to-primary-700 text-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-5xl font-bold mb-4">
                            Welkom bij HubTC
                        </h1>
                        <p className="text-xl text-primary-100 max-w-2xl mx-auto">
                            Jouw centrale platform voor communicatie, informatie en samenwerking binnen Travel Counsellors
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Stats & Feed */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Quick Stats - Now integrated into the main flow */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 -mt-20 lg:mt-0 mb-8 lg:mb-0">
                            <div className="card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                                        <MessageSquare className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-dark">{loading ? '-' : stats.discussions}</p>
                                        <p className="text-sm text-dark-100">Discussies</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
                                        <Calendar className="w-6 h-6 text-info" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-dark">{loading ? '-' : stats.events}</p>
                                        <p className="text-sm text-dark-100">Events</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-dark">{loading ? '-' : stats.polls}</p>
                                        <p className="text-sm text-dark-100">Polls</p>
                                    </div>
                                </div>
                            </div>

                            <div className="card p-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                                        <Users className="w-6 h-6 text-warning" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-dark">{loading ? '-' : stats.users}</p>
                                        <p className="text-sm text-dark-100">Gebruikers</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Announcements Section */}
                        {announcements.length > 0 && (
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold text-dark flex items-center gap-2">
                                    <span className="p-2 bg-warning-100 rounded-lg">📢</span>
                                    Nieuws en aankondigingen
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {announcements.map((news) => {
                                        const isSharePointAnnouncement = news.announcementType === 'SHAREPOINT_LINK';
                                        return (
                                            <Link
                                                key={news.id}
                                                href={isSharePointAnnouncement ? (news.sharePointUrl || '#') : `/discussions/${news.id}`}
                                                target={isSharePointAnnouncement ? '_blank' : undefined}
                                                rel={isSharePointAnnouncement ? 'noopener noreferrer' : undefined}
                                                className="group overflow-hidden rounded-lg border border-light-400 hover:shadow-medium transition-all bg-white"
                                            >
                                                {news.imageUrl && (
                                                    <div className="relative overflow-hidden bg-light-200 h-48">
                                                        <img
                                                            src={news.imageUrl}
                                                            alt={news.title}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                )}
                                                <div className="p-4">
                                                    <h3 className="font-semibold text-dark line-clamp-2 group-hover:text-primary transition-colors">
                                                        {news.title}
                                                    </h3>
                                                    {!isSharePointAnnouncement && (
                                                        <p className="text-sm text-dark-100 mt-2 line-clamp-2">
                                                            {news.content}
                                                        </p>
                                                    )}
                                                </div>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Recent Updates Section */}
                        <div className="space-y-4 pt-4 border-t border-light-400">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-dark">Recente Updates</h2>
                                <Link href="/discussions/new" className="btn btn-primary">
                                    Nieuw bericht
                                </Link>
                            </div>

                            {loading ? (
                                <div className="flex justify-center py-12">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : posts.length === 0 ? (
                                <div className="card p-12 text-center text-dark-100">
                                    <p>Nog geen berichten beschikbaar.</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div
                                        key={post.id}
                                        className={`block card p-6 hover:shadow-medium transition-all ${post.isPinned ? 'border-2 border-primary' : ''} cursor-pointer`}
                                        onClick={() => window.location.href = `/discussions/${post.id}`}
                                    >
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
                                                    {post.isPinned && <span className="badge bg-primary text-white">Gepind</span>}
                                                    <span className="text-sm text-dark-100">
                                                        {post.author?.displayName} • {new Date(post.createdAt).toLocaleDateString('nl-NL')}
                                                    </span>
                                                </div>
                                                <h3 className="text-lg font-semibold text-dark mb-2 truncate">
                                                    {post.title}
                                                </h3>
                                                <p className="text-dark-100 mb-4 line-clamp-3">
                                                    {post.content}
                                                </p>

                                                {/* POLL RENDERING */}
                                                {post.type === 'POLL' && post.poll && (
                                                    <div onClick={(e) => e.stopPropagation()} className="mb-4">
                                                        <PollInteraction postId={post.id} poll={post.poll} />
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-sm text-dark-100">
                                                    <span className="flex items-center gap-1">
                                                        💬 {post.commentCount} reacties
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        👍 {post.likeCount} likes
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right Column: Sidebar (Events, Polls, Links) */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Upcoming Events */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-info" />
                                Aankomende Evenementen
                            </h3>
                            <div className="space-y-3">
                                {upcomingEvents.length === 0 ? (
                                    <p className="text-sm text-dark-100">Geen evenementen gepland</p>
                                ) : (
                                    upcomingEvents.map((event) => (
                                        <Link
                                            key={event.id}
                                            href={`/discussions/${event.id}`}
                                            className="block p-3 rounded-lg hover:bg-light-200 transition-colors group"
                                        >
                                            <p className="font-medium text-dark group-hover:text-primary transition-colors truncate">
                                                {event.title}
                                            </p>
                                            <p className="text-xs text-dark-100 mt-1">
                                                {new Date(event.event.startDate).toLocaleDateString('nl-NL', {
                                                    weekday: 'short',
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </Link>
                                    ))
                                )}
                            </div>
                            <Link href="/events" className="btn btn-outline w-full mt-4 text-sm">
                                Bekijk alle events
                            </Link>
                        </div>

                        {/* Active Polls */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-success" />
                                Actieve Polls
                            </h3>
                            <div className="space-y-3">
                                {activePolls.length === 0 ? (
                                    <p className="text-sm text-dark-100">Geen polls beschikbaar</p>
                                ) : (
                                    activePolls.map((poll) => (
                                        <Link
                                            key={poll.id}
                                            href={`/discussions/${poll.id}`}
                                            className="block p-3 rounded-lg hover:bg-light-200 transition-colors group"
                                        >
                                            <p className="font-medium text-dark group-hover:text-primary transition-colors line-clamp-2">
                                                {poll.title}
                                            </p>
                                            <p className="text-xs text-dark-100 mt-1">
                                                {poll.poll?.options?.length || 0} opties
                                            </p>
                                        </Link>
                                    ))
                                )}
                            </div>
                            <Link href="/polls" className="btn btn-outline w-full mt-4 text-sm">
                                Bekijk alle polls
                            </Link>
                        </div>

                        {/* TC Hubs Section */}
                        <div className="card p-6">
                            <h3 className="text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                                <span className="text-xl">🏢</span>
                                TC Hubs
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                {hubs.slice(0, 6).map((hub) => (
                                    <Link
                                        key={hub.id}
                                        href={hub.sharePointUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-light-200 border border-light-400 transition-all text-center group"
                                    >
                                        <span className="text-2xl group-hover:scale-110 transition-transform">{hub.icon}</span>
                                        <span className="text-[10px] font-bold text-dark truncate w-full">{hub.name}</span>
                                    </Link>
                                ))}
                            </div>
                            {hubs.length === 0 && (
                                <p className="text-sm text-dark-100">Geen hubs beschikbaar</p>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-dark">Snelle Links</h3>
                                {session?.user?.id && (
                                    <button
                                        onClick={() => setShowAddLink(!showAddLink)}
                                        className="p-1 hover:bg-light-200 rounded-lg transition-colors"
                                        title="Link toevoegen"
                                    >
                                        <Plus className="w-4 h-4 text-dark-100" />
                                    </button>
                                )}
                            </div>

                            {showAddLink && (
                                <form onSubmit={handleAddQuickLink} className="mb-4 p-3 bg-light-50 rounded-lg border border-light-400 space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Titel"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                        className="input text-sm h-8 py-0"
                                        required
                                    />
                                    <input
                                        type="url"
                                        placeholder="URL"
                                        value={newLinkUrl}
                                        onChange={(e) => setNewLinkUrl(e.target.value)}
                                        className="input text-sm h-8 py-0"
                                        required
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            className="flex-1 btn btn-primary text-xs h-7 py-0"
                                        >
                                            Toevoegen
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowAddLink(false)}
                                            className="flex-1 btn btn-outline text-xs h-7 py-0"
                                        >
                                            Annuleren
                                        </button>
                                    </div>
                                </form>
                            )}

                            <div className="space-y-1">
                                {/* Default Links */}
                                {DEFAULT_QUICK_LINKS.map((link) => (
                                    <Link
                                        key={link.id}
                                        href={link.url}
                                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-light-200 text-dark-100 hover:text-primary transition-all group"
                                    >
                                        <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">{link.icon}</span>
                                        <span className="font-medium text-sm">{link.title}</span>
                                    </Link>
                                ))}

                                {/* Divider if there are custom links */}
                                {quickLinks.length > 0 && <div className="my-2 border-t border-light-400" />}

                                {/* Custom User Links */}
                                {quickLinks.map((link) => (
                                    <div key={link.id} className="flex items-center gap-2 group">
                                        <a
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex-1 flex items-center gap-3 p-2 rounded-lg hover:bg-light-200 text-dark-100 hover:text-primary transition-all truncate group"
                                        >
                                            <span className="text-lg flex-shrink-0 group-hover:scale-110 transition-transform">{link.icon || '🔗'}</span>
                                            <span className="text-sm">{link.title}</span>
                                        </a>
                                        {session?.user?.id && (
                                            <button
                                                onClick={() => handleDeleteQuickLink(link.id)}
                                                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-error/10 text-error rounded transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                ))}

                                {quickLinks.length === 0 && (
                                    <p className="text-[10px] text-dark-100/50 italic px-2 pt-2">Voeg je eigen favoriete links toe met het plusje.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
