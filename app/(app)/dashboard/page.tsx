import { Suspense } from "react";
import { requireUserForPage } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { listResumes } from "@/lib/resume/queries";
import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Dashboard",
};

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardData />
    </Suspense>
  );
}

async function DashboardData() {
  const user = await requireUserForPage();
  await getOrCreateProfile(user);

  const [rows, entitlements] = await Promise.all([
    listResumes(user.id),
    getEntitlements(user.id),
  ]);

  const resumes = rows.map((resume) => ({
    id: resume.id,
    title: resume.title,
    updatedAt: resume.updatedAt.toISOString(),
  }));

  return <DashboardClient resumes={resumes} entitlements={entitlements} />;
}

function DashboardSkeleton() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="mt-3 h-4 w-80" />
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
        <Skeleton className="h-40" />
      </div>
    </main>
  );
}
