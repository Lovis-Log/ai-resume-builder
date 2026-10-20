import type { SubscriptionRow } from "@/lib/db/schema";

export type Plan = "free" | "pro";
export type BillingProviderName = "manual" | "creem" | "dodo";

export type ResolvedPlan = {
  plan: Plan;
  isPro: boolean;
  periodStart: Date | null;
  periodEnd: Date | null;
  status: string;
};

export type Entitlements = {
  plan: Plan;
  status: string;
  isPro: boolean;
  periodStart: Date | null;
  periodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  resumeCount: number;
  resumeLimit: number | null;
  canCreateResume: boolean;
  aiUsed: number;
  aiIncluded: number;
  aiLimit: number;
  aiRemaining: number;
  aiOverageUsed: number;
  aiOverageLimit: number;
  aiHardLimit: number;
  canUseAI: boolean;
  pdfUsed: number;
  pdfLimit: number | null;
  pdfRemaining: number | null;
  canDownload: boolean;
  billingEnabled: boolean;
};

export type UsageKind =
  | "ai_summary"
  | "ai_bullets"
  | "ai_improve"
  | "ai_keywords"
  | "ai_tailor"
  | "pdf_download";

export type UsageEvent = {
  id: string;
  userId: string;
  resumeId: string | null;
  kind: UsageKind;
  status: "pending" | "succeeded" | "failed";
  idempotencyKey: string;
  model: string | null;
  inputTokens: number | null;
  outputTokens: number | null;
  costUsd: string | null;
  billingPeriodStart: Date | null;
  createdAt: Date;
};

export type CheckoutResult =
  | { url: string }
  | { disabled: true; reason: string };

export type WebhookEvent = {
  provider: BillingProviderName;
  id: string;
  type: string;
  payload: unknown;
};

export interface BillingProvider {
  name: BillingProviderName;
  enabled: boolean;
  createCheckout(userId: string): Promise<CheckoutResult>;
  createPortal(userId: string): Promise<CheckoutResult>;
  cancelSubscription?(userId: string): Promise<void>;
  verifyWebhook(request: Request): Promise<WebhookEvent>;
  handleWebhook(event: WebhookEvent): Promise<void>;
  reportUsage?(event: UsageEvent): Promise<void>;
}

export function resolvePlan(subscription: SubscriptionRow | undefined): ResolvedPlan {
  if (!subscription || subscription.plan !== "pro") {
    return {
      plan: "free",
      isPro: false,
      periodStart: null,
      periodEnd: null,
      status: subscription?.status ?? "inactive",
    };
  }

  const now = new Date();
  const periodEnd = subscription.currentPeriodEnd;
  const activeStatus =
    subscription.status === "active" || subscription.status === "trialing";
  const graceStatus =
    (subscription.status === "canceled" || subscription.status === "past_due") &&
    periodEnd !== null &&
    periodEnd > now;

  if (!activeStatus && !graceStatus) {
    return {
      plan: "free",
      isPro: false,
      periodStart: null,
      periodEnd,
      status: subscription.status,
    };
  }

  return {
    plan: "pro",
    isPro: true,
    periodStart: subscription.currentPeriodStart ?? subscription.createdAt,
    periodEnd,
    status: subscription.status,
  };
}
