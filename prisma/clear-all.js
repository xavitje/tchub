const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Clearing entire database...')

    // Delete in correct order to respect foreign key constraints
    await prisma.notification.deleteMany({})
    await prisma.reaction.deleteMany({})
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
    await prisma.userSettings.deleteMany({})
    await prisma.pollVote.deleteMany({})
    await prisma.pollOption.deleteMany({})
    await prisma.poll.deleteMany({})
    await prisma.eventRegistration.deleteMany({})
    await prisma.event.deleteMany({})
    await prisma.attachment.deleteMany({})
    await prisma.comment.deleteMany({})
    await prisma.favorite.deleteMany({})
    await prisma.post.deleteMany({})
    await prisma.tag.deleteMany({})
    await prisma.hub.deleteMany({})
    await prisma.user.deleteMany({})

    console.log('Database cleared successfully.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
