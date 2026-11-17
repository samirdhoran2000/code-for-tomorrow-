import { readFileSync } from 'fs';
import path from 'path';
import { pool } from './pool';

async function migrate(): Promise<void> {
  const sql = readFileSync(path.resolve(process.cwd(), 'src/db/schema.sql'), 'utf8');
  await pool.query(sql);
  console.log('Migration completed');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed', err);
  process.exit(1);
});
