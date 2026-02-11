'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useNotification } from '@/components/ui/NotificationSystem';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface PollOption {
    id: string;
    text: string;
    voteCount: number;
}

interface PollProps {
    postId: string;
    poll: {
        id: string;
        options: PollOption[];
        endsAt: string | null;
        votes?: any[];
    };
}

export default function PollInteraction({ postId, poll: initialPoll }: PollProps) {
    const { data: session } = useSession();
    const { showNotification } = useNotification();
    const [poll, setPoll] = useState(initialPoll);
    const [voting, setVoting] = useState(false);

    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);
    const hasVoted = poll.votes?.some(v => v.userId === session?.user?.id) || false;
    const isEnded = poll.endsAt ? new Date(poll.endsAt) < new Date() : false;

    const handleVote = async (optionId: string) => {
        if (!session?.user?.id) {
            showNotification('error', 'Je moet ingelogd zijn om te stemmen');
            return;
        }

        if (hasVoted || isEnded) return;

        setVoting(true);
        try {
            const res = await fetch(`/api/posts/${postId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ optionId })
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to vote');
            }

            const updatedPoll = await res.json();
            // Manually add the current user's vote to the local state since the API might not return the full votes array
            setPoll({
                ...updatedPoll,
                votes: [...(poll.votes || []), { userId: session.user.id }]
            });
            showNotification('success', 'Stem uitgebracht!');
        } catch (error: any) {
            showNotification('error', error.message);
        } finally {
            setVoting(false);
        }
    };

    return (
        <div className="space-y-4 my-6">
            {poll.options.map((option) => {
                const percentage = totalVotes > 0
                    ? Math.round((option.voteCount / totalVotes) * 100)
                    : 0;

                return (
                    <button
                        key={option.id}
                        onClick={() => handleVote(option.id)}
                        disabled={voting || hasVoted || isEnded}
                        className={cn(
                            "w-full text-left relative overflow-hidden rounded-lg border transition-all duration-200",
                            hasVoted || isEnded
                                ? "cursor-default border-light-400"
                                : "cursor-pointer border-light-400 hover:border-primary",
                            voting && "opacity-50"
                        )}
                    >
                        {/* Progress Bar background */}
                        {(hasVoted || isEnded) && (
                            <div
                                className="absolute inset-0 bg-primary/10 transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                            />
                        )}

                        <div className="relative p-4 flex items-center justify-between gap-4">
                            <span className="font-medium text-dark">{option.text}</span>

                            <div className="flex items-center gap-2">
                                {(hasVoted || isEnded) && (
                                    <span className="text-sm font-bold text-primary">{percentage}%</span>
                                )}
                                {poll.votes?.find(v => v.userId === session?.user?.id && v.optionId === option.id) && (
                                    <Check className="w-4 h-4 text-primary" />
                                )}
                            </div>
                        </div>
                    </button>
                );
            })}

            <div className="flex items-center justify-between text-xs text-dark-100">
                <span>{totalVotes} {totalVotes === 1 ? 'stem' : 'stemmen'}</span>
                {poll.endsAt && (
                    <span>
                        {isEnded ? 'Gesloten op' : 'Eindigt op'} {new Date(poll.endsAt).toLocaleDateString('nl-NL')}
                    </span>
                )}
            </div>
        </div>
    );
}
