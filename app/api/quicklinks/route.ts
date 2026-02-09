import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const quickLinks = await prisma.quickLink.findMany({
            where: { userId: session.user.id },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(quickLinks);
    } catch (error) {
        console.error('Error fetching quick links:', error);
        return NextResponse.json({ error: 'Failed to fetch quick links' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, url, icon } = body;

        if (!title || !url) {
            return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
        }

        // Get max order
        const maxOrderLink = await prisma.quickLink.findFirst({
            where: { userId: session.user.id },
            orderBy: { order: 'desc' },
            select: { order: true }
        });

        const quickLink = await prisma.quickLink.create({
            data: {
                userId: session.user.id,
                title,
                url,
                icon: icon || '🔗',
                order: (maxOrderLink?.order ?? -1) + 1
            }
        });

        return NextResponse.json(quickLink);
    } catch (error) {
        console.error('Error creating quick link:', error);
        return NextResponse.json({ error: 'Failed to create quick link' }, { status: 500 });
    }
}
