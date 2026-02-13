import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { courseId: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const certificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId: session.user.id,
                    courseId: params.courseId
                }
            }
        });

        if (!certificate) {
            return NextResponse.json(null); // No error, just no certificate
        }

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
