import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const announcements = await prisma.post.findMany({
            where: { type: 'ANNOUNCEMENT' },
            include: { author: true },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(announcements);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { title, content, imageUrl, announcementType = 'REGULAR', sharePointUrl } = body;

        if (!title) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (announcementType === 'SHAREPOINT_LINK' && !sharePointUrl) {
            return NextResponse.json({ error: 'SharePoint URL is required for this announcement type' }, { status: 400 });
        }

        // Haal user ID op uit database op basis van email sessie
        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const post = await prisma.post.create({
            data: {
                title,
                content: content || '',
                imageUrl,
                type: 'ANNOUNCEMENT',
                announcementType: announcementType as 'REGULAR' | 'SHAREPOINT_LINK',
                sharePointUrl: announcementType === 'SHAREPOINT_LINK' ? sharePointUrl : null,
                authorId: user.id,
                isPinned: true,
                isPublished: true,
            },
            include: { author: true }
        });

        return NextResponse.json(post);
    } catch (error) {
        console.error('Create announcement error:', error);
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }
}
