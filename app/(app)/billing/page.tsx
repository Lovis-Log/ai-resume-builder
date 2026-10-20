import { Suspense } from "react";
import { requireUserForPage } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { BillingClient } from "@/components/billing/billing-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Billing",
};

export default function BillingPage() {
  return (
    <Suspense fallback={<BillingSkeleton />}>
      <BillingData />
    </Suspense>
  );
}

async function BillingData() {
  const user = await requireUserForPage();
  await getOrCreateProfile(user);
  const entitlements = await getEntitlements(user.id);
  return <BillingClient entitlements={entitlements} />;
}

function BillingSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-4 h-56" />
      <Skeleton className="mt-4 h-40" />
    </main>
  );
}
