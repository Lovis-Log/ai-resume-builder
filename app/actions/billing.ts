"use server";

import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth/profile";
import { getBillingProvider } from "@/lib/billing";

export async function startCheckout() {
  const { user } = await requireProfile();
  const provider = getBillingProvider();
  const result = await provider.createCheckout(user.id);

  if ("url" in result) {
    redirect(result.url);
  }

  return result;
}

export async function openPortal() {
  const { user } = await requireProfile();
  const provider = getBillingProvider();
  const result = await provider.createPortal(user.id);

  if ("url" in result) {
    redirect(result.url);
  }

  return result;
}
