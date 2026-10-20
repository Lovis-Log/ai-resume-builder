import { Suspense } from "react";
import { requireUserForPage } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { SettingsClient } from "@/components/settings/settings-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Settings",
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<SettingsSkeleton />}>
      <SettingsData />
    </Suspense>
  );
}

async function SettingsData() {
  const user = await requireUserForPage();
  const profile = await getOrCreateProfile(user);

  return (
    <SettingsClient
      name={user.name}
      email={user.email}
      aiConsentAt={profile?.aiConsentAt?.toISOString() ?? null}
    />
  );
}

function SettingsSkeleton() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="mt-4 h-48" />
      <Skeleton className="mt-4 h-40" />
    </main>
  );
}
