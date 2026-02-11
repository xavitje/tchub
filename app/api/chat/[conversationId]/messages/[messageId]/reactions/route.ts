import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/chat/[conversationId]/messages/[messageId]/reactions
export async function POST(
    request: Request,
    { params }: { params: { conversationId: string; messageId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { emoji } = await request.json();
        if (!emoji) {
            return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
        }

        const reaction = await prisma.reaction.create({
            data: {
                messageId: params.messageId,
                userId: session.user.id,
                emoji
            }
        });

        // Trigger update on message/conversation (optional, but good for polling)
        await prisma.message.update({
            where: { id: params.messageId },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(reaction);
    } catch (error) {
        // Handle unique constraint (user already reacted with this emoji)
        if ((error as any).code === 'P2002') {
            return NextResponse.json({ error: 'Already reacted' }, { status: 409 });
        }
        console.error('Error adding reaction:', error);
        return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
    }
}

// DELETE /api/chat/[conversationId]/messages/[messageId]/reactions
export async function DELETE(
    request: Request,
    { params }: { params: { conversationId: string; messageId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { emoji } = await request.json();
        if (!emoji) {
            return NextResponse.json({ error: 'Emoji is required' }, { status: 400 });
        }

        await prisma.reaction.deleteMany({
            where: {
                messageId: params.messageId,
                userId: session.user.id,
                emoji
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error removing reaction:', error);
        return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
    }
}
