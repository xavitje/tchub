const { createClient } = require('@libsql/client');
const dotenv = require('dotenv');

dotenv.config();

const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
    console.log('Adding quiz column to TrainingLesson...');
    try {
        await client.execute(`
            ALTER TABLE TrainingLesson ADD COLUMN quiz TEXT;
        `);
        console.log('Successfully added quiz column!');
    } catch (error) {
        if (error.message.includes('duplicate column name')) {
            console.log('Column already exists.');
        } else {
            console.error('Error adding column:', error);
        }
    }
}

main();
