'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Theme = 'LIGHT' | 'DARK' | 'SYSTEM';

interface SettingsContextType {
    theme: Theme;
    headerOrder: string[];
    updateTheme: (newTheme: Theme) => void;
    updateHeaderOrder: (newOrder: string[]) => void;
    loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    const [theme, setTheme] = useState<Theme>('LIGHT');
    const [headerOrder, setHeaderOrder] = useState<string[]>(['home', 'discussions', 'training', 'hubs', 'support']);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (session) {
            fetchSettings();
        } else {
            setLoading(false);
        }
    }, [session]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                if (data.theme) setTheme(data.theme);
                if (data.headerOrder) setHeaderOrder(data.headerOrder);
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    // Apply theme
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');

        if (theme === 'SYSTEM') {
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            root.classList.add(systemTheme);
        } else {
            root.classList.add(theme.toLowerCase());
        }
    }, [theme]);

    const updateTheme = (newTheme: Theme) => setTheme(newTheme);
    const updateHeaderOrder = (newOrder: string[]) => setHeaderOrder(newOrder);

    return (
        <SettingsContext.Provider value={{ theme, headerOrder, updateTheme, updateHeaderOrder, loading }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
}
