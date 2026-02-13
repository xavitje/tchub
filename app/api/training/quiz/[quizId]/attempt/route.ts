import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';

export async function POST(
    request: Request,
    { params }: { params: { quizId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { answers } = await request.json(); // { questionId: optionId }

        const quiz = await prisma.quiz.findUnique({
            where: { id: params.quizId },
            include: {
                questions: {
                    include: { options: true }
                },
                course: true
            }
        });

        if (!quiz) {
            return NextResponse.json({ error: 'Quiz not found' }, { status: 404 });
        }

        let correctCount = 0;
        let totalQuestions = quiz.questions.length;

        // Calculate score
        // Calculate score
        quiz.questions.forEach((q: any) => {
            const userAnswerId = answers[q.id];
            const correctOption = q.options.find((o: any) => o.isCorrect);

            if (correctOption && userAnswerId === correctOption.id) {
                correctCount++;
            }
        });

        const score = Math.round((correctCount / totalQuestions) * 100);
        const passed = score >= quiz.passingScore;

        // Save attempt
        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId: quiz.id,
                userId: session.user.id,
                score,
                passed,
                answers: JSON.stringify(answers)
            }
        });

        // If passed and it's a final exam, generate certificate
        let certificate = null;
        if (passed && quiz.courseId) {
            // Check if already has certificate
            const existingCert = await prisma.certificate.findUnique({
                where: {
                    userId_courseId: {
                        userId: session.user.id,
                        courseId: quiz.courseId
                    }
                }
            });

            if (!existingCert) {
                const user = await prisma.user.findUnique({ where: { id: session.user.id } });
                certificate = await prisma.certificate.create({
                    data: {
                        userId: session.user.id,
                        courseId: quiz.courseId,
                        userName: user?.displayName || 'Unknown',
                        courseTitle: quiz.course?.title || 'Training Course',
                        code: randomUUID().toUpperCase().substring(0, 12)
                    }
                });
            } else {
                certificate = existingCert;
            }
        }

        return NextResponse.json({
            attempt,
            passed,
            score,
            certificateId: certificate?.id,
            certificateCode: certificate?.code
        });

    } catch (error) {
        console.error('Error submitting quiz:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
