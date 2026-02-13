import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch ticket without messages first to avoid boolean conversion issues
        const ticket = await prisma.supportTicket.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Fetch messages separately using raw query to handle boolean conversion
        const messages: any[] = await prisma.$queryRaw`
            SELECT 
                m.id,
                m.ticketId,
                m.senderId,
                m.content,
                m.attachmentUrl,
                CASE WHEN m.isInternal = 1 THEN 1 ELSE 0 END as isInternal,
                m.createdAt,
                u.id as sender_id,
                u.displayName as sender_displayName,
                u.profileImage as sender_profileImage,
                u.role as sender_role
            FROM TicketMessage m
            LEFT JOIN User u ON m.senderId = u.id
            WHERE m.ticketId = ${params.id}
            ORDER BY m.createdAt ASC
        `;

        // Transform the messages to match the expected format
        const formattedMessages = messages.map((msg: any) => ({
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
        }));

        // Add messages to ticket
        const ticketWithMessages = {
            ...ticket,
            messages: formattedMessages
        };

        // Fetch user with role to check permissions
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { customRole: true }
        });

        // Only allow owner or admin/support to view
        const canAccess = ticketWithMessages.userId === session.user.id ||
            currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'HQ_ADMIN' ||
            currentUser?.customRole?.name === 'Admin';

        if (!canAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(ticketWithMessages);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
