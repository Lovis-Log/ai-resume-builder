"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Lock,
  Sparkles,
  Target,
} from "lucide-react";
import { applyTailoring } from "@/app/actions/resumes";
import type { ResumeContent } from "@/lib/resume/schema";
import type {
  TailoringKeyword,
  TailoringSuggestions,
} from "@/lib/tailoring/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AiRequestError, postAi } from "./request";

export function TailoringPanel({
  resumeId,
  onApplied,
  onUsage,
  onLimit,
  consentGranted,
  onNeedConsent,
  aiRemaining,
}: {
  resumeId: string;
  onApplied: (result: { content: ResumeContent; version: number }) => void;
  onUsage: (remaining: number) => void;
  onLimit: () => void;
  consentGranted: boolean;
  onNeedConsent: () => void;
  aiRemaining: number;
}) {
  const [jobDescription, setJobDescription] = useState("");
  const [runId, setRunId] = useState<string | null>(null);
  const [keywords, setKeywords] = useState<TailoringKeyword[]>([]);
  const [missing, setMissing] = useState<TailoringKeyword[]>([]);
  const [suggestions, setSuggestions] = useState<TailoringSuggestions | null>(null);
  const [selectedSummary, setSelectedSummary] = useState(true);
  const [selectedBullets, setSelectedBullets] = useState<Set<string>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);
  const [tailoring, setTailoring] = useState(false);
  const [applying, setApplying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleError(requestError: unknown) {
    if (requestError instanceof AiRequestError) {
      if (requestError.status === 402) {
        onLimit();
      }
      if (requestError.code === "CONSENT_REQUIRED") {
        onNeedConsent();
      }
    }
    setError(
      requestError instanceof Error ? requestError.message : "Something went wrong.",
    );
  }

  async function analyze() {
    if (!consentGranted) {
      onNeedConsent();
      return;
    }
    if (aiRemaining <= 0) {
      onLimit();
      return;
    }

    setAnalyzing(true);
    setError(null);
    setSuggestions(null);
    try {
      const response = await postAi<{
        runId: string;
        keywords: TailoringKeyword[];
        missing: TailoringKeyword[];
      }>("/api/ai/keywords", {
        resumeId,
        jobDescription,
        idempotencyKey: crypto.randomUUID(),
      });
      setRunId(response.runId);
      setKeywords(response.keywords);
      setMissing(response.missing);
      if (response.usage) onUsage(response.usage.remaining);
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setAnalyzing(false);
    }
  }

  async function tailor() {
    if (!runId) return;
    if (!consentGranted) {
      onNeedConsent();
      return;
    }
    if (aiRemaining <= 0) {
      onLimit();
      return;
    }

    setTailoring(true);
    setError(null);
    try {
      const response = await postAi<{
        runId: string;
        suggestions: TailoringSuggestions;
      }>("/api/ai/tailor", {
        runId,
        idempotencyKey: crypto.randomUUID(),
      });
      setSuggestions(response.suggestions);
      setSelectedSummary(true);
      setSelectedBullets(new Set(response.suggestions.bullets.map((item) => item.id)));
      if (response.usage) onUsage(response.usage.remaining);
    } catch (requestError) {
      handleError(requestError);
    } finally {
      setTailoring(false);
    }
  }

  async function apply() {
    if (!runId || !suggestions || !consentGranted) return;

    const selectedIds = [
      ...(selectedSummary ? ["summary"] : []),
      ...Array.from(selectedBullets),
    ];

    if (selectedIds.length === 0) {
      setError("Select at least one suggestion to apply.");
      return;
    }

    setApplying(true);
    setError(null);
    try {
      const result = await applyTailoring({ runId, selectedIds });
      onApplied(result);
      setSuggestions(null);
      setRunId(null);
      setKeywords([]);
      setMissing([]);
    } catch (applyError) {
      setError(
        applyError instanceof Error
          ? applyError.message
          : "Could not apply the suggestions.",
      );
    } finally {
      setApplying(false);
    }
  }

  function toggleBullet(id: string) {
    setSelectedBullets((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-stone-900">
          <Target className="h-4 w-4 text-[var(--accent)]" />
          Tailor to a job
        </div>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          Paste the job description. Analyze the keywords, then tailor the summary
          and your three most relevant bullets. Each step uses 1 AI action.
        </p>

        {!consentGranted ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            <Lock className="mt-0.5 h-4 w-4 flex-none" />
            <div>
              <p className="font-medium">AI features are off.</p>
              <p className="mt-1">
                Enable AI to send your resume and this job description to DeepSeek.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-amber-300 text-amber-900 hover:bg-amber-100"
                onClick={onNeedConsent}
              >
                Review and enable
              </Button>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <Textarea
            value={jobDescription}
            onChange={(event) => {
              setJobDescription(event.target.value);
              setRunId(null);
              setKeywords([]);
              setMissing([]);
              setSuggestions(null);
            }}
            rows={7}
            maxLength={10_000}
            placeholder="Paste the full job description here…"
            disabled={analyzing || tailoring || applying}
          />
          <div className="mt-1 flex items-center justify-between text-xs text-stone-400">
            <span>{jobDescription.length}/10,000 characters</span>
            <span>Uses 1 AI action to analyze</span>
          </div>
        </div>

        <Button
          className="mt-3 w-full"
          onClick={analyze}
          disabled={
            analyzing ||
            tailoring ||
            applying ||
            jobDescription.trim().length < 40 ||
            !consentGranted
          }
        >
          {analyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {analyzing ? "Analyzing…" : "Analyze job"}
        </Button>

        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </div>

      {keywords.length > 0 ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">
                Keyword match
              </h3>
              <p className="mt-1 text-xs text-stone-500">
                {keywords.length - missing.length} present · {missing.length} missing
              </p>
            </div>
            <Badge variant={missing.length > 0 ? "warning" : "success"}>
              {missing.length > 0 ? "Room to improve" : "Strong match"}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {keywords.map((keyword) => (
              <span
                key={keyword.term}
                title={`Evidence: ${keyword.evidenceQuote}`}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                  keyword.found
                    ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                    : "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
                )}
              >
                {keyword.found ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <ArrowRight className="h-3 w-3" />
                )}
                {keyword.term}
              </span>
            ))}
          </div>

          <p className="mt-3 text-xs text-stone-500">
            Only add a missing keyword if it is truthful for your experience. The
            tailoring step is told not to invent skills.
          </p>

          <Button
            className="mt-4 w-full"
            onClick={tailor}
            disabled={tailoring || applying || !consentGranted}
          >
            {tailoring ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {tailoring ? "Tailoring…" : "Tailor my resume"}
          </Button>
          <p className="mt-1 text-center text-xs text-stone-400">
            Uses 1 AI action
          </p>
        </div>
      ) : null}

      {suggestions ? (
        <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
          <h3 className="text-sm font-semibold text-stone-900">
            Review suggestions
          </h3>
          <p className="mt-1 text-xs text-stone-500">
            Only selected items will replace your current text.
          </p>

          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3">
            <input
              type="checkbox"
              checked={selectedSummary}
              onChange={(event) => setSelectedSummary(event.target.checked)}
              className="mt-1 h-4 w-4 rounded border-stone-300 text-[var(--accent)]"
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Summary
              </p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg bg-stone-50 p-2">
                  <p className="text-[11px] font-medium text-stone-400">Original</p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-600">
                    {suggestions.summary.original || "(empty)"}
                  </p>
                </div>
                <div className="rounded-lg bg-teal-50 p-2">
                  <p className="text-[11px] font-medium text-[var(--accent)]">
                    Suggested
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-stone-800">
                    {suggestions.summary.suggested}
                  </p>
                </div>
              </div>
            </div>
          </label>

          {suggestions.bullets.map((bullet) => (
            <label
              key={bullet.id}
              className="mt-2 flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3"
            >
              <input
                type="checkbox"
                checked={selectedBullets.has(bullet.id)}
                onChange={() => toggleBullet(bullet.id)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-[var(--accent)]"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                  Bullet
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-stone-50 p-2">
                    <p className="text-[11px] font-medium text-stone-400">
                      Original
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-600">
                      {bullet.original}
                    </p>
                  </div>
                  <div className="rounded-lg bg-teal-50 p-2">
                    <p className="text-[11px] font-medium text-[var(--accent)]">
                      Suggested
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-stone-800">
                      {bullet.suggested}
                    </p>
                  </div>
                </div>
              </div>
            </label>
          ))}

          <Button
            className="mt-4 w-full"
            onClick={apply}
            disabled={applying || (!selectedSummary && selectedBullets.size === 0)}
          >
            {applying ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            {applying ? "Applying…" : "Apply selected"}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
