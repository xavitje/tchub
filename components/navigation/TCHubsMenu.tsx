'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
// import { TC_HUBS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';

interface TCHubsMenuProps {
    isMobile?: boolean;
    onNavigate?: () => void;
}

export function TCHubsMenu({ isMobile, onNavigate }: TCHubsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [hubs, setHubs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHubs = async () => {
            try {
                const res = await fetch('/api/hubs');
                if (res.ok) {
                    const data = await res.json();
                    setHubs(data);
                }
            } catch (error) {
                console.error('Failed to fetch hubs:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchHubs();
    }, []);

    if (loading && isMobile) {
        return <div className="px-4 py-2 text-xs text-dark-100/50">Laden...</div>;
    }

    if (isMobile) {
        return (
            <div className="space-y-1">
                {hubs.map((hub) => (
                    <Link
                        key={hub.slug}
                        href={hub.sharePointUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={onNavigate}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-dark-100 hover:bg-light-200 hover:text-primary transition-all duration-200"
                    >
                        <span className="text-xl flex-shrink-0">{hub.icon}</span>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{hub.name}</p>
                            <p className="text-[10px] text-dark-100/70 truncate">{hub.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 opacity-30" />
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <div
            className="relative"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {/* Trigger Button */}
            <button
                className={cn(
                    "px-4 py-2 text-sm font-medium transition-colors duration-200",
                    isOpen
                        ? "text-primary border-b-2 border-primary"
                        : "text-dark-100 hover:text-primary"
                )}
            >
                TC Hubs
            </button>

            {/* Mega Menu Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-0 w-screen max-w-5xl z-50 animate-fade-in">
                    <div className="bg-white shadow-strong rounded-lg p-6 border border-light-400">
                        {loading ? (
                            <div className="flex justify-center py-4">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                            </div>
                        ) : hubs.length === 0 ? (
                            <div className="text-center py-4 text-dark-100 text-sm">Geen hubs geconfigureerd</div>
                        ) : (
                            <div className="grid grid-cols-3 gap-4">
                                {hubs.map((hub) => (
                                    <Link
                                        key={hub.slug}
                                        href={hub.sharePointUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group flex items-start gap-3 p-3 rounded-lg hover:bg-light-200 transition-all duration-200"
                                    >
                                        <span className="text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                            {hub.icon}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-dark group-hover:text-primary transition-colors">
                                                {hub.name}
                                            </h3>
                                            <p className="text-xs text-dark-100 mt-0.5 line-clamp-2">
                                                {hub.description}
                                            </p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
