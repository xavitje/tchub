import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

        if (!canAccessAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { moduleId, title, content, videoUrl, quiz, order, duration } = await request.json();

        if (!moduleId || !title) {
            return NextResponse.json({ error: 'Module ID and title are required' }, { status: 400 });
        }

        // Verify module exists
        const module = await prisma.trainingModule.findUnique({
            where: { id: moduleId }
        });

        if (!module) {
            return NextResponse.json({ error: 'Module not found' }, { status: 404 });
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

        const lesson = await prisma.trainingLesson.create({
            data: {
                moduleId,
                title,
                content: content || null,
                videoUrl: videoUrl || null,
                quiz: quiz || null,
                order: order || 0,
                duration: duration || null
            }
        });

        return NextResponse.json(lesson);
    } catch (error) {
        console.error('Error creating lesson:', error);
        return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const moduleId = searchParams.get('moduleId');

        if (!moduleId) {
            return NextResponse.json({ error: 'Module ID required' }, { status: 400 });
        }

        const lessons = await prisma.trainingLesson.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' }
        });

        return NextResponse.json(lessons);
    } catch (error) {
        console.error('Error fetching lessons:', error);
        return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
    }
}
