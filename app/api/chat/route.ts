import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversations = await prisma.conversation.findMany({
            where: {
                users: {
                    some: {
                        id: session.user.id
                    }
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true,
                        email: true
                    }
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        content: true,
                        createdAt: true,
                        sender: { select: { displayName: true } }
                    }
                },
                settings: {
                    where: { userId: session.user.id },
                    select: { isMuted: true }
                }
            },
            orderBy: {
                lastMessageAt: 'desc'
            }
        });

        return NextResponse.json(conversations);
    } catch (error) {
        console.error('Error fetching conversations:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userIds, isGroup, name } = await request.json();

        // If one-on-one, check existing
        if (!isGroup && userIds.length === 1) {
            const existing = await prisma.conversation.findFirst({
                where: {
                    isGroup: false,
                    AND: [
                        { users: { some: { id: session.user.id } } },
                        { users: { some: { id: userIds[0] } } }
                    ]
                }
            });

            if (existing) {
                return NextResponse.json(existing);
            }
        }

        const allUserIds = Array.from(new Set([...userIds, session.user.id]));

        const conversation = await prisma.conversation.create({
            data: {
                isGroup,
                name: isGroup ? name : undefined,
                lastMessageAt: new Date(),
                users: {
                    connect: allUserIds.map((id: string) => ({ id }))
                }
            }
        });

        return NextResponse.json(conversation);
    } catch (error) {
        console.error('Error creating conversation:', error);
        return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
    }
}
