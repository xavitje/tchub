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

        // Create message using raw query to avoid boolean conversion issues
        const messageId = crypto.randomUUID();
        const now = new Date();

        await prisma.$executeRaw`
            INSERT INTO TicketMessage (id, ticketId, senderId, content, isInternal, createdAt)
            VALUES (${messageId}, ${params.id}, ${session.user.id}, ${content}, 0, ${now})
        `;

        // Fetch the created message with sender info
        const messages: any[] = await prisma.$queryRaw`
            SELECT 
                m.id,
                m.ticketId,
                m.senderId,
                m.content,
                m.attachmentUrl,
                m.isInternal,
                m.createdAt,
                u.id as sender_id,
                u.displayName as sender_displayName,
                u.profileImage as sender_profileImage,
                u.role as sender_role
            FROM TicketMessage m
            LEFT JOIN User u ON m.senderId = u.id
            WHERE m.id = ${messageId}
        `;

        const msg = messages[0];
        const formattedMessage = {
            id: msg.id,
            ticketId: msg.ticketId,
            senderId: msg.senderId,
            content: msg.content,
            attachmentUrl: msg.attachmentUrl,
            isInternal: Boolean(msg.isInternal),
            createdAt: msg.createdAt,
            sender: {
                id: msg.sender_id,
                displayName: msg.sender_displayName,
                profileImage: msg.sender_profileImage,
                role: msg.sender_role
            }
        };

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

        return NextResponse.json(formattedMessage);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
