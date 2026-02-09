import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { differenceInMinutes } from 'date-fns';

// PATCH /api/chat/[conversationId]/messages/[messageId] - Edit message
export async function PATCH(
    request: Request,
    { params }: { params: { conversationId: string; messageId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();
        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const message = await prisma.message.findUnique({
            where: { id: params.messageId }
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.senderId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (message.deletedAt) {
            return NextResponse.json({ error: 'Message is deleted' }, { status: 400 });
        }

        // Check 24-hour limit (1440 minutes)
        const minutesSinceCreation = differenceInMinutes(new Date(), new Date(message.createdAt));
        if (minutesSinceCreation > 1440) {
            return NextResponse.json({ error: 'Edit time limit exceeded (24 hours)' }, { status: 400 });
        }

        console.log(`[API PATCH] Updating message ${params.messageId}. Content length: ${content.length}`);

        const updatedMessage = await prisma.message.update({
            where: { id: params.messageId },
            data: {
                content,
                isEdited: true,
                editedAt: new Date()
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                },
                reactions: true
            }
        });

        console.log(`[API PATCH] Successfully updated message ${params.messageId}`);
        return NextResponse.json(updatedMessage);
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ error: 'Failed to update message' }, { status: 500 });
    }
}

// DELETE /api/chat/[conversationId]/messages/[messageId] - Soft delete message
export async function DELETE(
    request: Request,
    { params }: { params: { conversationId: string; messageId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const message = await prisma.message.findUnique({
            where: { id: params.messageId }
        });

        if (!message) {
            return NextResponse.json({ error: 'Message not found' }, { status: 404 });
        }

        if (message.senderId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const deletedMessage = await prisma.message.update({
            where: { id: params.messageId },
            data: {
                deletedAt: new Date(),
                content: null,
                image: null,
                fileUrl: null
            }
        });

        return NextResponse.json(deletedMessage);
    } catch (error) {
        console.error('Error deleting message:', error);
        return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
    }
}
