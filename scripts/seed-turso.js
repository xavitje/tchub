const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const dotenv = require('dotenv');

dotenv.config();

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
})

const adapter = new PrismaLibSQL(libsql)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('Seed start (Turso)...')

    // 1. Create permissions
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

    const permissions = [];
    for (const p of permissionData) {
        const permission = await prisma.permission.upsert({
            where: { name: p.name },
            update: { description: p.description },
            create: p
        });
        permissions.push(permission);
    }
    console.log('Permissions created/verified');

    // 2. Create HQ_Admin role
    const hqAdminRole = await prisma.role.upsert({
        where: { name: 'HQ_Admin' },
        update: {
            description: 'Global administrator with role management',
            permissions: {
                set: permissions.map(p => ({ id: p.id }))
            }
        },
        create: {
            name: 'HQ_Admin',
            description: 'Global administrator with role management',
            permissions: {
                connect: permissions.map(p => ({ id: p.id }))
            }
        }
    });
    console.log('HQ_Admin role created/verified');

    // 3. Create Admin user
    const user = await prisma.user.upsert({
        where: { email: 'admin@travelcounsellors.com' },
        update: {
            roleId: hqAdminRole.id
        },
        create: {
            id: '65bf8e8e8e8e8e8e8e8e8e8e',
            azureAdId: 'temp-admin-id',
            email: 'admin@travelcounsellors.com',
            displayName: 'System Admin',
            department: 'IT',
            jobTitle: 'Administrator',
            role: 'HQ_ADMIN',
            roleId: hqAdminRole.id,
            isActive: true
        },
    })

    console.log('Admin user created/verified:', user.email);

    // 4. Create first post
    await prisma.post.create({
        data: {
            type: 'POST',
            title: 'Welkom bij het nieuwe HubTC!',
            content: 'Dit is ons nieuwe centrale platform voor communicatie en samenwerking op Turso/SQLite. Veel plezier met ontdekken!',
            authorId: user.id,
            isPinned: true,
            isPublished: true,
            publishedAt: new Date(),
        }
    });

    console.log('Seed finished successfully.');
}

main()
    .catch((e) => {
        console.error('Seed error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
