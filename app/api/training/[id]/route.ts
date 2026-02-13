import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    console.log('--- GET /api/training/[id] START ---', params.id);
    try {
        const course = await prisma.trainingCourse.findUnique({
            where: { id: params.id },
            include: {
                modules: {
                    include: {
                        lessons: { orderBy: { order: 'asc' } },
                        quiz: { select: { id: true, title: true } }
                    },
                    orderBy: { order: 'asc' }
                },
                finalExam: { select: { id: true, title: true } }
            }
        });

        if (!course) {
            console.warn('Course not found:', params.id);
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        console.log('Course fetched successfully');
        return NextResponse.json(course);
    } catch (error: any) {
        console.error('Error fetching course FULL ERROR:', error);
        return NextResponse.json({
            error: 'Failed to fetch course',
            details: error.message
        }, { status: 500 });
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

        const body = await request.json();
        const course = await prisma.trainingCourse.update({
            where: { id: params.id },
            data: body
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error('Error updating course:', error);
        return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

        if (!canAccessAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await prisma.trainingCourse.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting course:', error);
        return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
    }
}
