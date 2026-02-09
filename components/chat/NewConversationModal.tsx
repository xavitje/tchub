'use client';

import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, Search, Users, Check } from 'lucide-react';
import { useNotification } from '../ui/NotificationSystem';

interface User {
    id: string;
    displayName: string;
    email: string;
    profileImage?: string;
    jobTitle?: string;
}

interface NewConversationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConversationCreated: () => void;
}

export function NewConversationModal({ isOpen, onClose, onConversationCreated }: NewConversationModalProps) {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
    const [isGroup, setIsGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searching, setSearching] = useState(false);
    const [creating, setCreating] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                searchUsers();
            } else {
                setSearchResults([]);
            }
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const searchUsers = async () => {
        setSearching(true);
        try {
            const res = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}`);
            if (res.ok) {
                const data = await res.json();
                setSearchResults(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSearching(false);
        }
    };

    const toggleUser = (user: User) => {
        if (selectedUsers.some(u => u.id === user.id)) {
            setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
        } else {
            if (!isGroup && selectedUsers.length > 0) {
                // If not group mode, replace current selection (1-on-1)
                setSelectedUsers([user]);
            } else {
                setSelectedUsers([...selectedUsers, user]);
            }
        }
    };

    const handleCreate = async () => {
        if (selectedUsers.length === 0) return;
        if (isGroup && !groupName.trim()) {
            showNotification('error', 'Groepsnaam is verplicht');
            return;
        }

        setCreating(true);
        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userIds: selectedUsers.map(u => u.id),
                    isGroup,
                    name: isGroup ? groupName : undefined
                })
            });

            if (res.ok) {
                showNotification('success', 'Gesprek aangemaakt');
                onConversationCreated();
                onClose();
                // Reset state
                setSelectedUsers([]);
                setGroupName('');
                setSearchQuery('');
                setIsGroup(false);
            } else {
                showNotification('error', 'Kon gesprek niet aanmaken');
            }
        } catch (error) {
            showNotification('error', 'Systeemfout');
        } finally {
            setCreating(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-4 border-b border-light-400 flex items-center justify-between">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Users className="w-5 h-5" /> Nieuw gesprek
                    </h2>
                    <button onClick={onClose} className="p-1 hover:bg-light-200 rounded-full">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 overflow-y-auto space-y-4">

                    {/* Group Toggle */}
                    <div className="flex items-center gap-2">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={isGroup}
                                onChange={(e) => { setIsGroup(e.target.checked); if (!e.target.checked && selectedUsers.length > 1) setSelectedUsers([selectedUsers[0]]); }}
                                className="toggle"
                            />
                            <span className="text-sm font-medium">Groepsgesprek maken</span>
                        </label>
                    </div>

                    {isGroup && (
                        <input
                            type="text"
                            placeholder="Groepsnaam (bijv. Marketing Team)"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            className="input w-full"
                            autoFocus
                        />
                    )}

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                        <input
                            type="text"
                            placeholder="Zoek collega's..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input w-full pl-9"
                        />
                    </div>

                    {/* Selected Users */}
                    {selectedUsers.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {selectedUsers.map(user => (
                                <div key={user.id} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                                    {user.displayName}
                                    <button onClick={() => toggleUser(user)} className="hover:text-primary-dark">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Results List */}
                    <div className="space-y-1 mt-2">
                        {searching ? (
                            <p className="text-center text-sm text-dark-100 py-4">Zoeken...</p>
                        ) : searchResults.length > 0 ? (
                            searchResults.map(user => {
                                const isSelected = selectedUsers.some(u => u.id === user.id);
                                return (
                                    <button
                                        key={user.id}
                                        onClick={() => toggleUser(user)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-light-100'}`}
                                    >
                                        <div className="relative">
                                            {user.profileImage ? (
                                                <img src={user.profileImage} alt={user.displayName} className="w-10 h-10 rounded-full object-cover" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                                    {user.displayName.charAt(0)}
                                                </div>
                                            )}
                                            {isSelected && (
                                                <div className="absolute -bottom-1 -right-1 bg-primary text-white rounded-full p-0.5 border-2 border-white">
                                                    <Check className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="font-medium text-sm truncate">{user.displayName}</p>
                                            <p className="text-xs text-dark-100 truncate">{user.jobTitle || user.email}</p>
                                        </div>
                                    </button>
                                );
                            })
                        ) : searchQuery.length >= 2 ? (
                            <p className="text-center text-sm text-dark-100 py-4">Geen gebruikers gevonden</p>
                        ) : null}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-light-400 flex justify-end gap-2">
                    <button onClick={onClose} className="btn btn-secondary">Annuleren</button>
                    <button
                        onClick={handleCreate}
                        disabled={selectedUsers.length === 0 || creating || (isGroup && !groupName)}
                        className="btn btn-primary"
                    >
                        {creating ? 'Maken...' : 'Start Gesprek'}
                    </button>
                </div>
            </div>
        </div>
    );
}
