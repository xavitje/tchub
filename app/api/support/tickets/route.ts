import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    console.log('--- POST /api/support/tickets START ---');
    try {
        const session = await getServerSession(authOptions);
        console.log('Session user ID:', session?.user?.id);

        if (!session?.user?.id) {
            console.error('Unauthorized: No user ID in session');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Request body:', body);
        const { subject, category, priority, content } = body;

        if (!subject || !content) {
            return NextResponse.json({ error: 'Subject and content are required' }, { status: 400 });
        }

        // Verify user exists in DB to prevent foreign key error
        const userExists = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { id: true }
        });

        if (!userExists) {
            console.error(`User ${session.user.id} not found in database.`);
            return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
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
        console.error('Error creating ticket FULL ERROR:', error);
        // Check for specific Prisma errors
        if (error.code === 'P2003') {
            return NextResponse.json({ error: 'Foreign key constraint failed. User might not exist.' }, { status: 500 });
        }
        return NextResponse.json({
            error: 'Failed to create ticket',
            details: error.message,
            code: error.code
        }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if user is Admin
        // Adjust this check based on your actual Role implementation
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { customRole: true }
        });

        const isAdmin = user?.role === 'ADMIN' || user?.role === 'HQ_ADMIN' || user?.customRole?.name === 'Admin';

        const whereClause = isAdmin ? {} : { userId: session.user.id };

        const tickets = await prisma.supportTicket.findMany({
            where: whereClause,
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                },
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
