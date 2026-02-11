import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const hubs = await prisma.hub.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(hubs);
    } catch (error) {
        console.error('Error fetching hubs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
