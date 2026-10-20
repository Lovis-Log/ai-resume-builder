"use server";

import { revalidatePath } from "next/cache";
import { requireProfile, setAiConsent } from "@/lib/auth/profile";

export async function acceptAiConsent() {
  const { user } = await requireProfile();
  await setAiConsent(user.id);
  revalidatePath("/resume");
  return { ok: true };
}
