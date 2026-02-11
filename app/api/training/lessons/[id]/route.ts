import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const lesson = await prisma.trainingLesson.findUnique({
            where: { id: params.id },
            include: {
                module: {
                    include: {
                        lessons: {
                            orderBy: { order: 'asc' },
                            select: { id: true, title: true, order: true }
                        }
                    }
                }
            }
        });

        if (!lesson) {
            return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });
        }

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
