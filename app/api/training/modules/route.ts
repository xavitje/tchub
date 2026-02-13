import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/training/modules - Create a new module for a course
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);

        // Check authorization
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get current user with role info
        const currentUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            include: {
                customRole: {
                    include: {
                        permissions: true
                    }
                }
            }
        });

        // Check if user is admin
        const isAdmin = currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'HQ_ADMIN' ||
            currentUser?.customRole?.name === 'Admin';

        if (!isAdmin) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const body = await request.json();
        const { courseId, title, description, order } = body;

        // Validation
        if (!courseId || !title) {
            return NextResponse.json({
                error: 'Missing required fields: courseId and title are required'
            }, { status: 400 });
        }

        // Verify course exists
        const course = await prisma.trainingCourse.findUnique({
            where: { id: courseId }
        });

        if (!course) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Create the module
        const module = await prisma.trainingModule.create({
            data: {
                courseId,
                title,
                description: description || '',
                order: order ?? 0,
            },
            include: {
                lessons: true,
                quiz: true
            }
        });

        return NextResponse.json(module, { status: 201 });
    } catch (error) {
        console.error('Error creating module:', error);
        return NextResponse.json({
            error: 'Failed to create module',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
