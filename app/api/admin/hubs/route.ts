import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Check for MANAGE_HUBS permission or ADMIN/HQ_ADMIN role
        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: { customRole: { include: { permissions: true } } }
        });

        const hasPermission = user?.customRole?.permissions.some(p => p.name === 'MANAGE_HUBS') ||
            user?.role === 'ADMIN' ||
            user?.role === 'HQ_ADMIN';

        if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const hubs = await prisma.hub.findMany({
            orderBy: { order: 'asc' }
        });
        return NextResponse.json(hubs);
    } catch (error) {
        console.error('Error fetching hubs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({
            where: { email: session.user.email! },
            include: { customRole: { include: { permissions: true } } }
        });

        const hasPermission = user?.customRole?.permissions.some(p => p.name === 'MANAGE_HUBS') ||
            user?.role === 'ADMIN' ||
            user?.role === 'HQ_ADMIN';

        if (!hasPermission) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await req.json();
        const { name, slug, description, icon, sharePointUrl, order, isActive } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and slug are required' }, { status: 400 });
        }

        const hub = await prisma.hub.create({
            data: {
                name,
                slug,
                description,
                icon,
                sharePointUrl,
                order: parseInt(order) || 0,
                isActive: isActive ?? true
            }
        });

        return NextResponse.json(hub);
    } catch (error) {
        console.error('Error creating hub:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
