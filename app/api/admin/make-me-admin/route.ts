import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: { role: 'ADMIN' }
        });

        return NextResponse.json({ message: 'Success', role: updatedUser.role });
    } catch (error) {
        console.error('Error in make-me-admin:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
