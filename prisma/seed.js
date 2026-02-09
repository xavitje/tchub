const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Seed start...')

    // Create a system/admin user for testing without Azure AD
    const user = await prisma.user.upsert({
        where: { email: 'admin@travelcounsellors.com' },
        update: {},
        create: {
            id: '65bf8e8e8e8e8e8e8e8e8e8e', // Fixed ID to match frontend TEMP_USER_ID
            azureAdId: 'temp-admin-id',
            email: 'admin@travelcounsellors.com',
            displayName: 'System Admin',
            department: 'IT',
            jobTitle: 'Administrator',
            role: 'HQ_ADMIN',
        },
    })

    console.log('Admin user created:', user)

    // Create some initial dummy posts
    const post1 = await prisma.post.create({
        data: {
            type: 'POST',
            title: 'Welkom bij het nieuwe HubTC!',
            content: 'Dit is ons nieuwe centrale platform voor communicatie en samenwerking. Veel plezier met ontdekken!',
            authorId: user.id,
            isPinned: true,
            publishedAt: new Date(),
        }
    })

    console.log('First post created:', post1)

    console.log('Seed finished successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
