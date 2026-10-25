import "server-only";
import { rawSql } from "@neon/realtime/server";
import type { SealedLiveQuery } from "@neon/realtime/server";
import type { LiveResumeRow } from "./map";
import { getRealtime } from "./server";

export type { LiveResumeRow } from "./map";

/**
 * A single deterministic SELECT. Timestamps are returned as epoch milliseconds
 * so the server snapshot and every Realtime row have the same JSON-safe shape.
 */
export function resumesLiveQuery(userId: string) {
  return rawSql<LiveResumeRow>(
    `SELECT id, title, target_role, template, accent, density,
            last_tailored_for, content, version,
            floor(extract(epoch from created_at) * 1000)::bigint AS created_at_ms,
            floor(extract(epoch from updated_at) * 1000)::bigint AS updated_at_ms
       FROM resumes
      WHERE user_id = $1
      ORDER BY updated_at DESC`,
    [userId],
  );
}

export async function sealResumesQuery(
  userId: string,
): Promise<SealedLiveQuery<LiveResumeRow>> {
  return getRealtime().seal({ query: resumesLiveQuery(userId) });
}
