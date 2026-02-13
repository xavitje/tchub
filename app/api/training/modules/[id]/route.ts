import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const module = await prisma.trainingModule.findUnique({
            where: { id: params.id },
            include: {
                course: {
                    select: {
                        id: true,
                        title: true
                    }
                },
                lessons: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
        }

        return NextResponse.json(module);
    } catch (error) {
        console.error('Error fetching module:', error);
        return NextResponse.json({ error: 'Failed to fetch module' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

        if (!canAccessAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { title } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        const module = await prisma.trainingModule.update({
            where: { id: params.id },
            data: { title }
        });

        return NextResponse.json(module);
    } catch (error) {
        console.error('Error updating module:', error);
        return NextResponse.json({ error: 'Failed to update module' }, { status: 500 });
    }
}
