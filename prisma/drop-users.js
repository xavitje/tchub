const { MongoClient } = require('mongodb');

async function main() {
    const client = new MongoClient(process.env.DATABASE_URL);

    try {
        await client.connect();
        const db = client.db('hubtc');

        console.log('Dropping User collection...');
        await db.collection('User').drop();
        console.log('User collection dropped successfully.');

    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await client.close();
    }
}

main();
