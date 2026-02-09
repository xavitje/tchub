import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
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

        const hub = await prisma.hub.update({
            where: { id: params.id },
            data: {
                name,
                slug,
                description,
                icon,
                sharePointUrl,
                order: order !== undefined ? parseInt(order) : undefined,
                isActive
            }
        });

        return NextResponse.json(hub);
    } catch (error) {
        console.error('Error updating hub:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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

        await prisma.hub.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'Hub deleted' });
    } catch (error) {
        console.error('Error deleting hub:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
