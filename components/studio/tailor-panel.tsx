"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCheck,
  CircleDashed,
  ClipboardPaste,
  Loader2,
  Sparkles,
  Target,
  WandSparkles,
} from "lucide-react";
import { useDemoStore } from "@/components/app/demo-store";
import { useToast } from "@/components/ui/toast";
import { DEMO_JOB_DESCRIPTION } from "@/lib/demo/seed";
import {
  analyzeJobMock,
  buildTailorSuggestions,
  extractJobMeta,
  tailorMatchLabel,
} from "@/lib/demo/tailoring";
import type {
  DemoResume,
  TailorKeyword,
  TailorSuggestion,
} from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./panel-header";

type Phase =
  | "input"
  | "analyzing"
  | "keywords"
  | "tailoring"
  | "review"
  | "applied";

type Analysis = {
  keywords: TailorKeyword[];
  found: number;
  missing: number;
  matchPercent: number;
};

export function TailorPanel({
  resume,
  active,
  onUpdate,
}: {
  resume: DemoResume;
  active: boolean;
  onUpdate: (updater: (resume: DemoResume) => DemoResume) => void;
}) {
  const { profile, consumeAI } = useDemoStore();
  const { toast } = useToast();
  const [phase, setPhase] = useState<Phase>("input");
  const [jobDescription, setJobDescription] = useState(DEMO_JOB_DESCRIPTION);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [suggestions, setSuggestions] = useState<TailorSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const remaining = Math.max(0, profile.aiIncluded - profile.aiUsed);

  useEffect(
    () => () => {
      timers.current.forEach((timer) => clearTimeout(timer));
    },
    [],
  );

  function later(callback: () => void, delay: number) {
    const timer = setTimeout(callback, delay);
    timers.current.push(timer);
    return timer;
  }

  function canSpend() {
    if (remaining <= 0) {
      toast("No AI actions left in this demo. Reset it from Settings.", "error");
      return false;
    }
    return true;
  }

  function analyze() {
    if (jobDescription.trim().length < 60) {
      toast("Paste a little more of the job description first.", "error");
      return;
    }
    if (!canSpend()) return;

    setPhase("analyzing");
    setSuggestions([]);
    setAnalysis(null);

    later(() => {
      const result = analyzeJobMock(resume, jobDescription);
      setAnalysis(result);
      setPhase("keywords");
      consumeAI(1);
      toast("The role is analyzed. Review the gaps next.", "success");
    }, 1200);
  }

  function draftChanges() {
    if (!canSpend()) return;
    setPhase("tailoring");
    later(() => {
      const next = buildTailorSuggestions(resume, jobDescription);
      setSuggestions(next);
      setSelected(new Set(next.map((item) => item.id)));
      setPhase("review");
      consumeAI(1);
      toast("Tailored changes are ready for review.", "success");
    }, 1250);
  }

  function editJob() {
    setPhase("input");
    setAnalysis(null);
    setSuggestions([]);
    setSelected(new Set());
  }

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function applySelected() {
    if (selected.size === 0) {
      toast("Choose at least one suggestion to apply.", "error");
      return;
    }

    const { role, company } = extractJobMeta(jobDescription);
    const summarySuggestion = suggestions.find(
      (item) => item.id === "tailor-summary" && selected.has(item.id),
    );
    const bulletSuggestions = suggestions.filter(
      (item) =>
        item.kind === "bullet" &&
        selected.has(item.id) &&
        item.experienceId !== undefined &&
        item.bulletIndex !== undefined,
    );

    onUpdate((current) => {
      let nextContent = current.content;
      if (summarySuggestion) {
        nextContent = {
          ...nextContent,
          summary: summarySuggestion.suggested,
        };
      }

      if (bulletSuggestions.length > 0) {
        nextContent = {
          ...nextContent,
          experience: nextContent.experience.map((entry) => {
            const matches = bulletSuggestions.filter(
              (item) => item.experienceId === entry.id,
            );
            if (matches.length === 0) return entry;
            return {
              ...entry,
              bullets: entry.bullets.map((bullet, index) => {
                const match = matches.find(
                  (item) => item.bulletIndex === index,
                );
                return match ? match.suggested : bullet;
              }),
            };
          }),
        };
      }

      return {
        ...current,
        targetRole: role || current.targetRole,
        content: nextContent,
        lastTailoredFor: {
          role: role || current.targetRole,
          company,
          matchedAt: new Date().toISOString(),
        },
      };
    });

    setPhase("applied");
    toast(
      `${selected.size} change${selected.size === 1 ? "" : "s"} applied to your resume.`,
      "success",
    );
  }

  const showResults = phase === "review" || phase === "applied";
  const meta = extractJobMeta(jobDescription);
  const values = analysis;

  return (
    <section className="studio-panel tailor-panel" hidden={!active}>
      <div className="studio-panel-scroll">
        <PanelHeader
          eyebrow="Close the gap"
          title="Make it about this role."
          description="Paste a job description. See the language you share, the gaps worth closing, and every change before it lands."
          aside={
            <span className="ai-action-chip">
              <Sparkles size={12} aria-hidden="true" />
              {remaining} actions
            </span>
          }
        />

        <div className="tailor-demo-note">
          <span>
            <Target size={15} aria-hidden="true" />
          </span>
          <p>
            <strong>Local tailoring simulation.</strong> Keyword matching and
            suggestions are generated in this browser. Nothing is sent anywhere.
          </p>
        </div>

        <div className="tailor-stepbar" aria-label="Tailoring progress">
          <span className="is-current">
            <i>01</i> Analyze
          </span>
          <b aria-hidden="true" />
          <span
            className={cn(
              phase === "tailoring" || showResults ? "is-current" : "",
            )}
          >
            <i>02</i> Review
          </span>
          <b aria-hidden="true" />
          <span className={phase === "applied" ? "is-current" : ""}>
            <i>03</i> Apply
          </span>
        </div>

        {phase === "input" ? (
          <div className="tailor-section">
            <div className="tailor-input-head">
              <label htmlFor="job-description">Job description</label>
              <span>Up to 10,000 characters</span>
            </div>
            <div className="tailor-textarea-wrap">
              <textarea
                id="job-description"
                className="app-input tailor-textarea"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={12}
                maxLength={10_000}
                placeholder="Paste the role here. Responsibilities, requirements, the language the team uses — all of it helps."
              />
              <div className="tailor-textarea-meta">
                <span>{jobDescription.length.toLocaleString()} characters</span>
                <button
                  type="button"
                  onClick={() => setJobDescription(DEMO_JOB_DESCRIPTION)}
                >
                  <ClipboardPaste size={13} aria-hidden="true" />
                  Use sample role
                </button>
              </div>
            </div>

            <div className="tailor-job-preview">
              <span className="tailor-job-icon">
                <Target size={16} aria-hidden="true" />
              </span>
              <div>
                <strong>{meta.role}</strong>
                <span>{meta.company}</span>
              </div>
              <span className="tailor-local-pill">Demo role</span>
            </div>

            <button
              type="button"
              className="app-btn app-btn--primary tailor-primary-action"
              onClick={analyze}
            >
              <Sparkles size={15} aria-hidden="true" />
              Analyze this role
              <span className="btn-cost">1 action</span>
            </button>
            <p className="tailor-action-note">
              We&apos;ll surface ten keywords and mark which ones already live
              on your resume.
            </p>
          </div>
        ) : null}

        {phase === "analyzing" ? (
          <div className="tailor-loading-card" aria-live="polite">
            <span className="tailor-loading-orbit" aria-hidden="true">
              <Loader2 size={24} className="is-spinning" />
            </span>
            <h2>Reading the role.</h2>
            <p>Finding the words that carry the most weight.</p>
            <div className="tailor-loading-lines" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>
        ) : null}

        {values && (phase === "keywords" || phase === "tailoring") ? (
          <div className="tailor-analysis">
            <div className="tailor-match-card">
              <div className="tailor-match-score">
                <strong>{values.matchPercent}%</strong>
                <span>language match</span>
              </div>
              <div className="tailor-match-copy">
                <span>{tailorMatchLabel(values.matchPercent)}</span>
                <h2>
                  {values.found} of {values.keywords.length} keywords are
                  already on the page.
                </h2>
                <div className="tailor-match-bar" aria-hidden="true">
                  <span style={{ width: `${values.matchPercent}%` }} />
                </div>
              </div>
            </div>

            <div className="tailor-keywords-head">
              <h3>Role language</h3>
              <span>
                <i className="is-found" /> In your resume
                <i className="is-missing" /> Worth adding
              </span>
            </div>
            <div className="tailor-keywords">
              {values.keywords.map((keyword) => (
                <span
                  key={keyword.term}
                  className={cn(
                    "tailor-keyword",
                    keyword.found ? "is-found" : "is-missing",
                  )}
                >
                  {keyword.found ? (
                    <Check size={11} aria-hidden="true" />
                  ) : (
                    <CircleDashed size={11} aria-hidden="true" />
                  )}
                  {keyword.term}
                </span>
              ))}
            </div>

            <div className="tailor-gaps">
              <div className="tailor-gaps-head">
                <span>
                  <Target size={14} aria-hidden="true" />
                  Strongest gaps
                </span>
                <small>{values.missing} to consider</small>
              </div>
              <ul>
                {values.keywords
                  .filter((keyword) => !keyword.found)
                  .slice(0, 3)
                  .map((keyword) => (
                    <li key={keyword.term}>
                      <span>{keyword.term}</span>
                      <small>{keyword.importance}</small>
                    </li>
                  ))}
              </ul>
              <p>
                Gaps are not instructions to invent experience. Use them to
                notice what you may have forgotten to say.
              </p>
            </div>

            {phase === "tailoring" ? (
              <div className="tailor-tailoring">
                <Loader2 size={20} className="is-spinning" aria-hidden="true" />
                <div>
                  <strong>Drafting three reviewable edits</strong>
                  <span>A summary and two existing highlights.</span>
                </div>
              </div>
            ) : (
              <div className="tailor-actions">
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={draftChanges}
                >
                  <WandSparkles size={15} aria-hidden="true" />
                  Draft tailored changes
                  <span className="btn-cost">1 action</span>
                </button>
                <button
                  type="button"
                  className="app-btn app-btn--quiet"
                  onClick={editJob}
                >
                  <ArrowLeft size={14} aria-hidden="true" />
                  Edit job
                </button>
              </div>
            )}
            <p className="tailor-action-note">
              Applying changes is free. You choose every edit.
            </p>
          </div>
        ) : null}

        {showResults ? (
          <div className="tailor-review">
            {phase === "applied" ? (
              <div className="tailor-success-banner" role="status">
                <span>
                  <CheckCheck size={18} aria-hidden="true" />
                </span>
                <div>
                  <strong>Applied to your resume.</strong>
                  <p>
                    Made for {meta.role} at {meta.company}. Review the page on
                    the right before exporting.
                  </p>
                </div>
              </div>
            ) : (
              <div className="tailor-review-head">
                <span className="tailor-review-icon">
                  <Sparkles size={16} aria-hidden="true" />
                </span>
                <div>
                  <h2>Three edits, yours to choose.</h2>
                  <p>
                    Each suggestion keeps the facts of the original. Review
                    before applying.
                  </p>
                </div>
              </div>
            )}

            <div className="tailor-suggestion-list">
              {suggestions.map((suggestion) => {
                const checked = selected.has(suggestion.id);
                return (
                  <article
                    key={suggestion.id}
                    className={cn(
                      "tailor-suggestion",
                      checked && "is-selected",
                      phase === "applied" && "is-applied",
                    )}
                  >
                    <label className="tailor-suggestion-check">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={phase === "applied"}
                        onChange={() => toggle(suggestion.id)}
                      />
                      <span className="app-check-box" aria-hidden="true">
                        <Check size={11} />
                      </span>
                      <span>
                        {suggestion.kind === "summary"
                          ? "Summary"
                          : "Highlight"}
                        <small>{suggestion.section}</small>
                      </span>
                    </label>
                    <div className="tailor-suggestion-compare">
                      <div>
                        <span>Before</span>
                        <p>{suggestion.original}</p>
                      </div>
                      <ArrowRight size={14} aria-hidden="true" />
                      <div className="is-suggested">
                        <span>After</span>
                        <p>{suggestion.suggested}</p>
                      </div>
                    </div>
                    <p className="tailor-suggestion-reason">
                      <WandSparkles size={12} aria-hidden="true" />
                      {suggestion.reason}
                    </p>
                  </article>
                );
              })}
            </div>

            {phase === "review" ? (
              <div className="tailor-apply-row">
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={applySelected}
                  disabled={selected.size === 0}
                >
                  <Check size={15} aria-hidden="true" />
                  Apply {selected.size} selected
                </button>
                <button type="button" className="app-btn app-btn--quiet" onClick={editJob}>
                  Start over
                </button>
              </div>
            ) : (
              <div className="tailor-applied-actions">
                <button type="button" className="app-btn app-btn--soft" onClick={editJob}>
                  <Target size={14} aria-hidden="true" />
                  Tailor another role
                </button>
                <span>
                  <Check size={12} aria-hidden="true" />
                  Saved locally
                </span>
              </div>
            )}
          </div>
        ) : null}

        <div className="tailor-panel-footer">
          <span>
            <Sparkles size={13} aria-hidden="true" />
            Smart language, human judgment.
          </span>
          <span>2 actions for a full run</span>
        </div>
      </div>
    </section>
  );
}
