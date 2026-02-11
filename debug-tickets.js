const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Fetching users...');
        const user = await prisma.user.findFirst();

        if (!user) {
            console.log('No users found to test with.');
            return;
        }

        console.log(`Found user: ${user.email} (${user.id})`);
        console.log('Attempting to create a support ticket...');

        const ticket = await prisma.supportTicket.create({
            data: {
                userId: user.id,
                subject: 'Debug Ticket',
                category: 'TECHNICAL',
                priority: 'NORMAL',
                status: 'OPEN',
                messages: {
                    create: {
                        senderId: user.id,
                        content: 'This is a test message from the debug script.'
                    }
                }
            }
        });

        console.log('Ticket created successfully:', ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
