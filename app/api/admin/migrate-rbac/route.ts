import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const secret = searchParams.get('secret');

        if (secret !== 'migrate_me_now_123') {
            const session = await getServerSession(authOptions);
            if (!session?.user) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        console.log('[Migration] Starting Role & Permission migration...');

        // 1. Create Permissions
        const permissionData = [
            { name: 'ACCESS_ADMIN', description: 'Can enter the admin panel' },
            { name: 'MANAGE_USERS', description: 'Can edit/delete users' },
            { name: 'MANAGE_ROLES', description: 'Can create/edit/delete roles' },
            { name: 'CREATE_ANNOUNCEMENT', description: 'Can post site-wide news' },
            { name: 'CREATE_POST', description: 'Can create normal discussion posts' },
            { name: 'DELETE_ANY_POST', description: 'Can delete any discussion post' },
            { name: 'PIN_POST', description: 'Can pin any post' },
            { name: 'MANAGE_HUBS', description: 'Can manage TC Hubs links' },
        ];

        const permissions: any[] = [];
        for (const p of permissionData) {
            const permission = await prisma.permission.upsert({
                where: { name: p.name },
                update: { description: p.description },
                create: p
            });
            permissions.push(permission);
        }

        const getPermId = (name: string) => permissions.find(p => p.name === name)?.id || '';

        // 2. Create Roles
        const roles = [
            {
                name: 'Employee',
                description: 'Default staff role',
                permissionIds: [getPermId('CREATE_POST')]
            },
            {
                name: 'Manager',
                description: 'Department manager with basic admin access',
                permissionIds: [getPermId('CREATE_POST'), getPermId('ACCESS_ADMIN')]
            },
            {
                name: 'Admin',
                description: 'Full administrator',
                permissionIds: permissions.filter(p => p.name !== 'MANAGE_ROLES').map(p => p.id)
            },
            {
                name: 'HQ_Admin',
                description: 'Global administrator with role management',
                permissionIds: permissions.map(p => p.id)
            }
        ];

        const dbRoles = [];
        for (const r of roles) {
            const role = await prisma.role.upsert({
                where: { name: r.name },
                update: {
                    description: r.description,
                    permissions: {
                        set: r.permissionIds.map(id => ({ id }))
                    }
                },
                create: {
                    name: r.name,
                    description: r.description,
                    permissions: {
                        connect: r.permissionIds.map(id => ({ id }))
                    }
                }
            });
            dbRoles.push(role);
        }

        // 3. Migrate Users
        const users = await prisma.user.findMany({
            where: { roleId: null }
        });

        console.log(`[Migration] Migrating ${users.length} users...`);

        for (const user of users) {
            let targetRoleName = 'Employee';
            if (user.role === 'HQ_ADMIN') targetRoleName = 'HQ_Admin';
            else if (user.role === 'ADMIN') targetRoleName = 'Admin';
            else if (user.role === 'MANAGER') targetRoleName = 'Manager';

            const targetRole = dbRoles.find(r => r.name === targetRoleName);
            if (targetRole) {
                await prisma.user.update({
                    where: { id: user.id },
                    data: { roleId: targetRole.id }
                });
            }
        }

        return NextResponse.json({
            message: 'Migration successful',
            permissionsCount: permissions.length,
            rolesCount: dbRoles.length,
            usersMigrated: users.length
        });

    } catch (error) {
        console.error('[Migration] Error:', error);
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 });
    }
}
