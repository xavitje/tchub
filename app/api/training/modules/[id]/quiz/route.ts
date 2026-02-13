import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET Quiz for a module
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
            where: { moduleId: params.id },
            include: {
                questions: {
                    include: { options: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Hide correct answers if not admin/passing?? 
        // For now return full object, handle visibility in frontend or separate 'take' endpoint

        return NextResponse.json(quiz || null);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

// CREATE/UPDATE Quiz for a module
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

        // Transaction to handle quiz creation/update and questions/options
        const result = await prisma.$transaction(async (tx: any) => {
            // Check if quiz exists
            let quiz = await tx.quiz.findUnique({
                where: { moduleId: params.id }
            });

            if (quiz) {
                // Update existing quiz
                quiz = await tx.quiz.update({
                    where: { id: quiz.id },
                    data: {
                        title,
                        description,
                        passingScore
                    }
                });

                // Delete existing questions to replace with new ones (simplest approach for now)
                await tx.quizQuestion.deleteMany({
                    where: { quizId: quiz.id }
                });
            } else {
                // Create new quiz
                quiz = await tx.quiz.create({
                    data: {
                        moduleId: params.id,
                        title,
                        description,
                        passingScore
                    }
                });
            }

            // Create questions and options
            if (questions && Array.isArray(questions)) {
                for (const [qIndex, q] of questions.entries()) {
                    await tx.quizQuestion.create({
                        data: {
                            quizId: quiz.id,
                            text: q.text,
                            type: q.type || 'MULTIPLE_CHOICE',
                            order: qIndex,
                            options: {
                                create: q.options.map((opt: any, oIndex: number) => ({
                                    text: opt.text,
                                    isCorrect: opt.isCorrect,
                                    order: oIndex
                                }))
                            }
                        }
                    });
                }
            }

            return quiz;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Error saving quiz:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
