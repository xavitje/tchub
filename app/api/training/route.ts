import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    console.log('--- GET /api/training START ---');
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const level = searchParams.get('level');
        console.log('Filters:', { category, level });

        const courses = await prisma.trainingCourse.findMany({
            where: {
                isActive: true,
                category: category ? category : undefined,
                level: level ? level : undefined,
            },
            include: {
                _count: {
                    select: { modules: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log(`Found ${courses.length} courses`);
        return NextResponse.json(courses);
    } catch (error: any) {
        console.error('Error fetching training courses FULL ERROR:', error);
        return NextResponse.json({
            error: 'Failed to fetch courses',
            details: error.message
        }, { status: 500 });
    }
}

export async function POST(request: Request) {
    console.log('--- POST /api/training START ---');
    try {
        const session = await getServerSession(authOptions);
        console.log('Session user:', session?.user?.id);

        const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';
        console.log('Can access admin:', canAccessAdmin);

        if (!canAccessAdmin) {
            console.error('Unauthorized access attempt');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('Request body:', body);
        const { title, description, level, duration, category, imageUrl } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        // Validate types if needed
        const newCourseData = {
            title,
            description,
            level: level || 'BEGINNER',
            duration,
            category: category || 'GENERAL',
            imageUrl
        };
        console.log('Creating course with data:', newCourseData);

        const course = await prisma.trainingCourse.create({
            data: newCourseData
        });

        console.log('Course created successfully:', course.id);
        return NextResponse.json(course);
    } catch (error: any) {
        console.error('Error creating training course FULL ERROR:', error);
        return NextResponse.json({
            error: 'Failed to create course',
            details: error.message
        }, { status: 500 });
    }
}
