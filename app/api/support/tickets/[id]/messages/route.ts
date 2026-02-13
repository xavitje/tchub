import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { content } = await request.json();

        if (!content) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.findUnique({
            where: { id: params.id },
            include: { user: true }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Check permissions
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { customRole: true }
        });

        const isAdmin = currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'HQ_ADMIN' ||
            currentUser?.customRole?.name === 'Admin';

        if (ticket.userId !== session.user.id && !isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Create message
        const message = await prisma.ticketMessage.create({
            data: {
                ticketId: params.id,
                senderId: session.user.id,
                content: content
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true,
                        role: true
                    }
                }
            }
        });

        // Auto-update status based on who replied
        let newStatus = ticket.status;
        if (isAdmin && ticket.userId !== session.user.id) {
            newStatus = 'WAITING_FOR_USER';
        } else if (ticket.userId === session.user.id) {
            newStatus = 'OPEN';
        }

        // If status changed, update it. Always update updatedAt.
        await prisma.supportTicket.update({
            where: { id: ticket.id },
            data: {
                status: newStatus,
                updatedAt: new Date()
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
