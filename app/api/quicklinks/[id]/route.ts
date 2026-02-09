import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const quickLink = await prisma.quickLink.findUnique({
            where: { id: params.id }
        });

        if (!quickLink) {
            return NextResponse.json({ error: 'Quick link not found' }, { status: 404 });
        }

        if (quickLink.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.quickLink.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting quick link:', error);
        return NextResponse.json({ error: 'Failed to delete quick link' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, url, icon, order } = body;

        const quickLink = await prisma.quickLink.findUnique({
            where: { id: params.id }
        });

        if (!quickLink) {
            return NextResponse.json({ error: 'Quick link not found' }, { status: 404 });
        }

        if (quickLink.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const updated = await prisma.quickLink.update({
            where: { id: params.id },
            data: {
                title: title ?? quickLink.title,
                url: url ?? quickLink.url,
                icon: icon ?? quickLink.icon,
                order: order ?? quickLink.order
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error('Error updating quick link:', error);
        return NextResponse.json({ error: 'Failed to update quick link' }, { status: 500 });
    }
}
