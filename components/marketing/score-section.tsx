import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type { ScoreResult } from "@/lib/score/compute";

const RING_RADIUS = 46;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function scoreLabel(score: number) {
  if (score >= 80) return "Strong";
  if (score >= 60) return "Getting there";
  return "Needs work";
}

export function ScoreSection({ result }: { result: ScoreResult }) {
  const failed = result.checks.filter((check) => !check.passed);
  const offset = RING_CIRCUMFERENCE * (1 - result.score / 100);

  return (
    <section className="section score-section" id="score">
      <div className="container score-grid">
        <div className="score-copy" data-reveal>
          <p className="eyebrow">
            <span />
            The free part
          </p>
          <h2 className="section-title">
            Ten checks. <span className="soft">One honest score.</span>
          </h2>
          <p className="section-sub">
            A rule-based checklist, not a black box. It looks for what recruiters
            and parsers actually care about — contact details, bullets, numbers,
            dates, length, pronouns. Every failure points to the field that fixes
            it.
          </p>

          <ul className="spotlight-points">
            <li>
              <span>
                <Check aria-hidden="true" />
              </span>
              Updates as you type, before you spend an AI action.
            </li>
            <li>
              <span>
                <Check aria-hidden="true" />
              </span>
              Ten pass/fail checks, ten points each.
            </li>
            <li>
              <span>
                <Check aria-hidden="true" />
              </span>
              “Fix” jumps straight to the relevant field.
            </li>
          </ul>

          <Link href="/dashboard" className="text-link">
            Get my free score
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <p className="spotlight-note">
            The score checks structure, not whether the job is a fit.
          </p>
        </div>

        <div className="score-card" data-reveal>
          <div className="score-card-head">
            <div>
              <p className="score-card-kicker">
                <ShieldCheck aria-hidden="true" />
                Sample resume
              </p>
              <p className="score-card-sub">
                {result.passed} of {result.total} checks pass · {scoreLabel(result.score)}
              </p>
            </div>
            <span className="score-free-badge">Free · no AI</span>
          </div>

          <div className="score-summary">
            <div className="score-ring-wrap">
              <svg viewBox="0 0 120 120" className="score-ring" aria-hidden="true">
                <defs>
                  <linearGradient id="score-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#6665ad" />
                    <stop offset="100%" stopColor="#9b8fe0" />
                  </linearGradient>
                </defs>
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="#ebeaf5"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  fill="none"
                  stroke="url(#score-ring-gradient)"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={offset}
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="score-ring-label">
                <strong>{result.score}</strong>
                <span>/100</span>
              </div>
            </div>

            <div className="score-summary-copy">
              <p>
                {failed.length} check{failed.length === 1 ? "" : "s"}{" "}
                need{failed.length === 1 ? "s" : ""} attention.
              </p>
              <span>
                The score is live in the editor. Fixing one item re-runs every
                check instantly.
              </span>
              <div className="score-progress">
                <span style={{ width: `${result.score}%` }} />
              </div>
            </div>
          </div>

          <ul className="score-check-list">
            {result.checks.map((check) => (
              <li
                key={check.id}
                className={check.passed ? "passed" : "failed"}
              >
                {check.passed ? (
                  <CheckCircle2 aria-hidden="true" />
                ) : (
                  <XCircle aria-hidden="true" />
                )}
                <div>
                  <p>{check.label}</p>
                  <span>{check.detail}</span>
                </div>
                {check.passed ? null : <em>Fix</em>}
              </li>
            ))}
          </ul>

          <p className="score-card-foot">
            {failed.length} item{failed.length === 1 ? "" : "s"} flagged on this
            sample. Nothing is sent anywhere to run the score.
          </p>
        </div>
      </div>
    </section>
  );
}
