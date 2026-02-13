import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const quiz = await prisma.quiz.findUnique({
            where: { id: params.id },
            include: {
                questions: {
                    orderBy: { order: 'asc' },
                    include: {
                        options: {
                            select: {
                                id: true,
                                text: true
                                // Don't include isCorrect!
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
