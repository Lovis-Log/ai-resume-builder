"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { db } from "@/lib/db";
import { profiles, subscriptions } from "@/lib/db/schema";
import { initialsFromName } from "@/lib/resume/format";

const nameSchema = z.object({
  name: z.string().trim().min(1, "Add your name").max(120),
});

export async function updateProfileName(input: { name: string }) {
  const { user, profile } = await requireProfile();
  const { name } = nameSchema.parse(input);

  await db
    .update(profiles)
    .set({ name, updatedAt: new Date() })
    .where(eq(profiles.id, user.id));

  revalidatePath("/dashboard");
  revalidatePath("/settings");

  return {
    name,
    firstName: name.split(/\s+/)[0] || "there",
    initials: initialsFromName(name),
    previous: profile.name,
  };
}

const planSchema = z.object({
  plan: z.enum(["free", "pro"]),
});

/**
 * Billing is still provider-manual. This persists the plan in Postgres so the
 * rest of the product reads real entitlements instead of a browser fixture.
 */
export async function setPlan(input: { plan: "free" | "pro" }) {
  const { user } = await requireProfile();
  const { plan } = planSchema.parse(input);
  const now = new Date();
  const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await db
    .insert(subscriptions)
    .values({
      userId: user.id,
      provider: "manual",
      status: plan === "pro" ? "active" : "inactive",
      plan,
      currentPeriodStart: plan === "pro" ? now : null,
      currentPeriodEnd: plan === "pro" ? periodEnd : null,
      cancelAtPeriodEnd: false,
    })
    .onConflictDoUpdate({
      target: subscriptions.userId,
      set: {
        provider: "manual",
        status: plan === "pro" ? "active" : "inactive",
        plan,
        currentPeriodStart: plan === "pro" ? now : null,
        currentPeriodEnd: plan === "pro" ? periodEnd : null,
        cancelAtPeriodEnd: false,
        updatedAt: now,
      },
    });

  const entitlements = await getEntitlements(user.id);
  revalidatePath("/billing");
  revalidatePath("/dashboard");

  return {
    plan: entitlements.plan,
    aiUsed: entitlements.aiUsed,
    aiIncluded: entitlements.aiIncluded,
    renewsOn: entitlements.periodEnd?.toISOString() ?? null,
  };
}
