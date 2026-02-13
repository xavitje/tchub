import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
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

        const { title, content, videoUrl, quiz, duration } = await request.json();

        if (!title) {
            return NextResponse.json({ error: 'Title is required' }, { status: 400 });
        }

        // Validate quiz if provided
        if (quiz) {
            try {
                const parsed = JSON.parse(quiz);
                if (!parsed.question || !parsed.options || !Array.isArray(parsed.options) || typeof parsed.correct !== 'number') {
                    return NextResponse.json({ error: 'Invalid quiz format' }, { status: 400 });
                }
            } catch (e) {
                return NextResponse.json({ error: 'Invalid quiz JSON' }, { status: 400 });
            }
        }

        const lesson = await prisma.trainingLesson.update({
            where: { id: params.id },
            data: {
                title,
                content: content || null,
                videoUrl: videoUrl || null,
                quiz: quiz || null,
                duration: duration || null
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error updating lesson:', error);
        return NextResponse.json({ error: 'Failed to update lesson' }, { status: 500 });
    }
}
