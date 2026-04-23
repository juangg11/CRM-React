import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.VITE_DATABASE_URL);

async function checkSchema() {
    try {
        const cols = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'appointments'`;
        console.log(cols);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

checkSchema();
