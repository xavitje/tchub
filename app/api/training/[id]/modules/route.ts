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
        const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

        if (!canAccessAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, order } = body;

        const module = await prisma.trainingModule.create({
            data: {
                courseId: params.id,
                title,
                description,
                order: order || 0
            }
        });

        return NextResponse.json(module);
    } catch (error) {
        console.error('Error creating module:', error);
        return NextResponse.json({ error: 'Failed to create module' }, { status: 500 });
    }
}
