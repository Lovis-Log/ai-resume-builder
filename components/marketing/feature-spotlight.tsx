import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

export function FeatureSpotlight({
  id,
  eyebrow,
  title,
  description,
  points,
  note,
  ctaLabel,
  ctaHref = "/login",
  reverse = false,
  tone = "white",
  children,
}: {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description: string;
  points: string[];
  note?: string;
  ctaLabel: string;
  ctaHref?: string;
  reverse?: boolean;
  tone?: "white" | "lavender";
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`section spotlight spotlight--${tone}${reverse ? " spotlight--reverse" : ""}`}
    >
      <div className="container spotlight-grid">
        <div className="spotlight-copy" data-reveal>
          <p className="eyebrow">
            <span />
            {eyebrow}
          </p>
          <h2 className="section-title">{title}</h2>
          <p className="section-sub">{description}</p>

          <ul className="spotlight-points">
            {points.map((point) => (
              <li key={point}>
                <span>
                  <Check aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>

          <Link href={ctaHref} className="text-link">
            {ctaLabel}
            <ArrowUpRight aria-hidden="true" />
          </Link>

          {note ? <p className="spotlight-note">{note}</p> : null}
        </div>

        <div className="spotlight-visual">
          <span className="spotlight-glow" aria-hidden="true" />
          <div className="float-visual" data-float>
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
