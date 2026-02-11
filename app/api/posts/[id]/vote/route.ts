import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { optionId } = await request.json();
        if (!optionId) {
            return NextResponse.json({ error: 'Option ID is required' }, { status: 400 });
        }

        // 1. Get the poll associated with this post
        const poll = await prisma.poll.findUnique({
            where: { postId: params.id },
            include: { options: true }
        });

        if (!poll) {
            return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
        }

        // 2. Check if user already voted
        const existingVote = await prisma.pollVote.findFirst({
            where: {
                pollId: poll.id,
                userId: session.user.id
            }
        });

        if (existingVote) {
            return NextResponse.json({ error: 'Already voted' }, { status: 400 });
        }

        // 3. Create the vote and increment count in one transaction
        await prisma.$transaction([
            prisma.pollVote.create({
                data: {
                    pollId: poll.id,
                    optionId: optionId,
                    userId: session.user.id
                }
            }),
            prisma.pollOption.update({
                where: { id: optionId },
                data: { voteCount: { increment: 1 } }
            })
        ]);

        // Fetch updated poll state
        const updatedPoll = await prisma.poll.findUnique({
            where: { id: poll.id },
            include: { options: { orderBy: { order: 'asc' } } }
        });

        return NextResponse.json(updatedPoll);
    } catch (error) {
        console.error('Error voting:', error);
        return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 });
    }
}
