import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET Final Exam for a course
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
            where: { courseId: params.id },
            include: {
                questions: {
                    include: { options: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        return NextResponse.json(quiz || null);
    } catch (error) {
        console.error('Error fetching final exam:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// CREATE/UPDATE Final Exam for a course
export async function POST(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);

        // Admin check
        const currentUser = await prisma.user.findUnique({
            where: { id: session?.user?.id },
            include: { customRole: true }
        });

        const isAdmin = currentUser?.role === 'ADMIN' ||
            currentUser?.role === 'HQ_ADMIN' ||
            currentUser?.customRole?.name === 'Admin';

        if (!session?.user?.id || !isAdmin) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { title, description, passingScore, questions } = body;

        const result = await prisma.$transaction(async (tx) => {
            let quiz = await tx.quiz.findUnique({
                where: { courseId: params.id }
            });

            if (quiz) {
                quiz = await tx.quiz.update({
                    where: { id: quiz.id },
                    data: {
                        title,
                        description,
                        passingScore
                    }
                });

                await tx.quizQuestion.deleteMany({
                    where: { quizId: quiz.id }
                });
            } else {
                quiz = await tx.quiz.create({
                    data: {
                        courseId: params.id,
                        title,
                        description,
                        passingScore
                    }
                });
            }

            if (questions && Array.isArray(questions)) {
                for (const [qIndex, q] of questions.entries()) {
                    const question = await tx.quizQuestion.create({
                        data: {
                            quizId: quiz.id,
                            text: q.text,
                            type: q.type || 'MULTIPLE_CHOICE',
                            order: qIndex
                        }
                    });

                    if (q.options && Array.isArray(q.options)) {
                        await tx.quizOption.createMany({
                            data: q.options.map((opt: any, oIndex: number) => ({
                                questionId: question.id,
                                text: opt.text,
                                isCorrect: opt.isCorrect,
                                order: oIndex
                            }))
                        });
                    }
                }
            }

            return quiz;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error saving final exam:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
