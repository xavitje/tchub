import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET /api/admin/permissions - List all available permissions
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        const userRole = (session?.user as any)?.role;
        const userPermissions = (session?.user as any)?.customRole?.permissions || [];

        if (userRole !== 'ADMIN' && userRole !== 'HQ_ADMIN' && !userPermissions.includes('ACCESS_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const permissions = await prisma.permission.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(permissions);
    } catch (error) {
        console.error('Error fetching permissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
