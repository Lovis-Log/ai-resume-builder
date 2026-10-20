import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { RateLimitError } from "@/lib/errors";

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ allowed: boolean; count: number }> {
  const windowMs = windowSeconds * 1000;
  const windowStart = new Date(Math.floor(Date.now() / windowMs) * windowMs);

  const result = await db.execute<{ count: number }>(sql`
    insert into rate_limits (key, window_start, count)
    values (${key}, ${windowStart}, 1)
    on conflict (key) do update set
      count = case
        when rate_limits.window_start = excluded.window_start
        then rate_limits.count + 1
        else 1
      end,
      window_start = case
        when rate_limits.window_start = excluded.window_start
        then rate_limits.window_start
        else excluded.window_start
      end
    returning count
  `);

  const count = Number(result.rows[0]?.count ?? 0);
  return { allowed: count <= limit, count };
}

export async function assertRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  const result = await checkRateLimit(key, limit, windowSeconds);
  if (!result.allowed) {
    throw new RateLimitError();
  }
}
