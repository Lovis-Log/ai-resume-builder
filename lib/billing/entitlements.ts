import "server-only";
import { and, eq, gt, gte, inArray, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  resumes,
  subscriptions,
  usageEvents,
  type SubscriptionRow,
} from "@/lib/db/schema";
import { resolvePlan, type Entitlements, type UsageKind } from "./types";

export const AI_KINDS: UsageKind[] = [
  "ai_summary",
  "ai_bullets",
  "ai_improve",
  "ai_keywords",
  "ai_tailor",
];

export const FREE_AI_LIMIT = 3;
export const FREE_PDF_LIMIT = 3;
export const FREE_RESUME_LIMIT = 1;
export const PRO_INCLUDED_AI = 500;
export const PRO_OVERAGE_LIMIT = 500;
export const PRO_HARD_AI_LIMIT = PRO_INCLUDED_AI + PRO_OVERAGE_LIMIT;
export const AI_OVERAGE_UNIT_PRICE = 0.05;
export const AI_OVERAGE_CAP_USD = 25;

export const STALE_PENDING_MS = 10 * 60 * 1000;

export function effectiveUsageFilter() {
  const staleBefore = new Date(Date.now() - STALE_PENDING_MS);
  return or(
    eq(usageEvents.status, "succeeded"),
    and(eq(usageEvents.status, "pending"), gt(usageEvents.createdAt, staleBefore)),
  );
}

async function countEffectiveUsage(
  userId: string,
  kinds: UsageKind[],
  periodStart: Date | null,
  executor: Pick<typeof db, "select"> = db,
): Promise<number> {
  const conditions = [
    eq(usageEvents.userId, userId),
    effectiveUsageFilter(),
    inArray(usageEvents.kind, kinds),
  ];
  if (periodStart) {
    conditions.push(gte(usageEvents.createdAt, periodStart));
  }

  const [row] = await executor
    .select({ count: sql<number>`count(*)::int` })
    .from(usageEvents)
    .where(and(...conditions));

  return row?.count ?? 0;
}

export function computeEntitlements(input: {
  subscription?: SubscriptionRow;
  resumeCount: number;
  aiUsed: number;
  pdfUsed: number;
  billingEnabled: boolean;
}): Entitlements {
  const { subscription, resumeCount, aiUsed, pdfUsed, billingEnabled } = input;
  const resolved = resolvePlan(subscription);

  if (resolved.isPro) {
    const aiOverageUsed = Math.max(0, aiUsed - PRO_INCLUDED_AI);
    return {
      plan: "pro",
      status: resolved.status,
      isPro: true,
      periodStart: resolved.periodStart,
      periodEnd: resolved.periodEnd,
      cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
      resumeCount,
      resumeLimit: null,
      canCreateResume: true,
      aiUsed,
      aiIncluded: PRO_INCLUDED_AI,
      aiLimit: PRO_HARD_AI_LIMIT,
      aiRemaining: Math.max(0, PRO_HARD_AI_LIMIT - aiUsed),
      aiOverageUsed,
      aiOverageLimit: PRO_OVERAGE_LIMIT,
      aiHardLimit: PRO_HARD_AI_LIMIT,
      canUseAI: aiUsed < PRO_HARD_AI_LIMIT,
      pdfUsed,
      pdfLimit: null,
      pdfRemaining: null,
      canDownload: true,
      billingEnabled,
    };
  }

  return {
    plan: "free",
    status: resolved.status,
    isPro: false,
    periodStart: null,
    periodEnd: resolved.periodEnd,
    cancelAtPeriodEnd: subscription?.cancelAtPeriodEnd ?? false,
    resumeCount,
    resumeLimit: FREE_RESUME_LIMIT,
    canCreateResume: resumeCount < FREE_RESUME_LIMIT,
    aiUsed,
    aiIncluded: FREE_AI_LIMIT,
    aiLimit: FREE_AI_LIMIT,
    aiRemaining: Math.max(0, FREE_AI_LIMIT - aiUsed),
    aiOverageUsed: 0,
    aiOverageLimit: 0,
    aiHardLimit: FREE_AI_LIMIT,
    canUseAI: aiUsed < FREE_AI_LIMIT,
    pdfUsed,
    pdfLimit: FREE_PDF_LIMIT,
    pdfRemaining: Math.max(0, FREE_PDF_LIMIT - pdfUsed),
    canDownload: pdfUsed < FREE_PDF_LIMIT,
    billingEnabled,
  };
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  const resolved = resolvePlan(subscription);
  const [resumeCountRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(resumes)
    .where(eq(resumes.userId, userId));
  const resumeCount = resumeCountRow?.count ?? 0;

  const aiUsed = await countEffectiveUsage(
    userId,
    AI_KINDS,
    resolved.isPro ? resolved.periodStart : null,
  );
  const pdfUsed = await countEffectiveUsage(
    userId,
    ["pdf_download"],
    resolved.isPro ? resolved.periodStart : null,
  );

  return computeEntitlements({
    subscription,
    resumeCount,
    aiUsed,
    pdfUsed,
    billingEnabled: isBillingEnabled(),
  });
}

export async function countEffectiveUsageInTransaction(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  kinds: UsageKind[],
  periodStart: Date | null,
): Promise<number> {
  const conditions = [
    eq(usageEvents.userId, userId),
    effectiveUsageFilter(),
    inArray(usageEvents.kind, kinds),
  ];
  if (periodStart) {
    conditions.push(gte(usageEvents.createdAt, periodStart));
  }

  const [row] = await tx
    .select({ count: sql<number>`count(*)::int` })
    .from(usageEvents)
    .where(and(...conditions));

  return row?.count ?? 0;
}

function isBillingEnabled(): boolean {
  const provider = process.env.BILLING_PROVIDER ?? "manual";
  return provider !== "manual";
}

export function getSubscriptionForDisplay(
  subscriptionsRows: SubscriptionRow[],
): SubscriptionRow | undefined {
  return subscriptionsRows[0];
}
