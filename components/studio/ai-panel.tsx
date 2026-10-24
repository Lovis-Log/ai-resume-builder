"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Loader2,
  Sparkles,
  WandSparkles,
  X,
} from "lucide-react";
import { useDemoStore } from "@/components/app/demo-store";
import { useToast } from "@/components/ui/toast";
import {
  AI_SUMMARY_STYLES,
  mockImprovedBullet,
  mockSummary,
  type AiSummaryStyle,
} from "@/lib/demo/ai";
import type { DemoResume } from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./panel-header";
import type { AiPanelFocus } from "./studio-types";

type Mode = "summary" | "bullets";

function LoadingLines({ count = 3 }: { count?: number }) {
  return (
    <div className="ai-loading" aria-label="Drafting a suggestion">
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="ai-loading-line"
          style={{ width: `${100 - index * 13}%` }}
        />
      ))}
      <span className="ai-loading-note">
        <Loader2 size={13} className="is-spinning" aria-hidden="true" />
        Finding a clearer way to say it…
      </span>
    </div>
  );
}

export function AiPanel({
  resume,
  active,
  focus,
  onUpdate,
  onGoWrite,
}: {
  resume: DemoResume;
  active: boolean;
  focus: AiPanelFocus;
  onUpdate: (updater: (resume: DemoResume) => DemoResume) => void;
  onGoWrite: () => void;
}) {
  const { profile, consumeAI } = useDemoStore();
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("summary");
  const [style, setStyle] = useState<AiSummaryStyle>("measured");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState<string | null>(null);
  const [selectedBulletKey, setSelectedBulletKey] = useState<string>("");
  const [bulletLoading, setBulletLoading] = useState(false);
  const [bulletDraft, setBulletDraft] = useState<string | null>(null);
  const [bulletDraftKey, setBulletDraftKey] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const remaining = Math.max(0, profile.aiIncluded - profile.aiUsed);

  const bulletOptions = useMemo(
    () =>
      resume.content.experience.flatMap((entry) =>
        entry.bullets
          .map((bullet, index) => ({
            key: `${entry.id}:${index}`,
            experienceId: entry.id,
            index,
            bullet,
            label: `${entry.company || entry.title || "Role"} — ${
              bullet.trim().slice(0, 48) ||
              `bullet ${index + 1}`
            }${bullet.trim().length > 48 ? "…" : ""}`,
          }))
          .filter((option) => option.bullet.trim()),
      ),
    [resume.content.experience],
  );

  const effectiveBulletKey = bulletOptions.some(
    (option) => option.key === selectedBulletKey,
  )
    ? selectedBulletKey
    : (bulletOptions[0]?.key ?? "");

  const selectedBullet =
    bulletOptions.find((option) => option.key === effectiveBulletKey) ?? null;

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

  const generateSummary = useCallback(
    (nextStyle = style) => {
      if (!canSpend()) return;
      setSummaryLoading(true);
      setSummaryDraft(null);
      later(() => {
        setSummaryLoading(false);
        setSummaryDraft(mockSummary(resume, nextStyle));
        consumeAI(1);
        toast("A suggestion is ready. Review it before you apply.", "success");
      }, 950);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [style, resume, remaining, consumeAI],
  );

  const generateBullet = useCallback(
    (key = effectiveBulletKey) => {
      const option = bulletOptions.find((item) => item.key === key);
      if (!option) {
        toast("Add a highlight to your experience first.", "error");
        return;
      }
      if (!canSpend()) return;
      setSelectedBulletKey(key);
      setBulletLoading(true);
      setBulletDraft(null);
      setBulletDraftKey(key);
      const entry = resume.content.experience.find(
        (item) => item.id === option.experienceId,
      );
      later(() => {
        setBulletLoading(false);
        setBulletDraft(
          mockImprovedBullet(
            option.bullet,
            entry?.title ?? "",
            entry?.company ?? "",
          ),
        );
        consumeAI(1);
        toast("A sharper line is ready for your review.", "success");
      }, 900);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [effectiveBulletKey, bulletOptions, resume, remaining, consumeAI],
  );

  useEffect(() => {
    if (!active || !focus) return;

    // The parent hands the panel a one-shot focus request when a write-panel
    // action is clicked. Applying it on the next frame lets the panel become
    // visible before we change its local tab and start the request.
    const focusTimer = window.setTimeout(() => {
      if (focus.kind === "summary") {
        setMode("summary");
        return;
      }

      setMode("bullets");
      const key = `${focus.experienceId}:${focus.bulletIndex}`;
      setSelectedBulletKey(key);
      if (bulletOptions.some((option) => option.key === key) && remaining > 0) {
        later(() => {
          generateBullet(key);
        }, 180);
      }
    }, 0);

    return () => window.clearTimeout(focusTimer);
    // Focus is a one-shot request; re-generating on every resume edit would
    // consume actions without another click.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focus?.nonce, active]);

  function useSummary() {
    if (!summaryDraft) return;
    onUpdate((current) => ({
      ...current,
      content: { ...current.content, summary: summaryDraft },
    }));
    setSummaryDraft(null);
    toast("Summary updated.", "success");
  }

  function useBullet() {
    if (!bulletDraft || !bulletDraftKey) return;
    const [experienceId, rawIndex] = bulletDraftKey.split(":");
    const index = Number(rawIndex);
    onUpdate((current) => ({
      ...current,
      content: {
        ...current.content,
        experience: current.content.experience.map((entry) =>
          entry.id === experienceId
            ? {
                ...entry,
                bullets: entry.bullets.map((bullet, bulletIndex) =>
                  bulletIndex === index ? bulletDraft : bullet,
                ),
              }
            : entry,
        ),
      },
    }));
    setBulletDraft(null);
    setBulletDraftKey(null);
    toast("Highlight updated.", "success");
  }

  const activeStyle =
    AI_SUMMARY_STYLES.find((item) => item.id === style) ??
    AI_SUMMARY_STYLES[0];

  return (
    <section className="studio-panel ai-panel" hidden={!active}>
      <div className="studio-panel-scroll">
        <PanelHeader
          eyebrow="A quieter writing partner"
          title="Find the better sentence."
          description="Shape a summary or sharpen one line. Nothing is applied until you say so."
          aside={
            <span className="ai-action-chip">
              <Sparkles size={12} aria-hidden="true" />
              {remaining} actions
            </span>
          }
        />

        <div className="ai-demo-note">
          <span className="ai-demo-orb" aria-hidden="true">
            <WandSparkles size={15} />
          </span>
          <p>
            <strong>Simulated locally for this demo.</strong>
            The suggestions are pre-written. Nothing leaves your browser.
          </p>
        </div>

        <div className="ai-mode-tabs" role="tablist" aria-label="AI writing mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "summary"}
            className={mode === "summary" ? "is-active" : ""}
            onClick={() => setMode("summary")}
          >
            Summary
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "bullets"}
            className={mode === "bullets" ? "is-active" : ""}
            onClick={() => setMode("bullets")}
          >
            One line
          </button>
        </div>

        {mode === "summary" ? (
          <div className="ai-workspace">
            <div className="ai-intro-block">
              <span className="ai-intro-icon">
                <Sparkles size={16} aria-hidden="true" />
              </span>
              <div>
                <h2>A stronger opening</h2>
                <p>
                  Choose the tone. The draft uses only what is already on your
                  resume.
                </p>
              </div>
            </div>

            <div className="ai-style-grid" role="group" aria-label="Summary tone">
              {AI_SUMMARY_STYLES.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={cn(
                    "ai-style-option",
                    style === item.id && "is-selected",
                  )}
                  onClick={() => {
                    setStyle(item.id);
                    if (summaryDraft) setSummaryDraft(null);
                  }}
                  aria-pressed={style === item.id}
                >
                  <span>{item.label}</span>
                  {style === item.id ? <Check size={12} aria-hidden="true" /> : null}
                </button>
              ))}
            </div>
            <p className="ai-style-caption">{activeStyle.description}</p>

            {summaryLoading ? (
              <LoadingLines count={4} />
            ) : summaryDraft ? (
              <div className="ai-result">
                <div className="ai-result-head">
                  <span>
                    <Sparkles size={14} aria-hidden="true" />
                    Suggested summary
                  </span>
                  <span className="ai-local-label">Demo</span>
                </div>
                <div className="ai-compare">
                  <div className="ai-compare-block">
                    <span>Before</span>
                    <p>
                      {resume.content.summary ||
                        "No summary yet — this will add a new opening."}
                    </p>
                  </div>
                  <div className="ai-compare-block is-suggested">
                    <span>After</span>
                    <p>{summaryDraft}</p>
                  </div>
                </div>
                <div className="ai-result-actions">
                  <button
                    type="button"
                    className="app-btn app-btn--primary app-btn--sm"
                    onClick={useSummary}
                  >
                    <Check size={14} aria-hidden="true" />
                    Use this summary
                  </button>
                  <button
                    type="button"
                    className="app-btn app-btn--quiet app-btn--sm"
                    onClick={() => generateSummary()}
                    disabled={summaryLoading}
                  >
                    <Sparkles size={13} aria-hidden="true" />
                    Try another
                  </button>
                </div>
                <p className="ai-source-note">
                  Uses your roles and notes. No invented employers, dates, or
                  metrics.
                </p>
              </div>
            ) : (
              <div className="ai-empty-state">
                <span className="ai-empty-glyph" aria-hidden="true">
                  <Sparkles size={22} />
                </span>
                <h3>Give your opening a little air.</h3>
                <p>
                  A short, specific first paragraph can make the rest of the
                  page easier to enter.
                </p>
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={() => generateSummary()}
                >
                  <Sparkles size={15} aria-hidden="true" />
                  Draft a summary
                  <span className="btn-cost">1 action</span>
                </button>
              </div>
            )}

            <div className="ai-write-hint">
              <span>Prefer to write it yourself?</span>
              <button type="button" onClick={onGoWrite}>
                Go to the summary field
                <ArrowRight size={13} aria-hidden="true" />
              </button>
            </div>
          </div>
        ) : (
          <div className="ai-workspace">
            <div className="ai-intro-block">
              <span className="ai-intro-icon ai-intro-icon--violet">
                <WandSparkles size={16} aria-hidden="true" />
              </span>
              <div>
                <h2>Make one line earn its place</h2>
                <p>
                  Pick a highlight. Lume will keep the facts and tighten the
                  shape.
                </p>
              </div>
            </div>

            {bulletOptions.length === 0 ? (
              <div className="ai-empty-state">
                <span className="ai-empty-glyph" aria-hidden="true">
                  <WandSparkles size={22} />
                </span>
                <h3>There isn&apos;t a line to shape yet.</h3>
                <p>Add a highlight to your experience, then come back.</p>
                <button type="button" className="app-btn app-btn--soft" onClick={onGoWrite}>
                  <ArrowRight size={14} aria-hidden="true" />
                  Go to experience
                </button>
              </div>
            ) : (
              <>
                <label className="app-field ai-bullet-select">
                  <span className="app-field-label">Choose a highlight</span>
                  <select
                    className="app-input"
                    value={effectiveBulletKey}
                    onChange={(event) => {
                      setSelectedBulletKey(event.target.value);
                      setBulletDraft(null);
                      setBulletDraftKey(null);
                    }}
                  >
                    {bulletOptions.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedBullet ? (
                  <div className="ai-original-line">
                    <span>Original</span>
                    <p>{selectedBullet.bullet}</p>
                  </div>
                ) : null}

                {bulletLoading ? (
                  <LoadingLines count={2} />
                ) : bulletDraft ? (
                  <div className="ai-result">
                    <div className="ai-result-head">
                      <span>
                        <Sparkles size={14} aria-hidden="true" />
                        A sharper version
                      </span>
                      <span className="ai-local-label">Demo</span>
                    </div>
                    <div className="ai-compare ai-compare--bullets">
                      <div className="ai-compare-block is-suggested">
                        <span>Suggested</span>
                        <p>{bulletDraft}</p>
                      </div>
                    </div>
                    <div className="ai-result-actions">
                      <button
                        type="button"
                        className="app-btn app-btn--primary app-btn--sm"
                        onClick={useBullet}
                      >
                        <Check size={14} aria-hidden="true" />
                        Apply this line
                      </button>
                      <button
                        type="button"
                        className="app-btn app-btn--quiet app-btn--sm"
                        onClick={() => generateBullet(effectiveBulletKey)}
                      >
                        <Sparkles size={13} aria-hidden="true" />
                        Try another
                      </button>
                    </div>
                    <p className="ai-source-note">
                      Original facts kept. The phrasing is a local simulation.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="app-btn app-btn--primary ai-improve-button"
                    onClick={() => generateBullet(effectiveBulletKey)}
                  >
                    <Sparkles size={15} aria-hidden="true" />
                    Improve this line
                    <span className="btn-cost">1 action</span>
                  </button>
                )}

                <div className="ai-bullet-tips">
                  <X size={13} aria-hidden="true" />
                  <span>
                    Avoid adding metrics, tools, or responsibilities that are
                    not already true.
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="ai-panel-footer">
          <WandSparkles size={14} aria-hidden="true" />
          <span>
            This prototype never calls a model. Results are deterministic so
            you can explore the full review flow.
          </span>
        </div>
      </div>
    </section>
  );
}
