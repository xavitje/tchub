'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Plus, MessageSquare, Search, MoreVertical, BellOff, Bell, Users } from 'lucide-react';
import { NewConversationModal } from './NewConversationModal';
import { useNotification } from '../ui/NotificationSystem';

interface Conversation {
    id: string;
    isGroup: boolean;
    name?: string;
    image?: string;
    lastMessageAt: string;
    users: {
        id: string;
        displayName: string;
        profileImage?: string;
    }[];
    messages: {
        content?: string;
        createdAt: string;
    }[];
    settings?: {
        isMuted: boolean;
    }[];
}

export function ChatSidebar({
    selectedConversationId,
    onSelectConversation
}: {
    selectedConversationId?: string;
    onSelectConversation: (id: string) => void;
}) {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat');
            if (res.ok) {
                const data = await res.json();
                setConversations(data);
            }
        } catch (error) {
            console.error('Error fetching conversations:', error);
        }
    };

    const toggleMute = async (conversationId: string, isMuted: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            const res = await fetch(`/api/chat/${conversationId}/settings`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isMuted: !isMuted })
            });

            if (res.ok) {
                fetchConversations();
                showNotification('success', !isMuted ? 'Gesprek gedempt' : 'Geluid aan');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const filteredConversations = conversations.filter(c => {
        let displayName = c.name;
        if (!displayName) {
            const otherUsers = c.users.filter(u => u.id !== session?.user?.id);
            displayName = otherUsers.map(u => u.displayName).join(', ');
        }
        return displayName?.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <div className="w-80 border-r border-light-400 bg-white flex flex-col h-full">
            {/* Header */}
            <div className="p-4 border-b border-light-400 flex items-center justify-between">
                <h2 className="text-xl font-bold">Berichten</h2>
                <button
                    onClick={() => setIsNewModalOpen(true)}
                    className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </div>

            {/* Search */}
            <div className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-100" />
                    <input
                        type="text"
                        placeholder="Zoek gesprekken..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input w-full pl-9"
                    />
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                    <div className="text-center p-8 text-dark-100">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>Nog geen gesprekken</p>
                    </div>
                ) : (
                    filteredConversations.map((conversation) => {
                        const otherUsers = conversation.users.filter(u => u.id !== session?.user?.id);
                        const displayName = conversation.name || otherUsers.map(u => u.displayName).join(', ');
                        const lastMessage = conversation.messages[0];

                        // Check if muted
                        // Backend API currently returns: include: { messages: ..., users: ... }
                        // It does NOT include settings yet in GET /api/chat! 
                        // I need to update GET /api/chat to include settings.
                        // For now assuming it might, but likely undefined.
                        const isMuted = conversation.settings?.some(s => s.isMuted);

                        return (
                            <div
                                key={conversation.id}
                                className={`w-full p-4 flex items-center gap-3 hover:bg-light-100 transition-colors border-b border-light-400/50 cursor-pointer group relative ${selectedConversationId === conversation.id ? 'bg-primary/5 hover:bg-primary/10' : ''
                                    }`}
                                onClick={() => onSelectConversation(conversation.id)}
                            >
                                <div className="relative">
                                    {conversation.isGroup && conversation.image ? (
                                        <img src={conversation.image} alt={displayName} className="w-12 h-12 rounded-lg object-cover" />
                                    ) : conversation.isGroup ? (
                                        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                                            <Users className="w-6 h-6 text-primary" />
                                        </div>
                                    ) : otherUsers[0]?.profileImage ? (
                                        <img src={otherUsers[0].profileImage} alt={displayName} className="w-12 h-12 rounded-full object-cover" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-bold text-primary">
                                            {displayName.charAt(0)}
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 text-left min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold truncate pr-2">{displayName}</h3>
                                        <span className="text-xs text-dark-100 whitespace-nowrap">
                                            {lastMessage ? new Date(lastMessage.createdAt).toLocaleDateString() : ''}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mt-1">
                                        <p className="text-sm text-dark-100 truncate pr-2">
                                            {lastMessage?.content || 'Geen berichten'}
                                        </p>
                                        {isMuted && <BellOff className="w-3 h-3 text-dark-100 flex-shrink-0" />}
                                    </div>
                                </div>

                                {/* Mute Button on Hover */}
                                <button
                                    onClick={(e) => toggleMute(conversation.id, !!isMuted, e)}
                                    className="absolute right-2 bottom-2 p-1.5 bg-white shadow-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-light-200"
                                    title={isMuted ? "Geluid aan" : "Dempen"}
                                >
                                    {isMuted ? <Bell className="w-3 h-3 text-dark" /> : <BellOff className="w-3 h-3 text-dark" />}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            <NewConversationModal
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onConversationCreated={fetchConversations}
            />
        </div>
    );
}
