import "server-only";
import { createRealtime } from "@neon/realtime/server";

function databaseName(connectionString: string): string {
  try {
    const url = new URL(connectionString);
    return url.pathname.replace(/^\//, "") || "neondb";
  } catch {
    return "neondb";
  }
}

let instance: ReturnType<typeof createRealtime> | null = null;

export function getRealtime(): ReturnType<typeof createRealtime> {
  if (instance) return instance;

  const secret = process.env.NEON_REALTIME_SECRET;
  if (!secret) {
    throw new Error("NEON_REALTIME_SECRET is not set");
  }

  instance = createRealtime({
    secret,
    db: databaseName(process.env.DATABASE_URL ?? ""),
  });
  return instance;
}
