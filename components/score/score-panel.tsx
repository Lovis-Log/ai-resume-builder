"use client";

import { useMemo } from "react";
import { ArrowUpRight, CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { computeScore } from "@/lib/score/compute";
import type { ResumeContent } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

function scoreLabel(score: number) {
  if (score >= 80) return { label: "Strong", tone: "text-green-700" };
  if (score >= 60) return { label: "Getting there", tone: "text-amber-700" };
  return { label: "Needs work", tone: "text-red-700" };
}

export function ScorePanel({
  content,
  pageCount,
  onRequestPreview,
}: {
  content: ResumeContent;
  pageCount: number;
  onRequestPreview?: () => void;
}) {
  const result = useMemo(
    () => computeScore(content, pageCount),
    [content, pageCount],
  );
  const status = scoreLabel(result.score);

  function fix(target: string) {
    if (target === "#preview") {
      onRequestPreview?.();
      return;
    }

    const element = document.querySelector(target);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    const field = element.querySelector(
      "input, textarea, select, button",
    ) as HTMLElement | null;
    window.setTimeout(() => field?.focus(), 350);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[var(--border)] bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-stone-500">
              <ShieldCheck className="h-4 w-4 text-[var(--accent)]" />
              Resume score
            </div>
            <p className="mt-2">
              <span className="text-4xl font-semibold text-stone-900">
                {result.score}
              </span>
              <span className="text-sm text-stone-400"> / 100</span>
            </p>
            <p className={cn("mt-1 text-sm font-medium", status.tone)}>
              {status.label} · {result.passed} of {result.total} checks pass
            </p>
          </div>
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full border-4 text-sm font-semibold",
              result.score >= 80 &&
                "border-green-500 bg-green-50 text-green-700",
              result.score >= 60 &&
                result.score < 80 &&
                "border-amber-500 bg-amber-50 text-amber-700",
              result.score < 60 && "border-red-500 bg-red-50 text-red-700",
            )}
          >
            {result.score}%
          </div>
        </div>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-stone-100">
          <div
            className={cn(
              "h-full rounded-full transition-all",
              result.score >= 80 && "bg-green-500",
              result.score >= 60 && result.score < 80 && "bg-amber-500",
              result.score < 60 && "bg-red-500",
            )}
            style={{ width: `${result.score}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-stone-500">
          Free, no AI. Updates as you type. Page count is estimated from the live
          preview.
        </p>
      </div>

      <div className="space-y-2">
        {result.checks.map((check) => (
          <div
            key={check.id}
            className={cn(
              "rounded-xl border p-3",
              check.passed
                ? "border-green-100 bg-green-50/50"
                : "border-amber-100 bg-amber-50/50",
            )}
          >
            <div className="flex items-start gap-2">
              {check.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
              )}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-stone-900">
                  {check.label}
                </p>
                <p className="mt-0.5 text-xs text-stone-600">{check.detail}</p>
              </div>
              {!check.passed ? (
                <button
                  type="button"
                  onClick={() => fix(check.fixTarget)}
                  className="flex flex-none items-center gap-0.5 text-xs font-medium text-[var(--accent)] hover:underline"
                >
                  Fix
                  <ArrowUpRight className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
