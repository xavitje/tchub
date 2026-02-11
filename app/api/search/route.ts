import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FAQs, TRAININGS, PLATFORM_STATUS, SUPPORT_TICKETS, SearchResult } from '@/lib/search-content';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const q = searchParams.get('q')?.trim().toLowerCase();

        if (!q || q.length < 2) {
            return NextResponse.json([]);
        }

        const results: SearchResult[] = [];

        // 1. Search DB: Users
        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { displayName: { contains: q } },
                    { email: { contains: q } }
                ],
                isActive: true
            },
            take: 5
        });
        users.forEach((u: { id: string, displayName: string, email: string, profileImage: string | null, jobTitle: string | null }) => results.push({
            id: u.id,
            type: 'USER',
            title: u.displayName,
            description: u.jobTitle || u.email,
            url: `/profile/${u.id}`,
            icon: '👤',
            metadata: { image: u.profileImage }
        }));

        // 2. Search DB: Posts
        const posts = await prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: q } },
                    { content: { contains: q } }
                ]
            },
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
        posts.forEach((p: { id: string, title: string, content: string }) => results.push({
            id: p.id,
            type: 'POST',
            title: p.title,
            description: p.content.substring(0, 100) + '...',
            url: `/discussions/${p.id}`,
            icon: '📝'
        }));

        // 3. Search DB: Hubs
        const hubs = await prisma.hub.findMany({
            where: {
                OR: [
                    { name: { contains: q } },
                    { description: { contains: q } }
                ],
                isActive: true
            },
            take: 5
        });
        hubs.forEach((h: { id: string, name: string, description: string | null, icon: string | null, slug: string, sharePointUrl: string | null }) => results.push({
            id: h.id,
            type: 'HUB',
            title: h.name,
            description: h.description || undefined,
            url: h.sharePointUrl || `/hubs/${h.slug}`,
            icon: h.icon || '🏢'
        }));

        // 4. Search Static: FAQs
        FAQs.filter(f => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q))
            .slice(0, 3)
            .forEach(f => results.push({
                id: f.id,
                type: 'FAQ',
                title: f.question,
                description: f.answer.substring(0, 100) + '...',
                url: f.url,
                icon: '❓'
            }));

        // 5. Search Static: Training
        TRAININGS.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
            .slice(0, 3)
            .forEach(t => results.push({
                id: t.id,
                type: 'TRAINING',
                title: t.title,
                description: t.description,
                url: t.url,
                icon: '🎓'
            }));

        // 6. Search Static: Support Tickets
        SUPPORT_TICKETS.filter(t => t.title.toLowerCase().includes(q) || t.description.toLowerCase().includes(q))
            .slice(0, 2)
            .forEach(t => results.push({
                id: t.id,
                type: 'TICKET',
                title: t.title,
                description: t.description,
                url: t.url,
                icon: '🎫'
            }));

        // 7. Search Static: Status
        PLATFORM_STATUS.filter(s => s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q))
            .forEach(s => results.push({
                id: s.id,
                type: 'STATUS',
                title: s.title,
                description: s.description,
                url: s.url,
                icon: '🟢'
            }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Global search error:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
