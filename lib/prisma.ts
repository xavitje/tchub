import { PrismaClient } from '@prisma/client'
import { createClient } from '@libsql/client'
import { PrismaLibSQL } from '@prisma/adapter-libsql'

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const libsql = createClient({
    // Vercel build sometimes doesn't have env vars during static analysis,
    // so we provide a dummy URL to prevent the LibsqlError: URL_INVALID crash.
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

// After client creation ensure legacy column 'status' exists in SQLite DB used during build
// This avoids SQL_INPUT_ERROR when the schema has the field but the file lacks it.
async function ensureStatusColumn() {
    try {
        const infos: Array<{ name: string }> = await prisma.$queryRaw`
            PRAGMA table_info("Post");
        `;
        const has = infos.some((i) => i.name === 'status');
        if (!has) {
            // add nullable text column with default NEW (mimic schema)
            await prisma.$executeRaw`
                ALTER TABLE "Post" ADD COLUMN "status" TEXT;
            `;
            // sqlite can't add default via ALTER so set manually
            await prisma.$executeRaw`
                UPDATE "Post" SET "status" = 'NEW' WHERE "status" IS NULL;
            `;
        }
    } catch (e) {
        console.error('Error ensuring status column on Post table:', e);
    }
}

// expose helper but don't await here
export { ensureStatusColumn };

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
