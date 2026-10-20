import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { ConsentRequiredError } from "@/lib/errors";

export async function requireAiConsent(userId: string) {
  const [profile] = await db
    .select({ aiConsentAt: profiles.aiConsentAt })
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);

  if (!profile?.aiConsentAt) {
    throw new ConsentRequiredError();
  }
}
