import { Suspense, type ReactNode } from "react";
import { LumeLogo } from "@/components/brand/logo";
import { RealtimeRoot } from "@/components/app/realtime-root";
import { WorkspaceProvider } from "@/components/app/workspace-store";
import { requireUserForPage } from "@/lib/auth/dal";
import { sealResumesQuery } from "@/lib/realtime/resumes";
import { getWorkspaceSnapshot } from "@/lib/workspace";
import "@/app/studio.css";
import "@/app/dashboard.css";
import "@/app/editor-legibility.css";
import "@/app/app-shell.css";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lume-app">
      <Suspense fallback={<WorkspaceFallback />}>
        <WorkspaceBoundary>{children}</WorkspaceBoundary>
      </Suspense>
    </div>
  );
}

async function WorkspaceBoundary({ children }: { children: ReactNode }) {
  const user = await requireUserForPage();
  const [snapshot, sealedQuery] = await Promise.all([
    getWorkspaceSnapshot(user),
    sealResumesQuery(user.id),
  ]);

  return (
    <RealtimeRoot>
      <WorkspaceProvider
        initialProfile={snapshot.profile}
        initialResumes={snapshot.resumes}
        sealedQuery={sealedQuery}
      >
        {children}
      </WorkspaceProvider>
    </RealtimeRoot>
  );
}

function WorkspaceFallback() {
  return (
    <div className="studio-missing">
      <LumeLogo id="workspace-loading" />
      <span className="studio-missing-loader" />
    </div>
  );
}
