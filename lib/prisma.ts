import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const libsql = createClient({
    url: process.env.TURSO_DATABASE_URL || "libsql://placeholder-for-build.turso.io",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
})

const adapter = new PrismaLibSQL(libsql as any)

export const prisma =
    globalForPrisma.prisma ??
    new (PrismaClient as any)({
        adapter,
        log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    })

/**
 * Ensures required columns exist in the SQLite DB used during the build.
 * This prevents SQL_INPUT_ERROR when the schema expects fields the build-file lacks.
 */
async function ensurePostColumns() {
    try {
        const infos: Array<{ name: string }> = await prisma.$queryRaw`
            PRAGMA table_info("Post");
        `;

        const columns = infos.map(i => i.name);

        // Check and add 'status'
        if (!columns.includes('status')) {
            await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN "status" TEXT;`;
            await prisma.$executeRaw`UPDATE "Post" SET "status" = 'NEW' WHERE "status" IS NULL;`;
        }

        // Check and add 'category' (Caused the build crash in turn 1)
        if (!columns.includes('category')) {
            await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN "category" TEXT;`;
        }

        // Check and add announcement fields to prevent future build crashes
        if (!columns.includes('announcementType')) {
            await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN "announcementType" TEXT;`;
            await prisma.$executeRaw`UPDATE "Post" SET "announcementType" = 'REGULAR' WHERE "announcementType" IS NULL;`;
        }

        if (!columns.includes('sharePointUrl')) {
            await prisma.$executeRaw`ALTER TABLE "Post" ADD COLUMN "sharePointUrl" TEXT;`;
        }
    } catch (e) {
        console.error('Error ensuring columns on Post table:', e);
    }
}

export { ensurePostColumns };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma