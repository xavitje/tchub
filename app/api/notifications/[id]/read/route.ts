import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/notifications/[id]/read
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notification = await prisma.notification.update({
            where: {
                id: params.id,
                userId: session.user.id // Ensure user owns the notification
            },
            data: {
                isRead: true
            }
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error('Error marking notification as read:', error);
        return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }
}
