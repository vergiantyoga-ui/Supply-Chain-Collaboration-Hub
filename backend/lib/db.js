import { Pool } from "pg";

/**
 * PostgreSQL connection pool.
 *
 * This backend is designed to run against a real Postgres database (see
 * db/schema.sql + db/seed.sql). However, per project requirements, every
 * page in this build must work off mock data out of the box — so the pool
 * is only created when DATABASE_URL is explicitly configured. When it is
 * not set, lib/repository.js transparently falls back to the in-memory
 * mock dataset in lib/mockData.js.
 *
 * To switch this backend to real Postgres:
 *   1. Create a database and run: psql $DATABASE_URL -f db/schema.sql
 *   2. Seed it:                    psql $DATABASE_URL -f db/seed.sql
 *   3. Set DATABASE_URL in .env (see .env.example)
 *   4. Restart the server — lib/repository.js will detect the pool and
 *      start executing the real SQL queries automatically.
 */
let pool = null;

if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
  });
}

export function getPool() {
  return pool;
}

export function isDatabaseConfigured() {
  return pool !== null;
}
