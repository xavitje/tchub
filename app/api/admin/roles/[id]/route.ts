import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// PATCH /api/admin/roles/[id] - Update a role
export async function PATCH(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, description, permissionIds } = await request.json();

        const role = await prisma.role.update({
            where: { id: params.id },
            data: {
                name,
                description,
                permissions: {
                    set: (permissionIds || []).map((id: string) => ({ id }))
                }
            },
            include: {
                permissions: true
            }
        });

        const formattedRole = {
            ...role,
            permissionIds: role.permissions.map((p: any) => p.id)
        };

        return NextResponse.json(formattedRole);
    } catch (error) {
        console.error('Error updating role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// DELETE /api/admin/roles/[id] - Delete a role
export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user || (session.user as any).role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check if role is in use
        const userCount = await prisma.user.count({
            where: { roleId: params.id }
        });

        if (userCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete role that is assigned to users'
            }, { status: 400 });
        }

        await prisma.role.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ message: 'Role deleted' });
    } catch (error) {
        console.error('Error deleting role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
