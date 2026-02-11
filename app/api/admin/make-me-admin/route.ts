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

        // Find the HQ_Admin role in the new RBAC system
        const hqAdminRole = await prisma.role.findUnique({
            where: { name: 'HQ_Admin' }
        });

        const updatedUser = await prisma.user.update({
            where: { email: session.user.email },
            data: {
                role: 'HQ_ADMIN', // Legacy field
                roleId: hqAdminRole?.id // Link to new RBAC role
            }
        });

        return NextResponse.json({
            message: 'Success',
            role: updatedUser.role,
            customRole: hqAdminRole?.name
        });
    } catch (error) {
        console.error('Error in make-me-admin:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
