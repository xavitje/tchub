import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const [discussionCount, eventCount, pollCount, userCount] = await Promise.all([
            prisma.post.count({
                where: {
                    type: 'POST', // Changed from 'DISCUSSION' to 'POST' to match PostType enum
                }
            }),
            prisma.event.count({
                where: {
                    startDate: { gte: new Date() } // Changed from 'date' to 'startDate'
                }
            }),
            prisma.poll.count({
                where: {
                    endsAt: { gte: new Date() }
                }
            }),
            prisma.user.count()
        ]);

        return NextResponse.json({
            discussions: discussionCount,
            events: eventCount,
            polls: pollCount,
            users: userCount
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }
}