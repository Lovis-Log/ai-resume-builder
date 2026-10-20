import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { requireUser, type CurrentUser } from "./dal";

export async function getOrCreateProfile(user: CurrentUser) {
  const [profile] = await db
    .insert(profiles)
    .values({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.image,
    })
    .onConflictDoUpdate({
      target: profiles.id,
      set: {
        email: user.email,
        name: user.name,
        avatarUrl: user.image,
        updatedAt: new Date(),
      },
    })
    .returning();

  return profile;
}

export async function requireProfile() {
  const user = await requireUser();
  const profile = await getOrCreateProfile(user);
  return { user, profile };
}

export async function setAiConsent(userId: string) {
  await db
    .update(profiles)
    .set({ aiConsentAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.id, userId));
}
