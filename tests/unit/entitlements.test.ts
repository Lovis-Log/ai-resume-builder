import { describe, expect, it } from "vitest";
import { computeEntitlements } from "@/lib/billing/entitlements";
import type { SubscriptionRow } from "@/lib/db/schema";

function subscription(overrides: Partial<SubscriptionRow> = {}): SubscriptionRow {
  const now = new Date();
  return {
    id: "sub-1",
    userId: "user-1",
    provider: "manual",
    customerId: null,
    subscriptionId: null,
    status: "active",
    plan: "pro",
    currentPeriodStart: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
    cancelAtPeriodEnd: false,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

describe("computeEntitlements", () => {
  it("returns free lifetime limits without a subscription", () => {
    const result = computeEntitlements({
      resumeCount: 0,
      aiUsed: 0,
      pdfUsed: 0,
      billingEnabled: false,
    });
    expect(result.plan).toBe("free");
    expect(result.aiRemaining).toBe(3);
    expect(result.pdfRemaining).toBe(3);
    expect(result.resumeLimit).toBe(1);
    expect(result.canCreateResume).toBe(true);
  });

  it("blocks free users at each limit", () => {
    const result = computeEntitlements({
      resumeCount: 1,
      aiUsed: 3,
      pdfUsed: 3,
      billingEnabled: false,
    });
    expect(result.canCreateResume).toBe(false);
    expect(result.canUseAI).toBe(false);
    expect(result.canDownload).toBe(false);
  });

  it("gives Pro 500 included and 500 overage actions", () => {
    const result = computeEntitlements({
      subscription: subscription(),
      resumeCount: 8,
      aiUsed: 501,
      pdfUsed: 999,
      billingEnabled: true,
    });
    expect(result.plan).toBe("pro");
    expect(result.aiIncluded).toBe(500);
    expect(result.aiLimit).toBe(1000);
    expect(result.aiOverageUsed).toBe(1);
    expect(result.aiRemaining).toBe(499);
    expect(result.pdfLimit).toBeNull();
    expect(result.resumeLimit).toBeNull();
  });

  it("hard-stops at 1,000 Pro actions", () => {
    const result = computeEntitlements({
      subscription: subscription(),
      resumeCount: 1,
      aiUsed: 1000,
      pdfUsed: 1,
      billingEnabled: true,
    });
    expect(result.aiRemaining).toBe(0);
    expect(result.canUseAI).toBe(false);
  });

  it("keeps Pro access during the grace period after cancellation", () => {
    const result = computeEntitlements({
      subscription: subscription({ status: "canceled" }),
      resumeCount: 2,
      aiUsed: 0,
      pdfUsed: 0,
      billingEnabled: true,
    });
    expect(result.plan).toBe("pro");
    expect(result.canCreateResume).toBe(true);
  });

  it("reverts to free after the paid period ends", () => {
    const result = computeEntitlements({
      subscription: subscription({
        status: "canceled",
        currentPeriodEnd: new Date(Date.now() - 24 * 60 * 60 * 1000),
      }),
      resumeCount: 2,
      aiUsed: 0,
      pdfUsed: 0,
      billingEnabled: true,
    });
    expect(result.plan).toBe("free");
    expect(result.canCreateResume).toBe(false);
  });

  it("treats inactive subscriptions as free", () => {
    const result = computeEntitlements({
      subscription: subscription({ status: "past_due", currentPeriodEnd: new Date(Date.now() - 1000) }),
      resumeCount: 0,
      aiUsed: 0,
      pdfUsed: 0,
      billingEnabled: false,
    });
    expect(result.plan).toBe("free");
  });
});
