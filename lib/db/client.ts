import { attachDatabasePool } from "@vercel/functions";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForDb = globalThis as unknown as { resumeBuilderPool?: Pool };

const pool =
  globalForDb.resumeBuilderPool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.resumeBuilderPool = pool;
}

// Keeps Vercel Fluid instances alive long enough to drain idle connections.
if (process.env.VERCEL) {
  attachDatabasePool(pool);
}

export const db = drizzle(pool, { schema });
export { pool };
