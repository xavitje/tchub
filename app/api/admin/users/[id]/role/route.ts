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
        const userRole = (session?.user as any)?.role;
        const userPermissions = (session?.user as any)?.customRole?.permissions || [];

        if (userRole !== 'ADMIN' && userRole !== 'HQ_ADMIN' && !userPermissions.includes('ACCESS_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { customRoleId, role } = await request.json();

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: params.id },
            data: {
                roleId: customRoleId || null,
                role: role || 'EMPLOYEE' // Keep legacy for compatibility
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
