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

        const event = await prisma.event.findUnique({
            where: { postId: params.id }
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        const registration = await prisma.eventRegistration.upsert({
            where: {
                eventId_userId: {
                    eventId: event.id,
                    userId: session.user.id
                }
            },
            update: { status: 'REGISTERED' },
            create: {
                eventId: event.id,
                userId: session.user.id,
                status: 'REGISTERED'
            }
        });

        return NextResponse.json(registration);
    } catch (error) {
        console.error('Error registering for event:', error);
        return NextResponse.json({ error: 'Failed to register' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const event = await prisma.event.findUnique({
            where: { postId: params.id }
        });

        if (!event) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 });
        }

        await prisma.eventRegistration.delete({
            where: {
                eventId_userId: {
                    eventId: event.id,
                    userId: session.user.id
                }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error cancelling registration:', error);
        return NextResponse.json({ error: 'Failed to cancel registration' }, { status: 500 });
    }
}
