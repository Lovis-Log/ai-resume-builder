"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { renameResume, saveResume } from "@/app/actions/resumes";
import {
  AiConsentDialog,
  ImproveBulletDialog,
  WriteBulletsDialog,
  WriteSummaryDialog,
} from "@/components/ai/ai-dialogs";
import { TailoringPanel } from "@/components/ai/tailoring-panel";
import {
  UpgradeDialog,
  type UpgradeReason,
} from "@/components/billing/upgrade-dialog";
import { ResumeForm } from "@/components/editor/resume-form";
import { ResumePreview } from "@/components/preview/resume-preview";
import { ScorePanel } from "@/components/score/score-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import type { Entitlements } from "@/lib/billing/types";
import type { ResumeContent } from "@/lib/resume/schema";
import { computeScore } from "@/lib/score/compute";
import { cn } from "@/lib/utils";

type Tab = "preview" | "score" | "tailor";
type SaveState = "saved" | "saving" | "error" | "conflict";

type Draft = {
  content: ResumeContent;
  version: number;
  savedAt: number;
};

type ImproveTarget = {
  entryId: string;
  index: number;
  bullet: string;
};

export function EditorShell({
  resumeId,
  initialTitle,
  initialContent,
  initialVersion,
  entitlements,
  aiConsent,
}: {
  resumeId: string;
  initialTitle: string;
  initialContent: ResumeContent;
  initialVersion: number;
  entitlements: Entitlements;
  aiConsent: boolean;
}) {
  const { toast } = useToast();

  const [title, setTitle] = useState(initialTitle);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [content, setContent] = useState<ResumeContent>(initialContent);
  const [version, setVersion] = useState(initialVersion);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [tab, setTab] = useState<Tab>("preview");
  const [pageCount, setPageCount] = useState(1);

  const [aiRemaining, setAiRemaining] = useState(entitlements.aiRemaining);
  const [pdfRemaining, setPdfRemaining] = useState(entitlements.pdfRemaining);
  const [consentGranted, setConsentGranted] = useState(aiConsent);

  const [consentOpen, setConsentOpen] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [bulletsEntryId, setBulletsEntryId] = useState<string | null>(null);
  const [improveTarget, setImproveTarget] = useState<ImproveTarget | null>(null);
  const [upgradeReason, setUpgradeReason] = useState<UpgradeReason | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);

  const draftKey = `resume-draft:${resumeId}`;
  const hasMounted = useRef(false);
  const skipAutosave = useRef(false);
  const conflictRef = useRef(false);
  const savingRef = useRef(false);
  const queuedRef = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef({ content: initialContent, version: initialVersion });
  const initialRef = useRef({ content: initialContent, version: initialVersion });

  const persistRef = useRef<() => Promise<void>>(async () => {});

  const persist = useCallback(async () => {
    if (conflictRef.current) return;
    if (savingRef.current) {
      queuedRef.current = true;
      return;
    }

    savingRef.current = true;
    setSaveState("saving");
    setSaveError(null);
    const snapshot = latestRef.current;

    try {
      const result = await saveResume({
        id: resumeId,
        content: snapshot.content,
        version: snapshot.version,
      });
      setVersion(result.version);
      latestRef.current = {
        content: latestRef.current.content,
        version: result.version,
      };
      setSaveState("saved");
      setLastSavedAt(new Date());
      try {
        localStorage.removeItem(draftKey);
      } catch {
        // local storage may be unavailable
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not save your changes.";
      if (message.includes("another tab")) {
        conflictRef.current = true;
        setSaveState("conflict");
      } else {
        setSaveState("error");
        setSaveError(message);
      }
    } finally {
      savingRef.current = false;
      if (queuedRef.current && !conflictRef.current) {
        queuedRef.current = false;
        void persistRef.current();
      }
    }
  }, [resumeId, draftKey]);

  useEffect(() => {
    persistRef.current = persist;
  }, [persist]);

  useEffect(() => {
    latestRef.current = { content, version };
  }, [content, version]);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    if (skipAutosave.current) {
      skipAutosave.current = false;
      return;
    }
    if (conflictRef.current) return;

    setSaveState("saving");
    try {
      localStorage.setItem(
        draftKey,
        JSON.stringify({
          content,
          version: latestRef.current.version,
          savedAt: Date.now(),
        }),
      );
    } catch {
      // local storage may be unavailable
    }

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void persistRef.current();
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, draftKey]);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const raw = localStorage.getItem(draftKey);
        if (!raw) return;
        const parsed = JSON.parse(raw) as Draft;
        if (!parsed?.content || typeof parsed.version !== "number") return;
        if (
          parsed.version < initialRef.current.version ||
          JSON.stringify(parsed.content) ===
            JSON.stringify(initialRef.current.content)
        ) {
          localStorage.removeItem(draftKey);
          return;
        }
        setDraft(parsed);
      } catch {
        // ignore malformed drafts
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [draftKey]);

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (saveState === "saving" || saveState === "error") {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [saveState]);

  const score = useMemo(
    () => computeScore(content, pageCount).score,
    [content, pageCount],
  );

  const bulletsEntry =
    content.experience.find((entry) => entry.id === bulletsEntryId) ?? null;
  const defaultRole = content.experience[0]?.title ?? "";

  const liveEntitlements: Entitlements = {
    ...entitlements,
    aiRemaining,
    canUseAI: aiRemaining > 0,
    pdfRemaining,
    canDownload: pdfRemaining === null || pdfRemaining > 0,
  };

  function handleChange(updater: (current: ResumeContent) => ResumeContent) {
    setContent(updater);
  }

  function handleTitleBlur() {
    const next = title.trim();
    if (!next) {
      setTitle(savedTitle);
      return;
    }
    if (next === savedTitle) return;

    void renameResume({ id: resumeId, title: next })
      .then(() => {
        setSavedTitle(next);
        setTitle(next);
        toast("Resume renamed.", "success");
      })
      .catch((error) => {
        setTitle(savedTitle);
        toast(
          error instanceof Error ? error.message : "Could not rename the resume.",
          "error",
        );
      });
  }

  function gateAi(action: () => void) {
    if (!consentGranted) {
      setConsentOpen(true);
      return;
    }
    if (aiRemaining <= 0) {
      setUpgradeReason("ai");
      return;
    }
    action();
  }

  function handleWriteSummary() {
    gateAi(() => setSummaryOpen(true));
  }

  function handleWriteBullets(entryId: string) {
    gateAi(() => setBulletsEntryId(entryId));
  }

  function handleImprove(entryId: string, index: number, bullet: string) {
    gateAi(() => setImproveTarget({ entryId, index, bullet }));
  }

  function insertSummary(summary: string) {
    setContent((current) => ({ ...current, summary }));
    toast("Summary inserted. Review it before downloading.", "success");
  }

  function insertBullets(bullets: string[]) {
    if (!bulletsEntryId || bullets.length === 0) return;

    const entry = content.experience.find((item) => item.id === bulletsEntryId);
    const available = entry
      ? Math.max(
          0,
          10 - entry.bullets.filter((bullet) => bullet.trim()).length,
        )
      : 0;

    if (available === 0) {
      toast("This role already has 10 bullets. Remove one first.", "error");
      return;
    }

    const toAdd = bullets.slice(0, available);
    setContent((current) => ({
      ...current,
      experience: current.experience.map((item) =>
        item.id === bulletsEntryId
          ? {
              ...item,
              bullets: [
                ...item.bullets.filter((bullet) => bullet.trim()),
                ...toAdd,
              ],
            }
          : item,
      ),
    }));
    toast(
      toAdd.length < bullets.length
        ? `Added ${toAdd.length} bullets; the role is limited to 10.`
        : "Bullets added. Review them before downloading.",
      "success",
    );
  }

  function acceptImprovedBullet(bullet: string) {
    if (!improveTarget) return;
    setContent((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === improveTarget.entryId
          ? {
              ...entry,
              bullets: entry.bullets.map((item, index) =>
                index === improveTarget.index ? bullet : item,
              ),
            }
          : entry,
      ),
    }));
    toast("Bullet updated.", "success");
  }

  function handleTailoringApplied(result: {
    content: ResumeContent;
    version: number;
  }) {
    skipAutosave.current = true;
    conflictRef.current = false;
    setContent(result.content);
    setVersion(result.version);
    latestRef.current = { content: result.content, version: result.version };
    setSaveState("saved");
    setLastSavedAt(new Date());
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    toast("Suggestions applied and saved.", "success");
  }

  async function downloadPdf() {
    if (pdfRemaining === 0) {
      setUpgradeReason("pdf");
      return;
    }

    setDownloading(true);
    try {
      const response = await fetch(`/api/resumes/${resumeId}/pdf`, {
        method: "POST",
        headers: { "Idempotency-Key": crypto.randomUUID() },
      });

      if (response.status === 402) {
        setUpgradeReason("pdf");
        return;
      }

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(
          payload?.error?.message ?? "Could not generate the PDF. Try again.",
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      const name = (content.contact.fullName.trim() || savedTitle).replace(
        /[^a-zA-Z0-9._-]+/g,
        "-",
      );
      anchor.href = url;
      anchor.download = `${name}-Resume.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      if (pdfRemaining !== null) {
        setPdfRemaining(Math.max(0, pdfRemaining - 1));
      }
      toast("PDF downloaded.", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not generate the PDF.",
        "error",
      );
    } finally {
      setDownloading(false);
    }
  }

  function restoreDraft() {
    if (!draft) return;
    setContent(draft.content);
    setVersion(draft.version);
    latestRef.current = { content: draft.content, version: draft.version };
    setSaveState("saving");
    setDraft(null);
    toast("Draft restored. It will save automatically.", "success");
  }

  function discardDraft() {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // ignore
    }
    setDraft(null);
  }

  return (
    <div>
      <div className="border-b border-[var(--border)] bg-white/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-6 py-3">
          <Link
            href="/dashboard"
            className="rounded-md p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
            }}
            maxLength={120}
            className="h-9 w-full max-w-sm border-transparent bg-transparent px-2 text-lg font-semibold hover:border-stone-200 focus:border-[var(--accent)] focus:ring-0"
            aria-label="Resume title"
          />

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <SaveIndicator
              state={saveState}
              error={saveError}
              lastSavedAt={lastSavedAt}
              onRetry={() => void persistRef.current()}
            />
            <Badge
              variant={aiRemaining > 0 ? "accent" : "warning"}
              title="AI actions remaining"
            >
              <Sparkles className="mr-1 h-3 w-3" />
              {aiRemaining} AI left
            </Badge>
            <Button onClick={downloadPdf} disabled={downloading}>
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {downloading
                ? "Generating…"
                : pdfRemaining === null
                  ? "Download PDF"
                  : `Download PDF (${pdfRemaining})`}
            </Button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {draft ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" />
              We found unsaved changes from a previous session.
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="border-amber-300"
                onClick={discardDraft}
              >
                Discard
              </Button>
              <Button size="sm" onClick={restoreDraft}>
                Restore draft
              </Button>
            </div>
          </div>
        ) : null}

        {saveState === "conflict" ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            <div className="flex items-center gap-2">
              <TriangleAlert className="h-4 w-4" />
              This resume was updated in another tab. Reload to avoid overwriting
              newer changes.
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="border-red-300"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Reload latest
            </Button>
          </div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <div>
            <ResumeForm
              content={content}
              onChange={handleChange}
              onWriteSummary={handleWriteSummary}
              onWriteBullets={handleWriteBullets}
              onImprove={handleImprove}
            />
          </div>

          <aside className="xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)]">
            <div className="flex rounded-xl border border-[var(--border)] bg-white p-1">
              {(
                [
                  { id: "preview", label: "Preview" },
                  { id: "score", label: `Score ${score}` },
                  { id: "tailor", label: "Tailor" },
                ] as const
              ).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    tab === item.id
                      ? "bg-[var(--accent)] text-white"
                      : "text-stone-600 hover:bg-stone-100",
                  )}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div
              id="preview"
              className="mt-3 h-[calc(100%-3.25rem)] overflow-auto rounded-2xl border border-[var(--border)] bg-stone-100 p-4"
            >
              {tab === "preview" ? (
                <div className="mx-auto w-fit origin-top scale-[0.82] 2xl:scale-100">
                  <ResumePreview
                    content={content}
                    onPageCountChange={setPageCount}
                  />
                </div>
              ) : null}
              {tab === "score" ? (
                <ScorePanel
                  content={content}
                  pageCount={pageCount}
                  onRequestPreview={() => setTab("preview")}
                />
              ) : null}
              {tab === "tailor" ? (
                <TailoringPanel
                  resumeId={resumeId}
                  onApplied={handleTailoringApplied}
                  onUsage={setAiRemaining}
                  onLimit={() => setUpgradeReason("ai")}
                  consentGranted={consentGranted}
                  onNeedConsent={() => setConsentOpen(true)}
                  aiRemaining={aiRemaining}
                />
              ) : null}
            </div>
          </aside>
        </div>
      </main>

      {consentOpen ? (
        <AiConsentDialog
          open
          onClose={() => setConsentOpen(false)}
          onAccepted={() => {
            setConsentGranted(true);
            toast("AI features enabled.", "success");
          }}
        />
      ) : null}

      {summaryOpen ? (
        <WriteSummaryDialog
          open
          onClose={() => setSummaryOpen(false)}
          resumeId={resumeId}
          defaultRole={defaultRole}
          onInsert={insertSummary}
          onUsage={setAiRemaining}
          onLimit={() => setUpgradeReason("ai")}
        />
      ) : null}

      {bulletsEntry ? (
        <WriteBulletsDialog
          open
          onClose={() => setBulletsEntryId(null)}
          resumeId={resumeId}
          entry={bulletsEntry}
          onInsert={insertBullets}
          onUsage={setAiRemaining}
          onLimit={() => setUpgradeReason("ai")}
        />
      ) : null}

      {improveTarget ? (
        <ImproveBulletDialog
          open
          onClose={() => setImproveTarget(null)}
          resumeId={resumeId}
          bullet={improveTarget.bullet}
          jobTitle={
            content.experience.find((entry) => entry.id === improveTarget.entryId)
              ?.title
          }
          company={
            content.experience.find((entry) => entry.id === improveTarget.entryId)
              ?.company
          }
          onAccept={acceptImprovedBullet}
          onUsage={setAiRemaining}
          onLimit={() => setUpgradeReason("ai")}
        />
      ) : null}

      <UpgradeDialog
        open={upgradeReason !== null}
        onClose={() => setUpgradeReason(null)}
        entitlements={liveEntitlements}
        reason={upgradeReason ?? "ai"}
      />
    </div>
  );
}

function SaveIndicator({
  state,
  error,
  lastSavedAt,
  onRetry,
}: {
  state: SaveState;
  error: string | null;
  lastSavedAt: Date | null;
  onRetry: () => void;
}) {
  if (state === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-stone-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }

  if (state === "error") {
    return (
      <button
        type="button"
        onClick={onRetry}
        className="flex items-center gap-1.5 text-xs font-medium text-red-700 hover:underline"
        title={error ?? undefined}
      >
        <TriangleAlert className="h-3.5 w-3.5" />
        Couldn&apos;t save — retry
      </button>
    );
  }

  if (state === "conflict") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-red-700">
        <TriangleAlert className="h-3.5 w-3.5" />
        Out of sync
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 text-xs text-stone-500">
      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
      {lastSavedAt ? "Saved" : "All changes saved"}
    </span>
  );
}
