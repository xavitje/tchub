const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Clearing database...')
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
    await prisma.notification.deleteMany({})
    await prisma.tag.deleteMany({})
    await prisma.hub.deleteMany({})
    await prisma.user.deleteMany({})
    console.log('Database cleared.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
