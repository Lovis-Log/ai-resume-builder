import { Suspense, type ReactNode } from "react";
import { AppHeader } from "@/components/layout/app-header";
import { DesktopGate } from "@/components/layout/desktop-gate";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<HeaderSkeleton />}>
        <AppHeader />
      </Suspense>
      <DesktopGate>{children}</DesktopGate>
    </div>
  );
}

function HeaderSkeleton() {
  return (
    <header className="border-b border-[var(--border)] bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-9 w-28" />
      </div>
    </header>
  );
}
