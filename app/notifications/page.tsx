'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Bell, MessageSquare, FileText, Calendar, CheckSquare, Clock, ArrowLeft, Lock } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { nl } from 'date-fns/locale';
import { cn } from '@/lib/utils';

type Notification = {
    id: string;
    type: 'NEW_POST' | 'NEW_COMMENT' | 'NEW_POLL' | 'NEW_EVENT' | 'POLL_ENDING_SOON' | 'EVENT_REMINDER' | 'MENTION' | 'SYSTEM';
    title: string;
    message: string;
    link: string | null;
    isRead: boolean;
    createdAt: string;
};

export default function NotificationsPage() {
    const { data: session } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (session) {
            fetchNotifications();
        }
    }, [session]);

    const markAsRead = async (id: string, link: string | null) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const getIcon = (type: Notification['type']) => {
        switch (type) {
            case 'MENTION':
                return <MessageSquare className="w-5 h-5 text-blue-500" />;
            case 'NEW_POST':
                return <FileText className="w-5 h-5 text-green-500" />;
            case 'NEW_POLL':
                return <CheckSquare className="w-5 h-5 text-purple-500" />;
            case 'NEW_EVENT':
                return <Calendar className="w-5 h-5 text-orange-500" />;
            case 'NEW_COMMENT':
                return <MessageSquare className="w-5 h-5 text-primary" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-light">
                <div className="p-8 text-center card max-w-sm">
                    <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-dark mb-2">Inloggen Verplicht</h2>
                    <p className="text-dark-100 mb-6">Je moet ingelogd zijn om je meldingingen te bekijken.</p>
                    <Link href="/login" className="btn btn-primary w-full">Inloggen</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light py-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-white rounded-lg transition-colors text-dark-100">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-dark">Meldingen</h1>
                            <p className="text-dark-100">Blijf op de hoogte van de laatste updates</p>
                        </div>
                    </div>
                    {notifications.some(n => !n.isRead) && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm font-semibold text-primary hover:underline"
                        >
                            Alles als gelezen markeren
                        </button>
                    )}
                </div>

                <div className="card divide-y divide-light-400 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-dark-100">
                            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Meldingen laden...</p>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="p-12 text-center text-dark-100">
                            <Bell className="w-16 h-16 mx-auto mb-4 opacity-10" />
                            <p className="text-lg font-medium">Geen meldingen</p>
                            <p className="text-sm">Je bent helemaal bij!</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={cn(
                                    "p-6 flex gap-4 transition-colors relative",
                                    !notification.isRead ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-light-100"
                                )}
                            >
                                <div className="flex-shrink-0">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-light-400 flex items-center justify-center shadow-sm">
                                        {getIcon(notification.type)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-1">
                                        <h3 className={cn(
                                            "font-bold text-dark",
                                            !notification.isRead ? "text-primary" : ""
                                        )}>
                                            {notification.title}
                                        </h3>
                                        <span className="text-xs text-dark-100 flex items-center gap-1 whitespace-nowrap">
                                            <Clock className="w-3 h-3" />
                                            {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: nl })}
                                        </span>
                                    </div>
                                    <p className="text-dark-100 text-sm leading-relaxed mb-3">
                                        {notification.message}
                                    </p>
                                    {notification.link && (
                                        <Link
                                            href={notification.link}
                                            onClick={() => markAsRead(notification.id, notification.link)}
                                            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
                                        >
                                            Bekijken <span aria-hidden="true">&rarr;</span>
                                        </Link>
                                    )}
                                </div>
                                {!notification.isRead && (
                                    <div className="w-3 h-3 bg-primary rounded-full mt-1 flex-shrink-0"></div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
