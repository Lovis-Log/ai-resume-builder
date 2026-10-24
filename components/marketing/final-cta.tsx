import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export function FinalCta() {
  return (
    <section className="final-cta">
      <div className="final-cta-sky" aria-hidden="true" />
      <span className="final-cta-cloud final-cta-cloud-one" aria-hidden="true" />
      <span className="final-cta-cloud final-cta-cloud-two" aria-hidden="true" />

      <div className="container final-cta-inner" data-reveal>
        <p className="eyebrow eyebrow-light">
          <span />
          Your next application
        </p>
        <h2>
          Next chapter,
          <br /> <span>meet your resume.</span>
        </h2>
        <p>
          A little more confidence. A lot less formatting. Three free PDFs and a
          score that tells you the truth.
        </p>
        <Link href="/dashboard" className="button button-light final-cta-button">
          Build my resume — free
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <p className="final-cta-note">
          No credit card <span>·</span> Google sign-in <span>·</span> AI is opt-in
        </p>
      </div>
    </section>
  );
}
