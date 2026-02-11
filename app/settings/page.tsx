'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Moon, Sun, Monitor, Save, GripVertical } from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationSystem';
import { useSettings } from '@/components/providers/SettingsProvider';

export default function SettingsPage() {
    const { data: session, status } = useSession();
    const { showNotification } = useNotification();
    const { theme, headerOrder, updateTheme, updateHeaderOrder } = useSettings();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [emailNotifications, setEmailNotifications] = useState(true);
    const [pushNotifications, setPushNotifications] = useState(true);

    useEffect(() => {
        if (session) {
            fetchSettings();
        }
    }, [session]);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings');
            if (res.ok) {
                const data = await res.json();
                updateTheme(data.theme);
                updateHeaderOrder(data.headerOrder);
                setEmailNotifications(data.emailNotifications);
                setPushNotifications(data.pushNotifications);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    theme,
                    headerOrder,
                    emailNotifications,
                    pushNotifications
                })
            });

            if (res.ok) {
                showNotification('success', 'Instellingen opgeslagen!');
            } else {
                showNotification('error', 'Fout bij opslaan instellingen');
            }
        } catch (error) {
            showNotification('error', 'Systeemfout bij opslaan');
        } finally {
            setSaving(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));

        if (dragIndex === dropIndex) return;

        const newOrder = [...headerOrder];
        const [removed] = newOrder.splice(dragIndex, 1);
        newOrder.splice(dropIndex, 0, removed);
        updateHeaderOrder(newOrder);
    };

    const getItemLabel = (item: string) => {
        const labels: Record<string, string> = {
            home: 'Home',
            discussions: 'Discussies',
            training: 'Training',
            hubs: 'TC Hubs',
            support: 'Support'
        };
        return labels[item] || item;
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-light flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-dark mb-2">Log in om instellingen te bekijken</h1>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-light py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-dark mb-8">Instellingen</h1>

                <div className="space-y-6">
                    {/* Theme Settings */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-dark mb-4">Thema</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                                onClick={() => updateTheme('LIGHT')}
                                className={`p-4 rounded-lg border-2 transition-all ${theme === 'LIGHT'
                                    ? 'border-primary bg-primary-50'
                                    : 'border-light-400 hover:border-primary-200'
                                    }`}
                            >
                                <Sun className={`w-8 h-8 mx-auto mb-2 ${theme === 'LIGHT' ? 'text-primary' : 'text-dark-100'}`} />
                                <h3 className="font-semibold text-dark">Licht</h3>
                            </button>

                            <button
                                onClick={() => updateTheme('DARK')}
                                className={`p-4 rounded-lg border-2 transition-all ${theme === 'DARK'
                                    ? 'border-primary bg-primary-50'
                                    : 'border-light-400 hover:border-primary-200'
                                    }`}
                            >
                                <Moon className={`w-8 h-8 mx-auto mb-2 ${theme === 'DARK' ? 'text-primary' : 'text-dark-100'}`} />
                                <h3 className="font-semibold text-dark">Donker</h3>
                            </button>

                            <button
                                onClick={() => updateTheme('SYSTEM')}
                                className={`p-4 rounded-lg border-2 transition-all ${theme === 'SYSTEM'
                                    ? 'border-primary bg-primary-50'
                                    : 'border-light-400 hover:border-primary-200'
                                    }`}
                            >
                                <Monitor className={`w-8 h-8 mx-auto mb-2 ${theme === 'SYSTEM' ? 'text-primary' : 'text-dark-100'}`} />
                                <h3 className="font-semibold text-dark">Systeem</h3>
                            </button>
                        </div>
                    </div>

                    {/* Header Order */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-dark mb-4">Header Volgorde</h2>
                        <p className="text-dark-100 mb-4">Sleep om de volgorde aan te passen</p>
                        <div className="space-y-2">
                            {headerOrder.map((item, index) => (
                                <div
                                    key={item}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                    className="flex items-center gap-3 p-3 bg-light-200 rounded-lg cursor-move hover:bg-light-300 transition-colors"
                                >
                                    <GripVertical className="w-5 h-5 text-dark-100" />
                                    <span className="font-medium text-dark">{getItemLabel(item)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="card p-6">
                        <h2 className="text-xl font-semibold text-dark mb-4">Meldingen</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-dark">E-mail meldingen</h3>
                                    <p className="text-sm text-dark-100">Ontvang updates via e-mail</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={emailNotifications}
                                        onChange={(e) => setEmailNotifications(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-light-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-light-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-dark">Push meldingen</h3>
                                    <p className="text-sm text-dark-100">Ontvang browser meldingen</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={pushNotifications}
                                        onChange={(e) => setPushNotifications(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-light-400 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-light-400 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn btn-primary flex items-center gap-2"
                        >
                            <Save className="w-5 h-5" />
                            {saving ? 'Opslaan...' : 'Opslaan'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
