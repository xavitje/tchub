'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { ArrowLeft, Send, Paperclip, MoreVertical, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function TicketDetailPage({ params }: { params: { id: string } }) {
    const { data: session } = useSession();
    const router = useRouter();
    const [ticket, setTicket] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const fetchTicket = async () => {
        try {
            const res = await fetch(`/api/support/tickets/${params.id}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setTicket(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
        // Poll for new messages every 10 seconds
        const interval = setInterval(fetchTicket, 10000);
        return () => clearInterval(interval);
    }, [params.id]);

    useEffect(() => {
        // Scroll to bottom when messages change
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        try {
            const res = await fetch(`/api/support/tickets/${params.id}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage })
            });

            if (res.ok) {
                setNewMessage('');
                fetchTicket();
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-light flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    if (!ticket) return (
        <div className="min-h-screen bg-light p-8 text-center">
            <h1 className="text-2xl font-bold mb-4">Ticket niet gevonden</h1>
            <Link href="/support/tickets" className="text-primary hover:underline">Terug naar overzicht</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-light flex flex-col">
            {/* Header */}
            <div className="bg-white border-b border-light-300 px-4 py-4 shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/support/tickets" className="text-dark-100 hover:text-primary transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-lg font-bold text-dark">{ticket.subject}</h1>
                                <span className="text-xs bg-light-200 text-dark-100 px-2 py-0.5 rounded uppercase font-bold">
                                    #{ticket.id.slice(-6).toUpperCase()}
                                </span>
                            </div>
                            <p className="text-xs text-dark-100">
                                {ticket.category} • {new Date(ticket.createdAt).toLocaleDateString('nl-NL')}
                            </p>
                        </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                            ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                                'bg-yellow-100 text-yellow-700'
                        }`}>
                        {ticket.status}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-light-100">
                <div className="max-w-4xl mx-auto space-y-6 pb-4">
                    {/* System Message - Created */}
                    <div className="flex justify-center">
                        <span className="text-xs text-dark-100 bg-white border border-light-300 px-3 py-1 rounded-full shadow-sm">
                            Ticket aangemaakt op {new Date(ticket.createdAt).toLocaleString('nl-NL')}
                        </span>
                    </div>

                    {ticket.messages.map((msg: any) => {
                        const isMe = msg.senderId === session?.user?.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex items-end gap-2 max-w-[80%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className="w-8 h-8 rounded-full bg-light-300 flex-shrink-0 overflow-hidden">
                                        {msg.sender.profileImage ? (
                                            <img src={msg.sender.profileImage} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-dark-100">
                                                {msg.sender.displayName.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Bubble */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1 px-1">
                                            <span className="text-xs text-dark-100 font-medium">
                                                {isMe ? 'Jij' : msg.sender.displayName}
                                            </span>
                                            <span className="text-[10px] text-dark-200">
                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className={`p-4 rounded-2xl shadow-sm whitespace-pre-wrap text-sm ${isMe
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white text-dark border border-light-300 rounded-bl-none'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    {ticket.status === 'CLOSED' && (
                        <div className="flex justify-center my-8">
                            <div className="flex items-center gap-2 text-sm text-dark-100 bg-gray-100 px-4 py-2 rounded-lg">
                                <CheckCircle2 className="w-4 h-4" />
                                Dit ticket is gesloten. Je kunt niet meer reageren.
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Input Area */}
            {ticket.status !== 'CLOSED' && (
                <div className="bg-white border-t border-light-300 p-4 sticky bottom-0">
                    <div className="max-w-4xl mx-auto">
                        <form onSubmit={handleSendMessage} className="flex gap-4">
                            <button
                                type="button"
                                className="p-3 text-dark-100 hover:text-dark hover:bg-light-100 rounded-full transition-colors"
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Schrijf een bericht..."
                                className="flex-1 bg-light-100 border-none rounded-full px-6 focus:ring-2 focus:ring-primary focus:bg-white transition-all"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim() || sending}
                                className="btn btn-primary rounded-full w-12 h-12 flex items-center justify-center p-0 flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send className={`w-5 h-5 ${sending ? 'animate-pulse' : ''}`} />
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
