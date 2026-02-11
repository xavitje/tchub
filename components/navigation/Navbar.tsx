'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';
import { Search, Bell, User, LogOut, Settings, MessageSquare, Menu, X, Home, Shield } from 'lucide-react';
import { TCHubsMenu } from './TCHubsMenu';
import { cn } from '@/lib/utils';
import { NotificationDropdown } from './NotificationDropdown';
import { GlobalSearch } from './GlobalSearch';
import { useState, useRef } from 'react';
import { useSettings } from '../providers/SettingsProvider';

const NAV_ITEMS = [
    { name: 'Home', href: '/' },
    { name: 'Phenix', href: 'https://phenix.travelcounsellors.com/sites/Phenix/Dashboard/', external: true },
    { name: 'Platformstatus', href: '/platform-status' },
    { name: 'Discussies', href: '/discussions' },
    { name: 'Training', href: '/training' },
    { name: 'Support Portal', href: '/support' },
    { name: 'Ideas Portal', href: '/ideas' },
    { name: 'Opgeslagen', href: '/saved' },
];

export function Navbar() {
    const { headerOrder } = useSettings();
    const pathname = usePathname();
    const { data: session, status } = useSession();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const userRole = (session?.user as any)?.customRole?.name || (session?.user as any)?.role;
    const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';
    const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleMouseEnter = () => {
        if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
        setShowUserMenu(true);
    };

    const handleMouseLeave = () => {
        closeTimeoutRef.current = setTimeout(() => {
            setShowUserMenu(false);
        }, 200);
    };

    return (
        <nav className="sticky top-0 z-40 bg-white border-b border-light-400 shadow-soft">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">TC</span>
                        </div>
                        <span className="font-bold text-xl text-dark hidden sm:block">
                            HubTC
                        </span>
                    </Link>

                    {/* Main Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {headerOrder.map((key) => {
                            if (key === 'hubs') return <TCHubsMenu key="hubs" />;

                            const item = NAV_ITEMS.find(i => {
                                if (key === 'home') return i.name === 'Home';
                                if (key === 'discussions') return i.name === 'Discussies';
                                if (key === 'training') return i.name === 'Training';
                                if (key === 'support') return i.name === 'Support Portal';
                                return false;
                            });

                            if (!item) return null;

                            const isActive = pathname === item.href;

                            if (item.external) {
                                return (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-4 py-2 text-sm font-medium text-dark-100 hover:text-primary transition-colors duration-200"
                                    >
                                        {item.name}
                                    </a>
                                );
                            }

                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap",
                                        isActive
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-dark-100 hover:text-primary"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}

                        {/* Extra items (Phenix, Ideas, etc) */}
                        {NAV_ITEMS.filter(item =>
                            !['Home', 'Discussies', 'Training', 'Support Portal'].includes(item.name)
                        ).map(item => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    className={cn(
                                        "px-4 py-2 text-sm font-medium transition-colors duration-200 whitespace-nowrap",
                                        isActive
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-dark-100 hover:text-primary"
                                    )}
                                >
                                    {item.name}
                                </Link>
                            );
                        })}
                    </div>

                    {/* Desktop/Mobile Actions */}
                    <div className="flex items-center gap-2">
                        {session ? (
                            <>
                                {/* Chat - Desktop */}
                                <Link
                                    href="/chat"
                                    className="hidden sm:block p-2 text-dark-100 hover:text-primary hover:bg-light-200 rounded-lg transition-all duration-200"
                                    aria-label="Chat"
                                >
                                    <MessageSquare className="w-5 h-5" />
                                </Link>

                                {/* Notifications */}
                                <NotificationDropdown />

                                {/* User Menu */}
                                <div
                                    className="relative"
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <button
                                        className="p-2 text-dark-100 hover:text-primary hover:bg-light-200 rounded-lg transition-all duration-200"
                                        aria-label="Profiel"
                                    >
                                        <User className="w-5 h-5" />
                                    </button>

                                    {showUserMenu && (
                                        <div
                                            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-light-400 py-1 z-50 overflow-hidden"
                                            onMouseEnter={handleMouseEnter}
                                        >
                                            <div className="px-4 py-3 bg-light-50 border-b border-light-400">
                                                <p className="text-xs font-bold text-dark truncate">{session.user?.name}</p>
                                                <p className="text-[10px] text-dark-100 truncate">{session.user?.jobTitle || userRole || 'EMPLOYEE'}</p>
                                            </div>
                                            <Link
                                                href="/profile"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-light-200 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <User className="w-4 h-4" />
                                                Profiel
                                            </Link>
                                            <Link
                                                href="/settings"
                                                className="flex items-center gap-2 px-4 py-2 text-sm text-dark hover:bg-light-200 transition-colors"
                                                onClick={() => setShowUserMenu(false)}
                                            >
                                                <Settings className="w-4 h-4" />
                                                Instellingen
                                            </Link>
                                            {canAccessAdmin && (
                                                <Link
                                                    href="/admin"
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-primary font-bold hover:bg-light-200 transition-colors"
                                                    onClick={() => setShowUserMenu(false)}
                                                >
                                                    <Shield className="w-4 h-4" />
                                                    Admin Dashboard
                                                </Link>
                                            )}
                                            <hr className="my-1 border-light-400" />
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false);
                                                    signOut();
                                                }}
                                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-error hover:bg-light-200 transition-colors"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Uitloggen
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => signIn('azure-ad')}
                                className="btn btn-primary text-sm"
                            >
                                Inloggen
                            </button>
                        )}

                        {/* Mobile Hamburger - Always visible on small screens */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-dark-100 hover:text-primary transition-colors"
                            aria-label="Open menu"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sub-bar for Search */}
            <div className="bg-light-100 border-b border-light-400 py-2">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-center md:justify-start">
                        <div className="w-full max-w-2xl">
                            <GlobalSearch />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                >
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
                </div>
            )}

            {/* Sidebar Content */}
            <div className={cn(
                "fixed top-0 left-0 bottom-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex flex-col h-full">
                    {/* Sidebar Header */}
                    <div className="p-4 border-b border-light-400 flex items-center justify-between bg-light-50">
                        <Link href="/" className="flex items-center gap-2" onClick={() => setIsSidebarOpen(false)}>
                            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center">
                                <span className="text-white font-bold text-lg">TC</span>
                            </div>
                            <span className="font-bold text-lg text-dark">HubTC</span>
                        </Link>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 text-dark-100 hover:text-primary transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Sidebar Nav Items */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    onClick={() => setIsSidebarOpen(false)}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                                        isActive
                                            ? "bg-primary text-white shadow-md shadow-primary/20"
                                            : "text-dark-100 hover:bg-light-200 hover:text-primary"
                                    )}
                                >
                                    {item.name === 'Home' && <Home className="w-5 h-5" />}
                                    {item.name === 'Phenix' && <div className="w-5 h-5 flex items-center justify-center font-bold text-[10px] border-2 border-current rounded">P</div>}
                                    {item.name === 'Platformstatus' && <div className="w-5 h-5 flex items-center justify-center"><div className="w-2 h-2 bg-success rounded-full animate-pulse" /></div>}
                                    {item.name === 'Discussies' && <MessageSquare className="w-5 h-5" />}
                                    {item.name === 'Training' && <div className="w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-current rounded italic">T</div>}
                                    {item.name === 'Support Portal' && <div className="w-5 h-5 flex items-center justify-center text-sm font-bold border-2 border-current rounded-full">?</div>}
                                    {item.name === 'Ideas Portal' && <div className="w-5 h-5 flex items-center justify-center text-xs font-bold border-2 border-current rounded">!</div>}
                                    {item.name}
                                </Link>
                            );
                        })}

                        <div className="pt-4 mt-4 border-t border-light-400">
                            <p className="px-4 text-[10px] font-bold text-dark-100/50 uppercase tracking-widest mb-2">TC Hubs</p>
                            <TCHubsMenu isMobile onNavigate={() => setIsSidebarOpen(false)} />
                        </div>
                    </div>

                    {/* Sidebar Footer (User Info) */}
                    {session && (
                        <div className="p-4 border-t border-light-400 bg-light-50">
                            <div className="flex items-center gap-3 mb-4 px-2">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt="" className="w-10 h-10 rounded-full border-2 border-white shadow-sm" />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                        {session.user?.name?.charAt(0)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-dark truncate">{session.user?.name}</p>
                                    <p className="text-[10px] text-dark-100 truncate">{session.user?.jobTitle || userRole || 'EMPLOYEE'}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-2 text-xs">
                                {canAccessAdmin && (
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="flex items-center justify-center gap-2 p-3 bg-primary text-white border border-primary rounded-xl hover:bg-primary-600 transition-colors shadow-sm font-bold mb-1"
                                    >
                                        <Shield className="w-4 h-4" /> Admin Dashboard
                                    </Link>
                                )}
                                <Link
                                    href="/profile"
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="flex items-center justify-center gap-2 p-3 bg-white border border-light-400 rounded-xl hover:bg-light-100 transition-colors shadow-sm"
                                >
                                    <User className="w-4 h-4" /> Profiel
                                </Link>
                                <button
                                    onClick={() => { setIsSidebarOpen(false); signOut(); }}
                                    className="flex items-center justify-center gap-2 p-3 bg-white border border-light-400 rounded-xl text-error hover:bg-error/5 transition-colors shadow-sm"
                                >
                                    <LogOut className="w-4 h-4" /> Uitloggen
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </nav>
    );
}
