import type { CSSProperties } from "react";
import { ShieldCheck } from "lucide-react";
import type { TemplateId } from "@/lib/demo/types";

export function ScoreRing({
  score,
  size = 64,
  strokeWidth = 5,
  showLabel = true,
  tone,
  label,
}: {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  tone?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    tone ??
    (clamped >= 85
      ? "var(--app-primary)"
      : clamped >= 60
        ? "#b07b38"
        : "#bc6a62");

  return (
    <span
      className="app-score-ring"
      style={
        {
          width: size,
          height: size,
          "--ring-color": color,
        } as CSSProperties
      }
      role="img"
      aria-label={`${label ?? "Resume score"}: ${clamped} out of 100`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          className="app-score-ring-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
        />
        <circle
          className="app-score-ring-value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {showLabel ? (
        <span className="app-score-ring-label" style={{ fontSize: size * 0.28 }}>
          {clamped}
        </span>
      ) : null}
    </span>
  );
}

export function ScorePill({ score }: { score: number }) {
  return (
    <span className="app-score-pill">
      <ShieldCheck size={13} aria-hidden="true" />
      {score}
      <span>/100</span>
    </span>
  );
}

export function TemplateMini({
  template = "modern",
  accent = "#416af5",
  className = "",
}: {
  template?: TemplateId;
  accent?: string;
  className?: string;
}) {
  return (
    <div
      className={`template-mini template-mini--${template} ${className}`.trim()}
      style={{ "--mini-accent": accent } as CSSProperties}
      aria-hidden="true"
    >
      <div className="template-mini-sheet">
        <span className="template-mini-name" />
        <span className="template-mini-role" />
        <span className="template-mini-rule" />
        <span className="template-mini-line" />
        <span className="template-mini-line short" />
        <span className="template-mini-heading" />
        <span className="template-mini-line" />
        <span className="template-mini-line" />
        <span className="template-mini-line short" />
        <span className="template-mini-heading" />
        <span className="template-mini-line" />
        <span className="template-mini-line short" />
      </div>
    </div>
  );
}
