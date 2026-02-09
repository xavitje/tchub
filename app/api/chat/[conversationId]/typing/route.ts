import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/chat/[conversationId]/typing
export async function POST(
    request: Request,
    { params }: { params: { conversationId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.typingIndicator.upsert({
            where: {
                conversationId_userId: {
                    conversationId: params.conversationId,
                    userId: session.user.id
                }
            },
            update: {
                lastTypingAt: new Date()
            },
            create: {
                conversationId: params.conversationId,
                userId: session.user.id,
                lastTypingAt: new Date()
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating typing status:', error);
        return NextResponse.json({ error: 'Failed to update typing status' }, { status: 500 });
    }
}

// GET /api/chat/[conversationId]/typing
export async function GET(
    request: Request,
    { params }: { params: { conversationId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get users typing in last 5 seconds
        const fiveSecondsAgo = new Date(Date.now() - 5000);

        const typingUsers = await prisma.typingIndicator.findMany({
            where: {
                conversationId: params.conversationId,
                lastTypingAt: {
                    gte: fiveSecondsAgo
                },
                userId: {
                    not: session.user.id // Exclude self
                }
            }
        });

        // Manual fetch to bypass potential Prisma client sync issues
        const userIds = typingUsers.map(t => t.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: {
                id: true,
                displayName: true,
                profileImage: true
            }
        });

        const typingUsersWithDetails = typingUsers.map(t => {
            const user = users.find(u => u.id === t.userId);
            return {
                ...t,
                user
            };
        });

        return NextResponse.json(typingUsersWithDetails);
    } catch (error) {
        console.error('Error fetching typing status:', error);
        return NextResponse.json({ error: 'Failed to fetch typing status' }, { status: 500 });
    }
}
