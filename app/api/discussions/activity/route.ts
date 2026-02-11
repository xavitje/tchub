import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get recent comments
        const recentComments = await prisma.comment.findMany({
            take: 3,
            orderBy: { createdAt: 'desc' },
            include: {
                author: {
                    select: { displayName: true }
                },
                post: {
                    select: { title: true, id: true }
                }
            }
        });

        // Get recent likes
        const recentLikes = await prisma.postLike.findMany({
            take: 2,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { displayName: true }
                },
                post: {
                    select: { title: true, id: true }
                }
            }
        });

        // Get recent posts
        const recentPosts = await prisma.post.findMany({
            take: 2,
            orderBy: { createdAt: 'desc' },
            where: {
                type: { in: ['POST', 'POLL'] }
            },
            include: {
                author: {
                    select: { displayName: true }
                }
            }
        });

        // Combine and format activities
        const activities = [
            ...recentComments.map((c: typeof recentComments[0]) => ({
                type: 'comment',
                text: `${c.author.displayName} heeft gereageerd op "${c.post.title}"`,
                link: `/discussions/${c.post.id}`,
                createdAt: c.createdAt
            })),
            ...recentLikes.map((l: typeof recentLikes[0]) => ({
                type: 'like',
                text: `${l.user.displayName} heeft "${l.post.title}" geliked`,
                link: `/discussions/${l.post.id}`,
                createdAt: l.createdAt
            })),
            ...recentPosts.map((p: typeof recentPosts[0]) => ({
                type: p.type === 'POLL' ? 'poll' : 'post',
                text: p.type === 'POLL'
                    ? `Nieuwe poll: "${p.title}"`
                    : `${p.author.displayName} heeft een bericht geplaatst`,
                link: `/discussions/${p.id}`,
                createdAt: p.createdAt
            }))
        ];

        // Sort by date and take top 5
        activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const topActivities = activities.slice(0, 5);

        return NextResponse.json(topActivities);
    } catch (error) {
        console.error('Error fetching recent activity:', error);
        return NextResponse.json({ error: 'Failed to fetch recent activity' }, { status: 500 });
    }
}
