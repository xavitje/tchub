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

        // Calculate Next Lesson ID
        let nextLessonId = null;

        // 1. Check for next lesson in SAME module
        const nextInModule = lesson.module.lessons.find((l: any) => l.order > lesson.order);
        if (nextInModule) {
            nextLessonId = nextInModule.id;
        } else {
            // 2. Check for start of NEXT module
            const nextModule = await prisma.trainingModule.findFirst({
                where: {
                    courseId: lesson.module.courseId,
                    order: { gt: lesson.module.order }
                },
                orderBy: { order: 'asc' },
                include: {
                    lessons: {
                        orderBy: { order: 'asc' },
                        take: 1
                    }
                }
            });

            if (nextModule && nextModule.lessons.length > 0) {
                nextLessonId = nextModule.lessons[0].id;
            }
        }

        return NextResponse.json({ ...lesson, nextLessonId });
    } catch (error) {
        console.error('Error fetching lesson:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
