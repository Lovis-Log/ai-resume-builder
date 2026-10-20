import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUserForPage } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { NotFoundError } from "@/lib/errors";
import { getResumeForUser, parseResumeContent } from "@/lib/resume/queries";
import { EditorShell } from "@/components/editor/editor-shell";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata = {
  title: "Resume editor",
};

export default function ResumePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <ResumeData params={params} />
    </Suspense>
  );
}

async function ResumeData({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUserForPage();
  const profile = await getOrCreateProfile(user);

  let resume;
  try {
    resume = await getResumeForUser(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError) notFound();
    throw error;
  }

  const content = parseResumeContent(resume.content);
  const entitlements = await getEntitlements(user.id);

  return (
    <EditorShell
      resumeId={resume.id}
      initialTitle={resume.title}
      initialContent={content}
      initialVersion={resume.version}
      entitlements={entitlements}
      aiConsent={Boolean(profile?.aiConsentAt)}
    />
  );
}

function EditorSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <Skeleton className="h-10 w-72" />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="space-y-4">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <Skeleton className="h-[70vh]" />
      </div>
    </div>
  );
}
