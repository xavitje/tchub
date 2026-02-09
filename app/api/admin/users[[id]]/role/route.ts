import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { role, customRoleId } = await request.json();

        // Handle Dynamic Role (New System)
        if (customRoleId !== undefined) {
            const updatedUser = await prisma.user.update({
                where: { id: params.id },
                data: { roleId: customRoleId || null }
            });
            return NextResponse.json(updatedUser);
        }

        // Handle Legacy Role (Enum)
        if (role) {
            if (!['EMPLOYEE', 'MANAGER', 'ADMIN', 'HQ_ADMIN'].includes(role)) {
                return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
            }

            // Prevent self-demotion to avoid losing admin access
            if (params.id === (session.user as any).id && role !== 'ADMIN') {
                return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
            }

            const updatedUser = await prisma.user.update({
                where: { id: params.id },
                data: { role }
            });

            return NextResponse.json(updatedUser);
        }

        return NextResponse.json({ error: 'No role data provided' }, { status: 400 });

    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
