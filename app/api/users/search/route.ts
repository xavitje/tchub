import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query || query.length < 2) {
            return NextResponse.json([]);
        }

        const users = await prisma.user.findMany({
            where: {
                OR: [
                    { displayName: { contains: query, mode: 'insensitive' } },
                    { email: { contains: query, mode: 'insensitive' } }
                ],
                NOT: {
                    id: session.user.id // Exclude self
                }
            },
            select: {
                id: true,
                displayName: true,
                email: true,
                profileImage: true,
                jobTitle: true
            },
            take: 10
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error searching users:', error);
        return NextResponse.json({ error: 'Search failed' }, { status: 500 });
    }
}
