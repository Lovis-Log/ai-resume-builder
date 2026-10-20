import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions, usageEvents } from "@/lib/db/schema";
import { ConflictError, LimitReachedError } from "@/lib/errors";
import {
  AI_KINDS,
  FREE_AI_LIMIT,
  FREE_PDF_LIMIT,
  PRO_HARD_AI_LIMIT,
  countEffectiveUsageInTransaction,
} from "./entitlements";
import { resolvePlan, type UsageKind } from "./types";

export type ReservationResult =
  | { status: "reserved"; eventId: string }
  | { status: "duplicate"; eventId: string }
  | { status: "in_progress"; eventId: string };

export async function reserveUsage(input: {
  userId: string;
  kind: UsageKind;
  idempotencyKey: string;
  resumeId?: string | null;
}): Promise<ReservationResult> {
  const { userId, kind, idempotencyKey, resumeId = null } = input;

  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${userId}))`);

    const [existing] = await tx
      .select()
      .from(usageEvents)
      .where(
        and(
          eq(usageEvents.userId, userId),
          eq(usageEvents.idempotencyKey, idempotencyKey),
        ),
      )
      .limit(1);

    if (existing) {
      if (existing.status === "succeeded") {
        return { status: "duplicate" as const, eventId: existing.id };
      }
      if (existing.status === "pending") {
        return { status: "in_progress" as const, eventId: existing.id };
      }
      throw new ConflictError(
        "That request already failed. Try again with a new request.",
      );
    }

    const [subscription] = await tx
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);

    const resolved = resolvePlan(subscription);
    const isAi = AI_KINDS.includes(kind);
    const periodStart = resolved.isPro ? resolved.periodStart : null;

    if (isAi) {
      const used = await countEffectiveUsageInTransaction(
        tx,
        userId,
        AI_KINDS,
        periodStart,
      );
      const limit = resolved.isPro ? PRO_HARD_AI_LIMIT : FREE_AI_LIMIT;
      if (used >= limit) {
        throw new LimitReachedError("ai");
      }
    } else {
      if (!resolved.isPro) {
        const used = await countEffectiveUsageInTransaction(
          tx,
          userId,
          ["pdf_download"],
          null,
        );
        if (used >= FREE_PDF_LIMIT) {
          throw new LimitReachedError("pdf");
        }
      }
    }

    const [event] = await tx
      .insert(usageEvents)
      .values({
        userId,
        resumeId,
        kind,
        status: "pending",
        idempotencyKey,
        billingPeriodStart: periodStart,
      })
      .returning({ id: usageEvents.id });

    return { status: "reserved" as const, eventId: event.id };
  });
}

export async function completeUsage(
  eventId: string,
  data: {
    model?: string;
    inputTokens?: number;
    outputTokens?: number;
    costUsd?: number;
  } = {},
) {
  await db
    .update(usageEvents)
    .set({
      status: "succeeded",
      model: data.model ?? null,
      inputTokens: data.inputTokens ?? null,
      outputTokens: data.outputTokens ?? null,
      costUsd:
        data.costUsd === undefined ? null : data.costUsd.toFixed(6),
      completedAt: new Date(),
    })
    .where(eq(usageEvents.id, eventId));
}

export async function failUsage(eventId: string, error: string) {
  await db
    .update(usageEvents)
    .set({
      status: "failed",
      error: error.slice(0, 1000),
      completedAt: new Date(),
    })
    .where(eq(usageEvents.id, eventId));
}

export async function getUsageEvent(eventId: string) {
  const [event] = await db
    .select()
    .from(usageEvents)
    .where(eq(usageEvents.id, eventId))
    .limit(1);
  return event;
}
