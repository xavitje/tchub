import { NextResponse } from 'next/server';
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
