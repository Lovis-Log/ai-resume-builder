"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/dal";
import { auth } from "@/lib/auth/server";
import { getBillingProvider } from "@/lib/billing";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { InternalError } from "@/lib/errors";

export async function deleteAccount() {
  const user = await requireUser({ fresh: true });
  const provider = getBillingProvider();

  if (provider.enabled && provider.cancelSubscription) {
    await provider.cancelSubscription(user.id);
  }

  const { error } = await auth.deleteUser();
  if (error) {
    throw new InternalError(
      "We could not delete your account automatically. Contact support and we will finish it.",
    );
  }

  // Profiles -> resumes/usage/tailoring/subscriptions cascade. This also covers
  // deployments where the optional neon_auth.user foreign key was not applied.
  await db.delete(profiles).where(eq(profiles.id, user.id));

  // Clear this browser's cookies. Other devices may keep a cached signed session
  // for up to five minutes; the auth user is already gone.
  try {
    await auth.signOut();
  } catch {
    // The session may already be removed with the user.
  }

  redirect("/login");
}

export async function signOut() {
  await auth.signOut();
  redirect("/login");
}
