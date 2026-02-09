import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/chat/[conversationId]/messages/[messageId]/read
export async function POST(
    request: Request,
    { params }: { params: { conversationId: string; messageId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if message exists
        const message = await prisma.message.findUnique({
            where: { id: params.messageId }
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        // Don't mark own messages as read
        if (message.senderId === session.user.id) {
            return NextResponse.json({ success: true });
        }

        // Upsert read receipt
        await prisma.messageRead.upsert({
            where: {
                messageId_userId: {
                    messageId: params.messageId,
                    userId: session.user.id
                }
            },
            update: {
                readAt: new Date()
            },
            create: {
                messageId: params.messageId,
                userId: session.user.id,
                readAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error marking message as read:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
