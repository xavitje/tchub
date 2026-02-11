'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

// NOTE: This is largely a duplicate of /chat/page.tsx but with params handling
// ideally we'd refactor the layout, but for safety/speed we'll just implement the specific view logic here.

export default function ChatConversationPage({ params }: { params: { id: string } }) {
    const { data: session, status } = useSession();
    // Initialize with the ID from the URL
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(params.id);

    if (status === 'loading') {
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
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 text-dark-100" />
                    <h1 className="text-2xl font-bold text-dark mb-2">Log in om te chatten</h1>
                    <p className="text-dark-100">Je moet ingelogd zijn om berichten te versturen.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen bg-light flex">
            {/* Sidebar */}
            <div className="w-80 border-r border-light-400 bg-white">
                <ChatSidebar
                    selectedConversationId={selectedConversationId || undefined}
                    onSelectConversation={setSelectedConversationId}
                />
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 bg-white">
                {selectedConversationId ? (
                    <ChatWindow conversationId={selectedConversationId} />
                ) : (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center text-dark-100">
                            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p>Selecteer een gesprek om te beginnen</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
