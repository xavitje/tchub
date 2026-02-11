const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set in .env');
    process.exit(1);
}

const client = createClient({ url, authToken });

async function pushSchema() {
    try {
        console.log('Reading migration file...');
        // Find the latest migration
        const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
        const migrationFolders = fs.readdirSync(migrationsDir).filter(f => fs.lstatSync(path.join(migrationsDir, f)).isDirectory());
        const latestMigration = migrationFolders.sort().reverse()[0];

        if (!latestMigration) {
            console.error('No migrations found in prisma/migrations');
            process.exit(1);
        }

        const migrationPath = path.join(migrationsDir, latestMigration, 'migration.sql');
        console.log(`Using migration: ${latestMigration}`);

        const sql = fs.readFileSync(migrationPath, 'utf8');

        console.log('Pushing schema to Turso...');
        await client.executeMultiple(sql);
        console.log('✅ Success! Schema pushed to Turso.');

    } catch (error) {
        console.error('❌ Error pushing schema:', error);
        process.exit(1);
    } finally {
        // client.close() is not strictly needed for the default HTTP client but good practice
    }
}

pushSchema();
