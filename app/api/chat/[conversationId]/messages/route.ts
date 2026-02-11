import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/chat/[conversationId]/messages
export const dynamic = 'force-dynamic';
export async function GET(
    request: Request,
    { params }: { params: { conversationId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        console.log(`[API GET Messages] Fetching for ConversationId: ${params.conversationId}, User: ${session.user.id}`);

        const messages = await prisma.message.findMany({
            where: {
                conversationId: params.conversationId,
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                },
                reactions: true,
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: { displayName: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        console.log(`[API GET Messages] Found ${messages.length} total.`);
        if (messages.length === 0) {
            // Double check if conversation exists
            const convo = await prisma.conversation.findUnique({
                where: { id: params.conversationId },
                include: { users: { select: { id: true } } }
            });
            console.log(`[API GET Messages] Conversation exists?`, convo ? `Yes, members: ${convo.users.map((u: any) => u.id)}` : 'No');
        }

        return NextResponse.json(messages);
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

// POST /api/chat/[conversationId]/messages
export async function POST(
    request: Request,
    { params }: { params: { conversationId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { content, image, fileUrl, fileName, replyToId } = body;

        if (!content && !image && !fileUrl) {
            return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
        }

        const message = await prisma.message.create({
            data: {
                conversationId: params.conversationId,
                senderId: session.user.id,
                content,
                image,
                fileUrl,
                fileName,
                replyToId
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                },
                reactions: true,
                replyTo: {
                    select: {
                        id: true,
                        content: true,
                        sender: {
                            select: { displayName: true }
                        }
                    }
                }
            }
        });

        // Update conversation's lastMessageAt
        const updatedConversation = await prisma.conversation.update({
            where: { id: params.conversationId },
            data: { lastMessageAt: new Date() },
            include: { users: true }
        });

        // Create notifications for other participants
        const otherParticipants = updatedConversation.users.filter((u: any) => u.id !== session.user.id);

        if (otherParticipants.length > 0) {
            const notifications = otherParticipants.map((user: any) => ({
                userId: user.id,
                type: 'MENTION',
                title: `Nieuw bericht van ${session.user.name || 'iemand'}`,
                message: content ? (content.length > 50 ? content.substring(0, 47) + '...' : content) : 'Nieuwe bijlage',
                link: `/chat/${params.conversationId}`
            }));

            for (const data of notifications) {
                await prisma.notification.create({ data: data as any }).catch((err: any) => {
                    console.error('Error creating notification during chat message:', err);
                });
            }
        }

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
