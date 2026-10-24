import Link from "next/link";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { EditorMockup } from "@/components/marketing/editor-mockup";
import { MARKETING_SCORE } from "@/lib/marketing/demo";

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="bluehour-cloud cloud-left" aria-hidden="true" />
      <div className="bluehour-cloud cloud-right" aria-hidden="true" />
      <div className="bluehour-cloud cloud-left-bottom" aria-hidden="true" />
      <div className="bluehour-cloud cloud-right-bottom" aria-hidden="true" />

      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span />
            AI resume builder for new grads
          </p>

          <h1 className="hero-title">
            <strong className="hero-line">Built to be read.</strong>{" "}
            <span className="hero-line hero-line-light gradient-title">
              Written to be remembered.
            </span>
          </h1>

          <p className="hero-sub">
            A free 10-check score, AI drafting, and job-description tailoring —
            then one
            <br className="desktop-break" /> clean, selectable PDF. Built for
            early-career candidates, not professional writers.
          </p>

          <div className="hero-actions">
            <Link href="/login" className="button button-light">
              Build my resume — free
              <ArrowUpRight aria-hidden="true" />
            </Link>
            <a href="#how" className="button button-glass">
              See how it works
              <ArrowDown aria-hidden="true" />
            </a>
          </div>

          <p className="hero-note">
            No credit card <span>·</span> Google sign-in <span>·</span> 3 free
            PDFs on us
          </p>
        </div>

        <div className="hero-stage">
          <div className="hero-stage-entry">
            <EditorMockup score={MARKETING_SCORE.score} />
          </div>
        </div>
      </div>
    </section>
  );
}
