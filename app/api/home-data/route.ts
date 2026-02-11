import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userId = session?.user?.id;

        const [announcements, posts, stats, hubs, quickLinks] = await Promise.all([
            // 1. Announcements
            prisma.post.findMany({
                where: { type: 'ANNOUNCEMENT' },
                take: 5,
                include: { author: true },
                orderBy: { createdAt: 'desc' }
            }),
            // 2. Recent Posts (for the main feed)
            prisma.post.findMany({
                take: 10,
                include: {
                    author: true,
                    poll: { include: { options: true, votes: true } },
                    event: true,
                    likes: userId ? { where: { userId } } : false,
                },
                orderBy: [
                    { isPinned: 'desc' },
                    { createdAt: 'desc' }
                ]
            }),
            // 3. Stats
            Promise.all([
                prisma.post.count({ where: { type: 'POST' } }),
                prisma.event.count({ where: { startDate: { gte: new Date() } } }),
                prisma.poll.count({
                    where: {
                        OR: [
                            { endsAt: null },
                            { endsAt: { gte: new Date() } }
                        ]
                    }
                }),
                prisma.user.count()
            ]),
            // 4. Hubs
            prisma.hub.findMany({
                where: { isActive: true },
                orderBy: { order: 'asc' }
            }),
            // 5. Quick Links
            userId ? (prisma as any).quickLink.findMany({
                where: { userId },
                orderBy: { order: 'asc' }
            }) : Promise.resolve([])
        ]);

        const [discussionCount, eventCount, pollCount, userCount] = stats;

        // Process likes for posts
        const postsWithLikeStatus = posts.map((post: any) => ({
            ...post,
            likedByMe: userId ? post.likes?.length > 0 : false,
            likes: undefined
        }));

        return NextResponse.json({
            announcements,
            posts: postsWithLikeStatus,
            stats: {
                discussions: discussionCount,
                events: eventCount,
                polls: pollCount,
                users: userCount
            },
            hubs,
            quickLinks
        });
    } catch (error) {
        console.error('Error fetching home data:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
