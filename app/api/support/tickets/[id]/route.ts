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

        const ticket = await prisma.supportTicket.findUnique({
            where: { id: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        displayName: true,
                        profileImage: true
                    }
                },
                messages: {
                    include: {
                        sender: {
                            select: {
                                id: true,
                                displayName: true,
                                profileImage: true,
                                role: true
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'asc'
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Fetch user with role to check permissions
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: { customRole: true }
        });

        // Only allow owner or admin/support to view
        const canAccess = ticket.userId === session.user.id ||
            currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'HQ_ADMIN' ||
            currentUser?.customRole?.name === 'Admin';

        if (!canAccess) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Error fetching ticket:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
