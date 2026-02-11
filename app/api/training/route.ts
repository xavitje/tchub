import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const level = searchParams.get('level');

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

        return NextResponse.json(courses);
    } catch (error) {
        console.error('Error fetching training courses:', error);
        return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        const canAccessAdmin = (session?.user as any)?.customRole?.permissions?.includes('ACCESS_ADMIN') || (session?.user as any)?.role === 'ADMIN' || (session?.user as any)?.role === 'HQ_ADMIN';

        if (!canAccessAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, level, duration, category, imageUrl } = body;

        if (!title || !description) {
            return NextResponse.json({ error: 'Title and description are required' }, { status: 400 });
        }

        const course = await prisma.trainingCourse.create({
            data: {
                title,
                description,
                level: level || 'BEGINNER',
                duration,
                category: category || 'GENERAL',
                imageUrl
            }
        });

        return NextResponse.json(course);
    } catch (error) {
        console.error('Error creating training course:', error);
        return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
    }
}
