import { config } from "dotenv";

config({ path: ".env.local" });
config({ path: ".env" });

const userId = process.argv[2];

if (!userId) {
  console.error("Usage: npm run seed:grant-pro -- <neon-auth-user-id>");
  process.exit(1);
}

const { db, pool } = await import("../lib/db/client");
const { subscriptions } = await import("../lib/db/schema");

const now = new Date();
const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

await db
  .insert(subscriptions)
  .values({
    userId,
    provider: "manual",
    status: "active",
    plan: "pro",
    currentPeriodStart: now,
    currentPeriodEnd: periodEnd,
  })
  .onConflictDoUpdate({
    target: subscriptions.userId,
    set: {
      provider: "manual",
      status: "active",
      plan: "pro",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: false,
      updatedAt: now,
    },
  });

console.log(`Granted manual Pro to ${userId} until ${periodEnd.toISOString()}.`);
await pool.end();
