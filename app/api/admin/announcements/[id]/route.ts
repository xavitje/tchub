import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { customRole: { include: { permissions: true } } }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const hasAdminPermission = user.customRole?.permissions.some((p: any) => p.name === 'ACCESS_ADMIN');
        if (!hasAdminPermission && user.role !== 'ADMIN' && user.role !== 'HQ_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { title, content, imageUrl, announcementType, sharePointUrl } = body;

        const announcement = await prisma.post.findUnique({
            where: { id: params.id }
        });

        if (!announcement) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        if (announcement.type !== 'ANNOUNCEMENT') {
            return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
        }

        const updatedPost = await prisma.post.update({
            where: { id: params.id },
            data: {
                title: title ?? announcement.title,
                content: content ?? announcement.content,
                imageUrl: imageUrl ?? announcement.imageUrl,
                announcementType: announcementType ?? announcement.announcementType,
                sharePointUrl: announcementType === 'SHAREPOINT_LINK' ? sharePointUrl : null,
            },
            include: { author: true }
        });

        return NextResponse.json(updatedPost);
    } catch (error) {
        console.error('Update announcement error:', error);
        return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        // Verify user is admin
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { customRole: { include: { permissions: true } } }
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const hasAdminPermission = user.customRole?.permissions.some((p: any) => p.name === 'ACCESS_ADMIN');
        if (!hasAdminPermission && user.role !== 'ADMIN' && user.role !== 'HQ_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const announcement = await prisma.post.findUnique({
            where: { id: params.id }
        });

        if (!announcement) {
            return NextResponse.json({ error: 'Announcement not found' }, { status: 404 });
        }

        if (announcement.type !== 'ANNOUNCEMENT') {
            return NextResponse.json({ error: 'Invalid post type' }, { status: 400 });
        }

        await prisma.post.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete announcement error:', error);
        return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 });
    }
}
