import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get all courses with their lesson IDs
        const courses = await prisma.trainingCourse.findMany({
            where: { isActive: true },
            select: {
                id: true,
                modules: {
                    select: {
                        lessons: {
                            select: { id: true }
                        }
                    }
                }
            }
        });

        // 2. Get user's completed lessons
        const userProgress = await prisma.userTrainingProgress.findMany({
            where: {
                userId: session.user.id,
                status: 'COMPLETED'
            },
            select: { lessonId: true }
        });

        const completedLessonIds = new Set(userProgress.map((p: { lessonId: string }) => p.lessonId));

        let completedCoursesCount = 0;
        const completedCourseIds: string[] = [];

        for (const course of courses) {
            const allLessons = course.modules.flatMap((m: { lessons: { id: string }[] }) => m.lessons);
            if (allLessons.length === 0) continue; // Skip empty courses

            const isCompleted = allLessons.every((l: { id: string }) => completedLessonIds.has(l.id));
            if (isCompleted) {
                completedCoursesCount++;
                completedCourseIds.push(course.id);
            }
        }

        return NextResponse.json({
            completedCoursesCount,
            completedCourseIds,
            totalCourses: courses.length
        });
    } catch (error) {
        console.error('Error fetching training stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
