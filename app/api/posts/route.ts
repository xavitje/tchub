import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');
        const limit = searchParams.get('limit');
        const isPinned = searchParams.get('isPinned');

        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const posts = await prisma.post.findMany({
            where: {
                type: type ? (type as any) : undefined,
                isPinned: isPinned === 'true' ? true : undefined,
            },
            take: limit ? parseInt(limit) : undefined,
            include: {
                author: true,
                poll: {
                    include: {
                        options: true,
                    },
                },
                event: true,
                likes: userId ? {
                    where: { userId: userId }
                } : false,
            },
            orderBy: [
                { isPinned: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        const postsWithLikeStatus = posts.map(post => ({
            ...post,
            likedByMe: userId ? post.likes.length > 0 : false,
            likes: undefined,
        }));

        return NextResponse.json(postsWithLikeStatus);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, title, content, imageUrl, authorId, pollOptions, pollEndsAt, allowMultiple, eventStartDate, eventEndDate, location, isVirtual, meetingLink, maxAttendees } = body;

        if (!type || !title || !authorId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const post = await prisma.post.create({
            data: {
                type,
                title,
                content: content || '',
                imageUrl,
                authorId,
                poll: type === 'POLL' ? {
                    create: {
                        endsAt: pollEndsAt ? new Date(pollEndsAt) : null,
                        allowMultiple: allowMultiple || false,
                        options: {
                            create: pollOptions.map((text: string, index: number) => ({
                                text,
                                order: index,
                            })),
                        },
                    },
                } : undefined,
                event: type === 'EVENT' ? {
                    create: {
                        startDate: new Date(eventStartDate),
                        endDate: eventEndDate ? new Date(eventEndDate) : null,
                        location,
                        isVirtual: isVirtual || false,
                        meetingLink,
                        maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
                    },
                } : undefined,
            },
            include: {
                author: true,
                poll: {
                    include: {
                        options: true,
                    },
                },
                event: true,
            },
        });
        const users = await prisma.user.findMany({
            where: {
                id: { not: authorId },
                isActive: true
            },
            select: { id: true }
        });

        if (users.length > 0) {
            await prisma.notification.createMany({
                data: users.map(user => ({
                    userId: user.id,
                    type: type === 'POLL' ? 'NEW_POLL' : (type === 'EVENT' ? 'NEW_EVENT' : 'NEW_POST'),
                    title: `Nieuwe ${type === 'POLL' ? 'peiling' : (type === 'EVENT' ? 'evenement' : 'post')}`,
                    message: title,
                    link: `/discussions/${post.id}`
                }))
            });
        }

        return NextResponse.json(post);
    } catch (error) {
        console.error('Error creating post:', error);
        return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
    }
}
