import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get all tags with their post counts
        const tags = await prisma.tag.findMany({
            include: {
                _count: {
                    select: { posts: true }
                }
            },
            orderBy: {
                posts: {
                    _count: 'desc'
                }
            },
            take: 5 // Top 5 trending tags
        });

        return NextResponse.json(tags);
    } catch (error) {
        console.error('Error fetching trending topics:', error);
        return NextResponse.json({ error: 'Failed to fetch trending topics' }, { status: 500 });
    }
}
