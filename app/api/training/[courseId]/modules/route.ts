import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        // Admin check
        const currentUser = await prisma.user.findUnique({
            where: { id: session?.user?.id },
            include: { customRole: true }
        });

        const isAdmin = currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'HQ_ADMIN' ||
            currentUser?.customRole?.name === 'Admin';

        if (!session?.user?.id || !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description } = body;

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Get highest order
        const lastModule = await prisma.trainingModule.findFirst({
            where: { courseId: params.courseId },
            orderBy: { order: 'desc' }
        });

        const newOrder = (lastModule?.order ?? -1) + 1;

        const module = await prisma.trainingModule.create({
            data: {
                courseId: params.courseId,
                title,
                description,
                order: newOrder
            }
        });

        return NextResponse.json(module);
    } catch (error) {
        console.error('Error creating module:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
