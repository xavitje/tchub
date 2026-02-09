import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/admin/roles - List all roles
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const roles = await prisma.role.findMany({
            include: {
                permissions: true,
                _count: {
                    select: { users: true }
                }
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(roles);
    } catch (error) {
        console.error('Error fetching roles:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST /api/admin/roles - Create a new role
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, permissionIds } = await request.json();
        if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 });

        const role = await prisma.role.create({
            data: {
                name,
                description,
                permissionIds: permissionIds || []
            },
            include: {
                permissions: true
            }
        });

        return NextResponse.json(role);
    } catch (error) {
        console.error('Error creating role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
