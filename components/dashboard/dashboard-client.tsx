"use client";

import { useMemo, useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import {
  createResume,
  deleteResume,
  renameResume,
} from "@/app/actions/resumes";
import type { Entitlements } from "@/lib/billing/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatShortDate } from "@/lib/utils";
import {
  UpgradeDialog,
  type UpgradeReason,
} from "@/components/billing/upgrade-dialog";

type ResumeListItem = {
  id: string;
  title: string;
  updatedAt: string;
};

export function DashboardClient({
  resumes,
  entitlements,
}: {
  resumes: ResumeListItem[];
  entitlements: Entitlements;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");

  const [renameTarget, setRenameTarget] = useState<ResumeListItem | null>(null);
  const [renameTitle, setRenameTitle] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<ResumeListItem | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);

  const sorted = useMemo(
    () =>
      [...resumes].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [resumes],
  );

  function openCreate() {
    if (!entitlements.canCreateResume) {
      setUpgradeReason("resume");
      return;
    }
    setCreateTitle("");
    setCreateOpen(true);
  }

  function handleCreate(event: FormEvent) {
    event.preventDefault();
    const title = createTitle.trim();
    if (!title) {
      toast("Give the resume a name first.", "error");
      return;
    }

    startTransition(async () => {
      try {
        const result = await createResume({ title });
        setCreateOpen(false);
        router.push(`/resume/${result.id}`);
      } catch (error) {
        toast(
          error instanceof Error
            ? error.message
            : "Could not create the resume. Try again.",
          "error",
        );
      }
    });
  }

  function openRename(resume: ResumeListItem) {
    setRenameTarget(resume);
    setRenameTitle(resume.title);
  }

  function handleRename(event: FormEvent) {
    event.preventDefault();
    if (!renameTarget) return;
    const title = renameTitle.trim();
    if (!title) {
      toast("The resume needs a name.", "error");
      return;
    }

    startTransition(async () => {
      try {
        await renameResume({ id: renameTarget.id, title });
        setRenameTarget(null);
        router.refresh();
      } catch (error) {
        toast(error instanceof Error ? error.message : "Could not rename.", "error");
      }
    });
  }

  function handleDelete() {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        await deleteResume({ id: deleteTarget.id });
        setDeleteTarget(null);
        router.refresh();
        toast("Resume deleted.", "success");
      } catch (error) {
        toast(error instanceof Error ? error.message : "Could not delete.", "error");
      }
    });
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--accent)]">Your workspace</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
            Resumes
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Build a clean version for every role. Everything saves automatically.
          </p>
        </div>
        <Button onClick={openCreate} disabled={pending}>
          <Plus className="h-4 w-4" />
          New resume
        </Button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <section>
          {sorted.length === 0 ? (
            <Card className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
                <FileText className="h-6 w-6 text-[var(--accent)]" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-stone-900">
                Start with your first resume
              </h2>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-600">
                Add your experience, let AI tighten the wording, then tailor it
                to a job description. The score updates as you write.
              </p>
              <Button className="mt-5" onClick={openCreate}>
                <Plus className="h-4 w-4" />
                Create a resume
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {sorted.map((resume) => (
                <Card key={resume.id} className="group relative overflow-visible p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link
                        href={`/resume/${resume.id}`}
                        className="block truncate text-base font-semibold text-stone-900 hover:text-[var(--accent)]"
                      >
                        {resume.title}
                      </Link>
                      <p className="mt-1 text-xs text-stone-500">
                        Updated {formatShortDate(resume.updatedAt)}
                      </p>
                    </div>
                    <details className="relative">
                      <summary className="list-none rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
                        <MoreHorizontal className="h-5 w-5" />
                      </summary>
                      <div className="absolute right-0 z-20 mt-1 w-40 rounded-xl border border-[var(--border)] bg-white p-1 shadow-lg">
                        <button
                          type="button"
                          onClick={() => openRename(resume)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100"
                        >
                          <Pencil className="h-4 w-4" />
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(resume)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </details>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <Badge variant="neutral">Draft</Badge>
                    <Link
                      href={`/resume/${resume.id}`}
                      className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
                    >
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Current plan
                </p>
                <p className="mt-1 text-lg font-semibold text-stone-900">
                  {entitlements.plan === "pro" ? "Pro" : "Free"}
                </p>
              </div>
              <Badge variant={entitlements.plan === "pro" ? "accent" : "neutral"}>
                {entitlements.plan === "pro" ? "Active" : "Lifetime limits"}
              </Badge>
            </div>

            <dl className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">AI actions</dt>
                <dd className="font-medium text-stone-900">
                  {entitlements.aiUsed} / {entitlements.aiLimit}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">PDF downloads</dt>
                <dd className="font-medium text-stone-900">
                  {entitlements.pdfLimit === null
                    ? "Unlimited"
                    : `${entitlements.pdfUsed} / ${entitlements.pdfLimit}`}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-stone-500">Resumes</dt>
                <dd className="font-medium text-stone-900">
                  {entitlements.resumeCount}
                  {entitlements.resumeLimit === null
                    ? ""
                    : ` / ${entitlements.resumeLimit}`}
                </dd>
              </div>
            </dl>

            {entitlements.plan === "free" ? (
              <Button
                className="mt-5 w-full"
                onClick={() => setUpgradeReason("resume")}
              >
                <Sparkles className="h-4 w-4" />
                Upgrade to Pro
              </Button>
            ) : (
              <Link href="/billing" className="mt-5 block">
                <Button variant="secondary" className="w-full">
                  Manage plan
                </Button>
              </Link>
            )}
          </Card>

          <Card className="bg-stone-900 p-5 text-white">
            <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
              Free hook
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-200">
              The 10-check score is free forever. Open a resume and use the Score
              tab to see exactly what to fix.
            </p>
          </Card>
        </aside>
      </div>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Name your resume"
        description="Use the role or company you are targeting. You can rename it later."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setCreateOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" form="create-resume-form" disabled={pending}>
              {pending ? "Creating…" : "Create resume"}
            </Button>
          </>
        }
      >
        <form id="create-resume-form" onSubmit={handleCreate}>
          <Label htmlFor="create-title">Resume name</Label>
          <Input
            id="create-title"
            value={createTitle}
            onChange={(event) => setCreateTitle(event.target.value)}
            placeholder="Software Engineer — Acme"
            maxLength={120}
            autoFocus
          />
        </form>
      </Modal>

      <Modal
        open={renameTarget !== null}
        onClose={() => setRenameTarget(null)}
        title="Rename resume"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setRenameTarget(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" form="rename-resume-form" disabled={pending}>
              {pending ? "Saving…" : "Save"}
            </Button>
          </>
        }
      >
        <form id="rename-resume-form" onSubmit={handleRename}>
          <Label htmlFor="rename-title">Resume name</Label>
          <Input
            id="rename-title"
            value={renameTitle}
            onChange={(event) => setRenameTitle(event.target.value)}
            maxLength={120}
            autoFocus
          />
        </form>
      </Modal>

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete this resume?"
        description="This permanently removes the resume and its tailoring history. It cannot be undone."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteTarget(null)}
              disabled={pending}
            >
              Keep it
            </Button>
            <Button variant="danger" onClick={handleDelete} disabled={pending}>
              {pending ? "Deleting…" : "Delete resume"}
            </Button>
          </>
        }
      >
        <p className="text-sm text-stone-600">
          <span className="font-medium text-stone-900">{deleteTarget?.title}</span>{" "}
          will be removed from your dashboard.
        </p>
      </Modal>

      <UpgradeDialog
        open={upgradeReason !== null}
        onClose={() => setUpgradeReason(null)}
        entitlements={entitlements}
        reason={upgradeReason ?? "resume"}
      />
    </main>
  );
}
