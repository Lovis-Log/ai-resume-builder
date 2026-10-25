import { attachDatabasePool } from "@vercel/functions";
import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Database = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  resumeBuilderPool?: Pool;
  resumeBuilderDb?: Database;
};

export function getPool(): Pool {
  const existing = globalForDb.resumeBuilderPool;
  if (existing) {
    return existing;
  }

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local locally or to the deployment environment variables.",
    );
  }

  const pool = new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  // Keeps Vercel Fluid instances alive long enough to drain idle connections.
  if (process.env.VERCEL) {
    attachDatabasePool(pool);
  }

  globalForDb.resumeBuilderPool = pool;
  return pool;
}

export function getDb(): Database {
  const existing = globalForDb.resumeBuilderDb;
  if (existing) {
    return existing;
  }

  const database = drizzle(getPool(), { schema });
  globalForDb.resumeBuilderDb = database;
  return database;
}

// Initialize on first use, not at import time. Next.js evaluates route modules
// while collecting build data, before runtime environment variables such as
// DATABASE_URL are available.
export const db = new Proxy({} as Database, {
  get(_target, property) {
    return Reflect.get(getDb(), property);
  },
});

export async function closePool(): Promise<void> {
  const pool = globalForDb.resumeBuilderPool;

  if (!pool) {
    return;
  }

  globalForDb.resumeBuilderPool = undefined;
  globalForDb.resumeBuilderDb = undefined;
  await pool.end();
}
