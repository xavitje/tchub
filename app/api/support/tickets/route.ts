import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { subject, category, priority, content } = body;

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
        }

        // Create the ticket
        console.log('Creating ticket for user:', session.user.id);
        const ticket = await prisma.supportTicket.create({
            data: {
                userId: session.user.id,
                subject,
                category: category || 'OTHER',
                priority: priority || 'NORMAL',
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: session.user.id,
                        content: content
                    }
                }
            }
        });

        console.log('Ticket created:', ticket.id);
        return NextResponse.json(ticket);
    } catch (error: any) {
        console.error('Error creating ticket:', error);
        return NextResponse.json({
            error: 'Failed to create ticket',
            details: error.message,
            stack: error.stack
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tickets = await prisma.supportTicket.findMany({
            where: {
                userId: session.user.id
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                _count: {
                    select: { messages: true }
                }
            }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}
