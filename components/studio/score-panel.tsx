"use client";

import { useMemo } from "react";
import {
  ArrowUpRight,
  Check,
  CircleAlert,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ScoreRing } from "@/components/app/atoms";
import { computeResumeScore } from "@/lib/score/studio";
import type { ResumeRecord } from "@/lib/resume/types";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./panel-header";
import type { StudioSection } from "./studio-types";

export function ScorePanel({
  resume,
  active,
  pageCount,
  onFix,
  onPreview,
}: {
  resume: ResumeRecord;
  active: boolean;
  pageCount: number;
  onFix: (section: StudioSection) => void;
  onPreview: () => void;
}) {
  const result = useMemo(
    () => computeResumeScore(resume.content, pageCount),
    [resume.content, pageCount],
  );

  function fix(target: string) {
    if (target === "preview") {
      onPreview();
      return;
    }
    onFix(target as StudioSection);
  }

  return (
    <section className="studio-panel score-panel" hidden={!active}>
      <div className="studio-panel-scroll">
        <PanelHeader
          eyebrow="A second read"
          title="How strong is this page?"
          description="Ten quiet checks, run instantly. No AI, no action cost, no guessing."
        />

        <div className="score-hero">
          <div className="score-hero-main">
            <ScoreRing score={result.score} size={96} strokeWidth={7} />
            <div>
              <span className="score-hero-label">
                <ShieldCheck size={14} aria-hidden="true" />
                Resume score
              </span>
              <h2>{result.label}</h2>
              <p>
                {result.passed} of {result.total} checks pass. The page is{" "}
                {pageCount} page{pageCount === 1 ? "" : "s"} long.
              </p>
            </div>
          </div>
          <div className="score-hero-meta">
            <span>
              <Sparkles size={13} aria-hidden="true" />
              Free forever
            </span>
            <span>Updates as you type</span>
          </div>
        </div>

        <div className="score-checks-head">
          <h2>The ten checks</h2>
          <span>
            <Check size={12} aria-hidden="true" />
            {result.passed} passing
          </span>
        </div>

        <div className="score-check-list">
          {result.checks.map((check, index) => (
            <article
              className={cn(
                "score-check",
                check.passed ? "is-passing" : "is-failing",
              )}
              key={check.id}
            >
              <span className="score-check-number">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="score-check-status" aria-hidden="true">
                {check.passed ? <Check size={13} /> : <CircleAlert size={14} />}
              </span>
              <div className="score-check-copy">
                <h3>{check.label}</h3>
                <p>{check.hint}</p>
              </div>
              {!check.passed ? (
                <button
                  type="button"
                  className="score-fix-button"
                  onClick={() => fix(check.fixTarget)}
                >
                  Fix
                  <ArrowUpRight size={12} aria-hidden="true" />
                </button>
              ) : (
                <span className="score-check-pass-label">Good</span>
              )}
            </article>
          ))}
        </div>

        <div className="score-footnote">
          <span className="score-footnote-icon">
            <ShieldCheck size={16} aria-hidden="true" />
          </span>
          <div>
            <strong>The score is a starting point, not a verdict.</strong>
            <p>
              A clear, honest page can still be the strongest one in the pile.
              Use these checks to remove friction, not personality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
