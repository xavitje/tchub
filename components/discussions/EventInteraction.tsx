'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/ui/NotificationSystem';
import { Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventProps {
    postId: string;
    event: {
        id: string;
        startDate: string;
        endDate: string | null;
        location: string | null;
        isVirtual: boolean;
        maxAttendees: number | null;
        registrations?: any[];
    };
}

export default function EventInteraction({ postId, event }: EventProps) {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [registrations, setRegistrations] = useState(event.registrations || []);
    const [processing, setProcessing] = useState(false);

    const isRegistered = registrations.some(r => r.userId === session?.user?.id && r.status === 'REGISTERED');
    const attendeeCount = registrations.filter(r => r.status === 'REGISTERED').length;
    const isFull = event.maxAttendees ? attendeeCount >= event.maxAttendees : false;

    const handleToggleRegistration = async () => {
        if (!session?.user?.id) {
            showNotification('error', 'Je moet ingelogd zijn om je aan te melden');
            return;
        }

        setProcessing(true);
        try {
            const method = isRegistered ? 'DELETE' : 'POST';
            const res = await fetch(`/api/posts/${postId}/register`, { method });

            if (!res.ok) throw new Error('Action failed');

            if (isRegistered) {
                setRegistrations(registrations.filter(r => r.userId !== session.user.id));
                showNotification('success', 'Aanmelding verwijderd');
            } else {
                const data = await res.json();
                setRegistrations([...registrations, data]);
                showNotification('success', 'Je bent aangemeld voor dit evenement!');
            }
        } catch (error) {
            showNotification('error', 'Kon actie niet uitvoeren');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="card p-6 bg-light-50 border-light-400 my-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-dark">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm font-bold">Datum & Tijd</p>
                            <p className="text-sm">
                                {new Date(event.startDate).toLocaleDateString('nl-NL', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-dark">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm font-bold">Locatie</p>
                            <p className="text-sm">{event.isVirtual ? 'Virtueel Event' : (event.location || 'Nog te bepalen')}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-dark">
                        <Users className="w-5 h-5 text-primary" />
                        <div>
                            <p className="text-sm font-bold">Aanmeldingen</p>
                            <p className="text-sm">
                                {attendeeCount} {event.maxAttendees ? `/ ${event.maxAttendees}` : ''} personen
                            </p>
                        </div>
                    </div>

                    {isRegistered && (
                        <div className="flex items-center gap-3 text-success">
                            <CheckCircle2 className="w-5 h-5" />
                            <p className="text-sm font-bold">Je bent aangemeld</p>
                        </div>
                    )}
                </div>
            </div>

            <button
                onClick={handleToggleRegistration}
                disabled={processing || (!isRegistered && isFull)}
                className={cn(
                    "w-full btn py-3 transition-all",
                    isRegistered
                        ? "btn-outline border-error text-error hover:bg-error/10"
                        : "btn-primary",
                    processing && "opacity-50"
                )}
            >
                {processing ? 'Bezig...' : (isRegistered ? 'Aanmelding annuleren' : (isFull ? 'Volgeboekt' : 'Meld je aan'))}
            </button>
        </div>
    );
}
