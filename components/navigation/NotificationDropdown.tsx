'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, FileText, Calendar, CheckSquare, MoreHorizontal } from 'lucide-react';
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

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const hasUnread = notifications.some(n => !n.isRead);

    const fetchNotifications = async () => {
        setIsLoading(true);
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string, link: string | null) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }

        if (link) {
            setIsOpen(false);
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
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case 'NEW_POST':
                return <FileText className="w-4 h-4 text-green-500" />;
            case 'NEW_POLL':
                return <CheckSquare className="w-4 h-4 text-purple-500" />;
            case 'NEW_EVENT':
                return <Calendar className="w-4 h-4 text-orange-500" />;
            case 'NEW_COMMENT':
                return <MessageSquare className="w-4 h-4 text-primary" />;
            default:
                return <Bell className="w-4 h-4 text-gray-500" />;
        }
    };

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    return (
        <div
            className="relative"
            ref={dropdownRef}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onMouseEnter={handleMouseEnter}
                className="relative p-2 text-dark-100 hover:text-primary hover:bg-light-200 rounded-lg transition-all duration-200"
                aria-label="Notificaties"
            >
                <Bell className="w-5 h-5" />
                {hasUnread && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-light-400 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={handleMouseEnter}
                >
                    <div className="p-4 border-b border-light-400 flex items-center justify-between bg-light-100/50">
                        <h3 className="font-semibold text-dark">Meldingen</h3>
                        <div className="flex items-center gap-2">
                            {hasUnread && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Alles gelezen
                                </button>
                            )}
                            <button className="text-dark-100 hover:text-dark">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {isLoading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-dark-100">
                                <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                                <p className="text-sm">Laden...</p>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-dark-100">
                                <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="text-sm">Geen meldingen gevonden</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-light-400">
                                {notifications.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "flex gap-3 p-4 hover:bg-light-100 transition-colors cursor-pointer relative",
                                            !notification.isRead && "bg-primary/5"
                                        )}
                                        onClick={() => markAsRead(notification.id, notification.link)}
                                    >
                                        <div className="flex-shrink-0 mt-1">
                                            <div className="w-8 h-8 rounded-full bg-white border border-light-400 flex items-center justify-center shadow-sm">
                                                {getIcon(notification.type)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2">
                                                <p className={cn(
                                                    "text-sm font-medium text-dark leading-snug",
                                                    !notification.isRead && "font-semibold"
                                                )}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-[10px] text-dark-100 whitespace-nowrap mt-0.5">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: nl })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-dark-100 mt-1 line-clamp-2 leading-relaxed">
                                                {notification.message}
                                            </p>
                                            {notification.link && (
                                                <Link
                                                    href={notification.link}
                                                    className="absolute inset-0 z-0"
                                                    onClick={(e) => {
                                                        // Prevent propagation so markAsRead handles it
                                                        e.stopPropagation();
                                                        markAsRead(notification.id, notification.link);
                                                    }}
                                                >
                                                    <span className="sr-only">Bekijk</span>
                                                </Link>
                                            )}
                                        </div>
                                        {!notification.isRead && (
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-3 border-t border-light-400 bg-light-100/50 text-center">
                        <Link
                            href="/notifications"
                            className="text-xs font-semibold text-primary hover:text-primary-600 transition-colors"
                            onClick={() => setIsOpen(false)}
                        >
                            Alle meldingen bekijken
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
