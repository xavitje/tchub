import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/chat/[conversationId]/settings - Update settings
export async function PATCH(
    request: Request,
    { params }: { params: { conversationId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { isMuted } = await request.json();

        // Ensure conversation exists
        const conversation = await prisma.conversation.findUnique({
            where: { id: params.conversationId }
        });

        if (!conversation) {
            return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
        }

        // Update or create settings
        const settings = await prisma.conversationSettings.upsert({
            where: {
                conversationId_userId: {
                    conversationId: params.conversationId,
                    userId: session.user.id
                }
            },
            update: {
                isMuted
            },
            create: {
                conversationId: params.conversationId,
                userId: session.user.id,
                isMuted
            }
        });

        return NextResponse.json(settings);
    } catch (error) {
        console.error('Error updating chat settings:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}
