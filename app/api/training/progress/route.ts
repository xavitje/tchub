import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        const progress = await prisma.userTrainingProgress.findMany({
            where: {
                userId: session.user.id,
                ...(courseId ? { courseId } : {})
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Error fetching progress:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, lessonId, status } = await request.json();

        const progress = await prisma.userTrainingProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: session.user.id,
                    lessonId: lessonId
                }
            },
            update: {
                status: status || 'COMPLETED',
                lastAccessed: new Date(),
                completedAt: status === 'COMPLETED' ? new Date() : undefined
            },
            create: {
                userId: session.user.id,
                courseId: courseId,
                lessonId: lessonId,
                status: status || 'COMPLETED',
                lastAccessed: new Date(),
                completedAt: status === 'COMPLETED' ? new Date() : undefined
            }
        });

        return NextResponse.json(progress);
    } catch (error) {
        console.error('Error updating progress:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
