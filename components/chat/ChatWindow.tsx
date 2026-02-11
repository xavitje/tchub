'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Send, Smile, Paperclip, X, Image as ImageIcon, File as FileIcon, MoreVertical, Edit2, Trash2, Check, AlertCircle, CheckCheck, Reply, Check as CheckSingle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useNotification } from '../ui/NotificationSystem';
import { validateFile } from '@/lib/upload';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';

interface Message {
    id: string;
    content?: string;
    image?: string;
    fileUrl?: string;
    fileName?: string;
    createdAt: string;
    isEdited: boolean;
    deletedAt?: string | null;
    sender: {
        id: string;
        displayName: string;
        profileImage?: string;
    };
    reactions: {
        id: string;
        emoji: string;
        userId: string;
    }[];
    reads?: {
        userId: string;
        readAt: string;
    }[];
    replyTo?: {
        id: string;
        content?: string;
        sender: {
            displayName: string;
        };
    };
}

interface ChatWindowProps {
    conversationId: string;
}

export function ChatWindow({ conversationId }: ChatWindowProps) {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const searchParams = useSearchParams();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [attachment, setAttachment] = useState<{ url: string, filename: string, type: 'image' | 'file' } | null>(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [reactingToMessageId, setReactingToMessageId] = useState<string | null>(null);
    const [editingMessage, setEditingMessage] = useState<Message | null>(null);
    const [editContent, setEditContent] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);
    const [replyingTo, setReplyingTo] = useState<Message | null>(null);

    // Typing indicators
    const [typingUsers, setTypingUsers] = useState<{ user: { displayName: string, profileImage?: string } }[]>([]);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const isUserAtBottomRef = useRef(true);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Scroll naar specifiek bericht als messageId in URL staat (vanuit notificatie)
    useEffect(() => {
        const highlightMessageId = searchParams.get('messageId');
        if (highlightMessageId && messages.length > 0) {
            const element = document.getElementById(`message-${highlightMessageId}`);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('bg-primary-50', 'transition-colors', 'duration-1000');
                setTimeout(() => element.classList.remove('bg-primary-50'), 3000);
            }
        }
    }, [messages, searchParams]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(() => {
            fetchMessages();
            fetchTypingStatus();
        }, 3000);
        return () => clearInterval(interval);
    }, [conversationId]);

    useEffect(() => {
        // Mark last message as read if it's not from us
        if (messages.length > 0 && session?.user?.id) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.sender.id !== session.user.id) {
                markAsRead(lastMsg.id);
            }
        }
    }, [messages, editingMessage, typingUsers, session?.user?.id]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
                setReactingToMessageId(null);
            }
            if (activeMessageMenu && !(event.target as Element).closest('.message-menu-btn')) {
                setActiveMessageMenu(null);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [activeMessageMenu]);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat/${conversationId}/messages?t=${Date.now()}`, {
                cache: 'no-store'
            });
            if (res.ok) {
                const serverMessages: Message[] = await res.json();
                console.log(`[ChatWindow] Fetched ${serverMessages.length} messages`);
                setMessages(currentMessages => {
                    const serverIds = new Set(serverMessages.map(m => m.id));
                    const localKeepers = currentMessages.filter(m => !serverIds.has(m.id));
                    const merged = [...serverMessages, ...localKeepers].sort((a, b) =>
                        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                    );
                    return merged;
                });
            }
        } catch (error) {
            console.error('[ChatWindow] Error fetching messages:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTypingStatus = async () => {
        try {
            const res = await fetch(`/api/chat/${conversationId}/typing`);
            if (res.ok) {
                const data = await res.json();
                setTypingUsers(data);
            }
        } catch (error) { /* silence */ }
    };

    const markAsRead = async (messageId: string) => {
        try {
            await fetch(`/api/chat/${conversationId}/messages/${messageId}/read`, { method: 'POST' });
        } catch (e) { /* ignore */ }
    };

    const handleTyping = () => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        } else {
            fetch(`/api/chat/${conversationId}/typing`, { method: 'POST' });
        }
        typingTimeoutRef.current = setTimeout(() => {
            typingTimeoutRef.current = null;
        }, 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const scrollToMessage = (msgId: string) => {
        const element = document.getElementById(`message-${msgId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('bg-primary/10', 'ring-2', 'ring-primary/50', 'transition-all', 'duration-500');
            setTimeout(() => {
                element.classList.remove('bg-primary/10', 'ring-2', 'ring-primary/50');
            }, 2000);
        }
    };

    const handleReply = (message: Message) => {
        setReplyingTo(message);
        setActiveMessageMenu(null);
    };

    const handleQuickReaction = async (messageId: string, emoji: string) => {
        try {
            const res = await fetch(`/api/chat/${conversationId}/messages/${messageId}/reactions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji })
            });

            if (res.ok) {
                fetchMessages();
            }
        } catch (error) {
            console.error('Reaction error:', error);
        }
        setReactingToMessageId(null);
        setShowEmojiPicker(false);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const error = validateFile(file);
        if (error) {
            showNotification('error', error);
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                setAttachment(data);
            } else {
                showNotification('error', 'Uploaden mislukt');
            }
        } catch (error) {
            showNotification('error', 'Fout bij uploaden');
        } finally {
            setIsUploading(false);
        }
    };

    const handleEmojiClick = async (emojiData: EmojiClickData) => {
        if (reactingToMessageId) {
            try {
                const res = await fetch(`/api/chat/${conversationId}/messages/${reactingToMessageId}/reactions`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ emoji: emojiData.emoji })
                });

                if (res.ok) {
                    fetchMessages();
                }
            } catch (error) {
                console.error('Reaction error:', error);
            }
            setReactingToMessageId(null);
            setShowEmojiPicker(false);
        } else {
            setNewMessage(prev => prev + emojiData.emoji);
        }
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newMessage.trim() && !attachment)) return;

        try {
            const res = await fetch(`/api/chat/${conversationId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newMessage,
                    image: attachment?.type === 'image' ? attachment.url : undefined,
                    fileUrl: attachment?.type === 'file' ? attachment.url : undefined,
                    fileName: attachment?.type === 'file' ? attachment.filename : undefined,
                    replyToId: replyingTo?.id
                })
            });

            if (res.ok) {
                const message = await res.json();
                setMessages(prev => [...prev, message]);
                setNewMessage('');
                setAttachment(null);
                setReplyingTo(null);
                isUserAtBottomRef.current = true;
                setTimeout(scrollToBottom, 50);
            } else {
                showNotification('error', 'Fout bij verzenden bericht');
            }
        } catch (error) {
            showNotification('error', 'Systeemfout bij verzenden bericht');
        }
    };

    const handleEditSave = async () => {
        if (!editingMessage || !editContent.trim()) return;

        console.log(`[ChatWindow] Saving edit for message ${editingMessage.id}. Content:`, editContent);
        try {
            const res = await fetch(`/api/chat/${conversationId}/messages/${editingMessage.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: editContent })
            });

            if (res.ok) {
                const updated = await res.json();
                console.log(`[ChatWindow] Edit successful:`, updated);
                setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
                setEditingMessage(null);
                setEditContent('');
            } else {
                const data = await res.json();
                console.error(`[ChatWindow] Edit failed (backend):`, data);
                showNotification('error', data.error || 'Fout bij bewerken');
            }
        } catch (error) {
            console.error(`[ChatWindow] Edit error (catch):`, error);
            showNotification('error', 'Fout bij bewerken');
        }
    };

    const handleDelete = async (messageId: string) => {
        if (!confirm('Weet je zeker dat je dit bericht wilt verwijderen?')) return;

        try {
            const res = await fetch(`/api/chat/${conversationId}/messages/${messageId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                fetchMessages();
            } else {
                showNotification('error', 'Fout bij verwijderen');
            }
        } catch (error) {
            showNotification('error', 'Fout bij verwijderen');
        }
    };

    const removeReaction = async (messageId: string, emoji: string) => {
        try {
            await fetch(`/api/chat/${conversationId}/messages/${messageId}/reactions`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emoji })
            });
            fetchMessages();
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

    return (
        <div className="flex flex-col h-full relative">
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-dark-100 py-12"><p>Nog geen berichten. Start het gesprek!</p></div>
                ) : (
                    messages.map((message, index) => {
                        const isOwn = message.sender.id === session?.user?.id;
                        const isDeleted = !!message.deletedAt;
                        const canEdit = isOwn && !isDeleted && (Date.now() - new Date(message.createdAt).getTime() < 24 * 60 * 60 * 1000); // Expanded for testing
                        const isRead = message.reads && message.reads.length > 0;

                        return (
                            <div key={message.id} id={`message-${message.id}`} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} group relative transition-colors rounded-lg p-1`}>
                                <div className={`flex max-w-[85%] gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`flex flex-col min-w-0 ${isOwn ? 'items-end' : 'items-start'}`}>
                                        {!isOwn && (
                                            <div className="flex items-center gap-2 mb-1 px-1">
                                                {message.sender.profileImage ? (
                                                    <img src={message.sender.profileImage} alt={message.sender.displayName} className="w-5 h-5 rounded-full" />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                                                        {message.sender.displayName.charAt(0)}
                                                    </div>
                                                )}
                                                <p className="text-xs text-dark-100 font-medium">{message.sender.displayName}</p>
                                            </div>
                                        )}

                                        {message.replyTo && !isDeleted && (
                                            <button
                                                onClick={() => message.replyTo && scrollToMessage(message.replyTo.id)}
                                                className={`w-full text-left text-xs mb-1 p-2 rounded-lg border-l-2 transition-colors hover:bg-opacity-50 ${isOwn ? 'bg-black/5 border-primary text-dark-100' : 'bg-black/5 border-light-400 text-dark-100'}`}
                                            >
                                                <p className="font-semibold mb-0.5 text-[10px]">{message.replyTo.sender.displayName}</p>
                                                <p className="truncate line-clamp-1">{message.replyTo.content || 'Bijlage'}</p>
                                            </button>
                                        )}

                                        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                                            <div className={`rounded-2xl px-4 py-2 shadow-sm ${isOwn ? 'bg-primary text-white' : 'bg-light-200 text-dark'} ${isDeleted ? 'opacity-50 italic border border-dark-100/20 bg-transparent text-dark-100' : ''}`}>
                                                {isDeleted ? (
                                                    <p className="flex items-center gap-2 text-sm"><AlertCircle className="w-4 h-4" /> Dit bericht is verwijderd</p>
                                                ) : editingMessage?.id === message.id ? (
                                                    <div className="flex gap-2 items-center min-w-[200px]">
                                                        <input
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            className="flex-1 px-2 py-1 rounded text-dark bg-white border border-light-400 focus:outline-none focus:border-primary text-sm"
                                                            autoFocus
                                                            onKeyDown={(e) => { if (e.key === 'Enter') handleEditSave(); else if (e.key === 'Escape') setEditingMessage(null); }}
                                                        />
                                                        <button type="button" onClick={handleEditSave} className="p-1 hover:bg-white/20 rounded"><Check className="w-4 h-4" /></button>
                                                        <button type="button" onClick={() => setEditingMessage(null)} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        {message.content && <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>}
                                                        {message.image && <img src={message.image} alt="Afbeelding" className="rounded-lg mt-2 max-w-full" />}
                                                        {message.fileUrl && (
                                                            <a href={message.fileUrl} className="flex items-center gap-2 mt-2 underline text-xs" target="_blank" rel="noopener noreferrer">
                                                                <Paperclip className="w-3 h-3" /> {message.fileName || 'Bijlage'}
                                                            </a>
                                                        )}
                                                    </>
                                                )}
                                            </div>

                                            {/* Action Buttons (Hover) */}
                                            {!isDeleted && !editingMessage && (
                                                <div
                                                    className={`flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30 ${isOwn ? 'items-end' : 'items-start'}`}
                                                    onMouseLeave={() => {
                                                        setActiveMessageMenu(null);
                                                        setReactingToMessageId(null);
                                                    }}
                                                >
                                                    <div className="flex items-center bg-white shadow-sm border border-light-400 rounded-full p-0.5">
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); setReactingToMessageId(reactingToMessageId === message.id ? null : message.id); }}
                                                                onMouseEnter={() => setReactingToMessageId(message.id)}
                                                                className="p-1 hover:bg-light-200 rounded-full text-dark-100 transition-colors"
                                                                title="Reageren"
                                                            >
                                                                <Smile className="w-4 h-4" />
                                                            </button>

                                                            {reactingToMessageId === message.id && (
                                                                <div
                                                                    className={`absolute ${index < 2 ? 'top-full mt-2' : 'bottom-full mb-2'} ${isOwn ? 'right-0' : 'left-0'} bg-white shadow-lg rounded-full border border-light-400 p-1 flex items-center gap-1 min-w-max z-50 animate-in fade-in zoom-in duration-200`}
                                                                    onMouseLeave={() => setReactingToMessageId(null)}
                                                                >
                                                                    {['👍', '❤️', '😂', '😮', '😢', '🙏'].map(emoji => (
                                                                        <button
                                                                            key={emoji}
                                                                            onClick={(e) => { e.stopPropagation(); handleQuickReaction(message.id, emoji); setReactingToMessageId(null); }}
                                                                            className="w-8 h-8 flex items-center justify-center hover:bg-light-100 rounded-full transition-colors text-lg"
                                                                        >
                                                                            {emoji}
                                                                        </button>
                                                                    ))}
                                                                    <div className="w-px h-6 bg-light-400 mx-1" />
                                                                    <button
                                                                        onClick={(e) => { e.stopPropagation(); setShowEmojiPicker(true); setReactingToMessageId(null); }}
                                                                        className="w-8 h-8 flex items-center justify-center hover:bg-light-100 rounded-full transition-colors text-dark-100"
                                                                        title="Meer..."
                                                                    >
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleReply(message); }}
                                                            className="p-1 hover:bg-light-200 rounded-full text-dark-100 transition-colors"
                                                            title="Beantwoorden"
                                                        >
                                                            <Reply className="w-4 h-4" />
                                                        </button>

                                                        {isOwn && (
                                                            <div className="relative">
                                                                <button
                                                                    type="button"
                                                                    onClick={(e) => { e.stopPropagation(); setActiveMessageMenu(activeMessageMenu === message.id ? null : message.id); }}
                                                                    onMouseEnter={() => setActiveMessageMenu(message.id)}
                                                                    className="p-1 hover:bg-light-200 rounded-full text-dark-100 message-menu-btn transition-colors"
                                                                    title="Opties"
                                                                >
                                                                    <MoreVertical className="w-4 h-4" />
                                                                </button>

                                                                {activeMessageMenu === message.id && (
                                                                    <div
                                                                        className={`absolute ${index < 2 ? 'top-full mt-1' : 'bottom-full mb-1'} ${isOwn ? 'right-0' : 'left-0'} w-32 bg-white shadow-lg rounded-lg border border-light-400 z-50 py-1 animate-in fade-in slide-in-from-bottom-2 duration-200`}
                                                                        onMouseLeave={() => setActiveMessageMenu(null)}
                                                                    >
                                                                        {canEdit && (
                                                                            <button
                                                                                onClick={(e) => { e.stopPropagation(); setEditingMessage(message); setEditContent(message.content || ''); setActiveMessageMenu(null); }}
                                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-light-200 flex items-center gap-2 text-dark"
                                                                            >
                                                                                <Edit2 className="w-3 h-3" /> Bewerken
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={(e) => { e.stopPropagation(); handleDelete(message.id); setActiveMessageMenu(null); }}
                                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-light-200 text-error flex items-center gap-2"
                                                                        >
                                                                            <Trash2 className="w-3 h-3" /> Verwijderen
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {!isDeleted && message.reactions && message.reactions.length > 0 && (
                                            <div className={`flex flex-wrap gap-1 mt-1 px-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                {Array.from(new Set(message.reactions.map(r => r.emoji))).map(emoji => {
                                                    const count = message.reactions.filter(r => r.emoji === emoji).length;
                                                    const hasReacted = message.reactions.some(r => r.emoji === emoji && r.userId === session?.user?.id);
                                                    return (
                                                        <button
                                                            key={emoji}
                                                            type="button"
                                                            onClick={(e) => { e.stopPropagation(); hasReacted ? removeReaction(message.id, emoji) : handleQuickReaction(message.id, emoji); }}
                                                            className={`text-xs px-2 py-0.5 rounded-full border transition-colors shadow-sm ${hasReacted ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-light-400 text-dark hover:bg-light-100'}`}
                                                        >
                                                            {emoji} <span className="text-[10px] font-medium">{count > 1 && count}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {!isDeleted && (
                                            <div className={`flex items-center gap-1 mt-1 px-1 w-full ${isOwn ? 'justify-end' : 'justify-start'}`}>
                                                <p className="text-[10px] text-dark-100 opacity-60 font-medium">
                                                    {new Date(message.createdAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                                                    {message.isEdited && ' (bewerkt)'}
                                                </p>
                                                {isOwn && (
                                                    isRead ? (
                                                        <span title="Gelezen"><CheckCheck className="w-3 h-3 text-primary" /></span>
                                                    ) : (
                                                        <span title="Verzonden"><CheckSingle className="w-3 h-3 text-dark-100/40" /></span>
                                                    )
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}

                {typingUsers.length > 0 && (
                    <div className="flex items-center gap-2 px-4 py-2 text-xs text-dark-100 italic">
                        <span className="jumping-dots">
                            {typingUsers.map(u => u.user.displayName).join(', ')} is aan het typen...
                        </span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="border-t border-light-400 p-4 bg-white relative z-20">
                {replyingTo && (
                    <div className="flex items-center justify-between bg-light-100 p-2 rounded-t-lg border-b border-light-300 mb-2 text-sm">
                        <div className="flex items-center gap-2 text-dark-100">
                            <Reply className="w-4 h-4" />
                            <span className="truncate max-w-[200px]">Antwoord op <strong>{replyingTo.sender.displayName}</strong>: {replyingTo.content || 'Bijlage'}</span>
                        </div>
                        <button type="button" onClick={() => setReplyingTo(null)} className="hover:text-error"><X className="w-4 h-4" /></button>
                    </div>
                )}
                {attachment && (
                    <div className="flex items-center gap-2 mb-2 p-2 bg-light-200 rounded-lg w-fit">
                        {attachment.type === 'image' ? <ImageIcon className="w-4 h-4 text-primary" /> : <FileIcon className="w-4 h-4 text-primary" />}
                        <span className="text-sm truncate max-w-[200px]">{attachment.filename}</span>
                        <button type="button" onClick={() => setAttachment(null)} className="hover:text-error"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="flex items-center gap-2 relative">
                    {showEmojiPicker && (
                        <div ref={emojiPickerRef} className="absolute bottom-16 left-0 z-50 shadow-xl rounded-lg overflow-hidden border border-light-300">
                            <EmojiPicker onEmojiClick={handleEmojiClick} width={300} height={400} />
                        </div>
                    )}

                    <button type="button" onClick={() => { setShowEmojiPicker(!showEmojiPicker); setReactingToMessageId(null); }} className="p-2 hover:bg-light-200 rounded-lg transition-colors">
                        <Smile className="w-6 h-6 text-dark-100" />
                    </button>

                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />

                    <button type="button" onClick={() => fileInputRef.current?.click()} className={`p-2 hover:bg-light-200 rounded-lg transition-colors ${isUploading ? 'animate-pulse' : ''}`} disabled={isUploading}>
                        <Paperclip className="w-6 h-6 text-dark-100" />
                    </button>

                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => { setNewMessage(e.target.value); handleTyping(); }}
                        placeholder="Type een bericht..."
                        className="flex-1 input h-10"
                        disabled={isUploading}
                    />

                    <button type="submit" disabled={(!newMessage.trim() && !attachment) || isUploading} className="btn btn-primary p-2 h-10 w-10 flex items-center justify-center rounded-lg"><Send className="w-5 h-5" /></button>
                </div>
            </form>
        </div>
    );
}
