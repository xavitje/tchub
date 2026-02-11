import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

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
        }).catch(err => {
            console.error('Prisma Error (findMany roles):', err);
            return [];
        });

        const formattedRoles = roles.map(role => ({
            ...role,
            permissionIds: role.permissions.map(p => p.id)
        }));

        return NextResponse.json(formattedRoles);
    } catch (error) {
        console.error('Fatal Error fetching roles:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
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
                permissions: {
                    connect: (permissionIds || []).map((id: string) => ({ id }))
                }
            },
            include: {
                permissions: true
            }
        });

        const formattedRole = {
            ...role,
            permissionIds: role.permissions.map(p => p.id)
        };

        return NextResponse.json(formattedRole);
    } catch (error) {
        console.error('Error creating role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
