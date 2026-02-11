const { PrismaClient } = require('@prisma/client');
const { createClient } = require('@libsql/client');
const { PrismaLibSQL } = require('@prisma/adapter-libsql');
const dotenv = require('dotenv');

dotenv.config();

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

const adapter = new PrismaLibSQL(libsql);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Debugging Training Progress...');

    // 1. Get a user
    const user = await prisma.user.findFirst();
    if (!user) {
        console.error('No users found!');
        return;
    }
    console.log('User found:', user.email);

    // 2. Get a lesson
    const lesson = await prisma.trainingLesson.findFirst({
        include: { module: true }
    });
    if (!lesson) {
        console.error('No lessons found!');
        return;
    }
    console.log('Lesson found:', lesson.title);

    // 3. Try to upsert progress
    try {
        console.log('Attempting upsert...');
        const progress = await prisma.userTrainingProgress.upsert({
            where: {
                userId_lessonId: {
                    userId: user.id,
                    lessonId: lesson.id
                }
            },
            update: {
                status: 'COMPLETED',
                lastAccessed: new Date(),
                completedAt: new Date()
            },
            create: {
                userId: user.id,
                courseId: lesson.module.courseId,
                lessonId: lesson.id,
                status: 'COMPLETED',
                lastAccessed: new Date(),
                completedAt: new Date()
            }
        });
        console.log('Upsert successful:', progress);
    } catch (error) {
        console.error('Upsert failed:', error);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
