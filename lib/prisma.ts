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

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
