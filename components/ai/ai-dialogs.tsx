"use client";

import { useState } from "react";
import {
  Check,
  Loader2,
  ShieldAlert,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { acceptAiConsent } from "@/app/actions/consent";
import type { ExperienceEntry } from "@/lib/resume/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Textarea } from "@/components/ui/textarea";
import { AiRequestError, postAi } from "./request";

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
      {message}
    </p>
  );
}

export function AiConsentDialog({
  open,
  onClose,
  onAccepted,
}: {
  open: boolean;
  onClose: () => void;
  onAccepted: () => void;
}) {
  const [checked, setChecked] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setPending(true);
    setError(null);
    try {
      await acceptAiConsent();
      onAccepted();
      onClose();
    } catch (acceptError) {
      setError(
        acceptError instanceof Error
          ? acceptError.message
          : "Could not save your consent.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Before you use AI features"
      description="AI writing and job tailoring send parts of your resume to DeepSeek."
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Not now
          </Button>
          <Button onClick={accept} disabled={!checked || pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Enable AI features
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm leading-relaxed text-stone-600">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900">
          <div className="flex items-center gap-2 font-medium">
            <ShieldAlert className="h-4 w-4" />
            What leaves this app
          </div>
          <p className="mt-2">
            When you use an AI feature, your resume text—and, for tailoring, the
            job description you paste—is sent to DeepSeek for processing. Do not
            include sensitive information such as your home address, government
            IDs, or financial details.
          </p>
        </div>

        <p>
          DeepSeek processes API data in the People&apos;s Republic of China and
          may use inputs to improve its models unless you opt out with the
          provider. AI output can be imperfect; review every suggestion before
          using it.
        </p>

        <p>
          See the{" "}
          <a
            href="/privacy"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-[var(--accent)] underline underline-offset-2"
          >
            privacy policy
          </a>{" "}
          for details. You can keep using the free score, editor, and PDF export
          without enabling AI.
        </p>

        <label className="flex items-start gap-3 rounded-xl border border-stone-200 bg-stone-50 p-3 text-stone-700">
          <input
            type="checkbox"
            checked={checked}
            onChange={(event) => setChecked(event.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-stone-300 text-[var(--accent)]"
          />
          <span>
            I understand and consent to sending my resume and job description to
            DeepSeek for AI processing.
          </span>
        </label>

        <ErrorNote message={error} />
      </div>
    </Modal>
  );
}

export function WriteSummaryDialog({
  open,
  onClose,
  resumeId,
  defaultRole,
  onInsert,
  onUsage,
  onLimit,
}: {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  defaultRole: string;
  onInsert: (summary: string) => void;
  onUsage: (remaining: number) => void;
  onLimit: () => void;
}) {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await postAi<{ summary: string }>("/api/ai/write-summary", {
        resumeId,
        targetRole,
        idempotencyKey: crypto.randomUUID(),
      });
      setResult(response.summary);
      if (response.usage) onUsage(response.usage.remaining);
    } catch (requestError) {
      if (requestError instanceof AiRequestError && requestError.status === 402) {
        onLimit();
      }
      setError(
        requestError instanceof Error ? requestError.message : "AI request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Write summary"
      description="Uses 1 AI action. The result is a draft — review it before inserting."
      footer={
        result ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Discard
            </Button>
            <Button
              onClick={() => {
                onInsert(result);
                onClose();
              }}
            >
              Use this summary
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={generate} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate summary
            </Button>
          </>
        )
      }
    >
      <div>
        <Label htmlFor="target-role">Target role</Label>
        <Input
          id="target-role"
          value={targetRole}
          onChange={(event) => setTargetRole(event.target.value)}
          maxLength={200}
          placeholder="Software Engineer"
          disabled={loading || result !== null}
        />
        <p className="mt-1 text-xs text-stone-400">
          Uses your existing experience, education, and skills. It will not invent
          facts.
        </p>

        {loading ? (
          <div className="mt-5 flex items-center gap-2 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Writing a draft…
          </div>
        ) : null}

        {result ? (
          <div className="mt-5 rounded-xl border border-teal-200 bg-teal-50/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              Suggested summary
            </p>
            <p className="mt-2 text-sm leading-relaxed text-stone-800">{result}</p>
          </div>
        ) : null}

        <ErrorNote message={error} />
      </div>
    </Modal>
  );
}

export function WriteBulletsDialog({
  open,
  onClose,
  resumeId,
  entry,
  onInsert,
  onUsage,
  onLimit,
}: {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  entry: ExperienceEntry | null;
  onInsert: (bullets: string[]) => void;
  onUsage: (remaining: number) => void;
  onLimit: () => void;
}) {
  const [jobTitle, setJobTitle] = useState(entry?.title ?? "");
  const [company, setCompany] = useState(entry?.company ?? "");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const response = await postAi<{ bullets: string[] }>("/api/ai/write-bullets", {
        resumeId,
        experienceId: entry?.id ?? null,
        jobTitle,
        company,
        notes,
        idempotencyKey: crypto.randomUUID(),
      });
      setResults(response.bullets);
      setSelected(new Set(response.bullets.map((_, index) => index)));
      if (response.usage) onUsage(response.usage.remaining);
    } catch (requestError) {
      if (requestError instanceof AiRequestError && requestError.status === 402) {
        onLimit();
      }
      setError(
        requestError instanceof Error ? requestError.message : "AI request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  function toggle(index: number) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Write bullets"
      description="Uses 1 AI action. Add notes with real facts; the AI should not invent metrics."
      size="lg"
      footer={
        results.length > 0 ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onInsert(results.filter((_, index) => selected.has(index)));
                onClose();
              }}
              disabled={selected.size === 0}
            >
              Add {selected.size} bullet{selected.size === 1 ? "" : "s"}
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={generate} disabled={loading || notes.trim().length < 10}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate bullets
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="bullet-title">Job title</Label>
            <Input
              id="bullet-title"
              value={jobTitle}
              onChange={(event) => setJobTitle(event.target.value)}
              maxLength={200}
              disabled={loading || results.length > 0}
            />
          </div>
          <div>
            <Label htmlFor="bullet-company">Company</Label>
            <Input
              id="bullet-company"
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              maxLength={200}
              disabled={loading || results.length > 0}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bullet-notes">What did you actually do?</Label>
          <Textarea
            id="bullet-notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            maxLength={4000}
            rows={4}
            placeholder="Built a React dashboard for the support team. Reduced page load time from 4s to 1.5s. Wrote tests for the billing flow."
            disabled={loading || results.length > 0}
          />
          <p className="mt-1 text-xs text-stone-400">
            Include tools, scope, and any numbers you can verify. The AI is told
            not to add facts you did not provide.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Writing bullets…
          </div>
        ) : null}

        {results.length > 0 ? (
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              Select the bullets to add
            </p>
            {results.map((bullet, index) => (
              <label
                key={index}
                className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3 hover:border-teal-300"
              >
                <input
                  type="checkbox"
                  checked={selected.has(index)}
                  onChange={() => toggle(index)}
                  className="mt-1 h-4 w-4 rounded border-stone-300 text-[var(--accent)]"
                />
                <span className="text-sm leading-relaxed text-stone-700">
                  {bullet}
                </span>
              </label>
            ))}
          </div>
        ) : null}

        <ErrorNote message={error} />
      </div>
    </Modal>
  );
}

export function ImproveBulletDialog({
  open,
  onClose,
  resumeId,
  bullet,
  jobTitle,
  company,
  onAccept,
  onUsage,
  onLimit,
}: {
  open: boolean;
  onClose: () => void;
  resumeId: string;
  bullet: string;
  jobTitle?: string;
  company?: string;
  onAccept: (bullet: string) => void;
  onUsage: (remaining: number) => void;
  onLimit: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function improve() {
    setLoading(true);
    setError(null);
    try {
      const response = await postAi<{ bullet: string }>("/api/ai/improve", {
        resumeId,
        bullet,
        jobTitle,
        company,
        idempotencyKey: crypto.randomUUID(),
      });
      setSuggestion(response.bullet);
      if (response.usage) onUsage(response.usage.remaining);
    } catch (requestError) {
      if (requestError instanceof AiRequestError && requestError.status === 402) {
        onLimit();
      }
      setError(
        requestError instanceof Error ? requestError.message : "AI request failed.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Improve bullet"
      description="Uses 1 AI action. Review the change before applying it."
      footer={
        suggestion ? (
          <>
            <Button variant="secondary" onClick={onClose}>
              Keep original
            </Button>
            <Button
              onClick={() => {
                onAccept(suggestion);
                onClose();
              }}
            >
              Use improved bullet
            </Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={improve} disabled={loading || !bullet.trim()}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <WandSparkles className="h-4 w-4" />
              )}
              Improve this bullet
            </Button>
          </>
        )
      }
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
            Original
          </p>
          <p className="mt-1 rounded-xl bg-stone-50 p-3 text-sm leading-relaxed text-stone-700">
            {bullet || "No bullet selected."}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 rounded-xl bg-stone-50 p-4 text-sm text-stone-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Rewriting…
          </div>
        ) : null}

        {suggestion ? (
          <div className="rounded-xl border border-teal-200 bg-teal-50/60 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-[var(--accent)]">
              Improved
            </p>
            <p className="mt-1 text-sm leading-relaxed text-stone-800">
              {suggestion}
            </p>
            <p className="mt-2 flex items-center gap-1 text-xs text-stone-500">
              <Check className="h-3.5 w-3.5 text-[var(--accent)]" />
              No new facts should have been added. Verify before applying.
            </p>
          </div>
        ) : null}

        <ErrorNote message={error} />
      </div>
    </Modal>
  );
}
