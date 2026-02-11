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
            where: { id: params.id }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
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

        // Update ticket status if needed (e.g. from WAITING back to OPEN if user replies)
        // If admin replies, could set to WAITING_FOR_USER
        // For simple logic, we just bump updatedAt
        await prisma.supportTicket.update({
            where: { id: params.id },
            data: { updatedAt: new Date() }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error('Error creating message:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
