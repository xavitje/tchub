import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    try {
        const certificate = await prisma.certificate.findUnique({
            where: { code: params.code }
        });

        if (!certificate) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        return NextResponse.json(certificate);
    } catch (error) {
        console.error('Error fetching certificate:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
