import Link from "next/link";
import { ArrowUpRight, Check, Sparkles } from "lucide-react";

const FREE_FEATURES = [
  "1 resume at a time",
  "3 AI actions, lifetime",
  "3 PDF downloads, lifetime",
  "The full 10-check score",
  "One ATS-safe A4 template",
  "AI opt-in with per-change review",
];

const PRO_FEATURES = [
  "Unlimited resumes and PDFs",
  "500 AI actions every month",
  "Extra actions at $0.05, capped at $25/month",
  "Job tailoring with per-item review",
  "Everything in Free",
  "Cancel any time from the billing portal",
];

export function PricingSection({
  billingEnabled,
}: {
  billingEnabled: boolean;
}) {
  return (
    <section className="section pricing-section" id="pricing">
      <div className="container">
        <div className="section-head" data-reveal>
          <p className="eyebrow">
            <span />
            Pricing
          </p>
          <h2 className="section-title">
            Start free. <span className="soft">Upgrade when it pays off.</span>
          </h2>
          <p className="section-sub">
            No trial countdown. The free tier is the trial: one resume, three AI
            actions, and three PDFs. Pro is there when one application becomes
            ten.
          </p>
        </div>

        <div className="pricing-grid" data-reveal>
          <article className="price-card price-card-free">
            <div className="price-card-head">
              <div>
                <p className="price-plan">Free</p>
                <p className="price-description">For your first application.</p>
              </div>
              <p className="price-amount">
                <span>$</span>0
              </p>
            </div>

            <ul className="price-features">
              {FREE_FEATURES.map((feature) => (
                <li key={feature}>
                  <span>
                    <Check />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/login" className="price-cta price-cta-light">
              Start free — no card
              <ArrowUpRight />
            </Link>
            <p className="price-foot">
              Enough AI for one full tailoring run, if you want to try it.
            </p>
          </article>

          <article className="price-card price-card-pro">
            <span className="price-pro-glow" aria-hidden="true" />
            <div className="price-card-head">
              <div>
                <p className="price-plan">
                  Pro
                  <span className="price-pro-flag">
                    <Sparkles />
                    For the whole search
                  </span>
                </p>
                <p className="price-description">
                  More resumes, more tailoring, and no download limits.
                </p>
              </div>
              <p className="price-amount">
                <span>$</span>12
                <em>/month</em>
              </p>
            </div>

            <ul className="price-features">
              {PRO_FEATURES.map((feature) => (
                <li key={feature}>
                  <span>
                    <Check />
                  </span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/login" className="price-cta price-cta-pro">
              {billingEnabled
                ? "Start free, upgrade later"
                : "Start free — Pro coming soon"}
              <ArrowUpRight />
            </Link>
            <p className="price-foot">
              {billingEnabled
                ? "Upgrade from the billing page when you are ready."
                : "Checkout is not connected yet. Your free account works today."}
            </p>
            {!billingEnabled ? (
              <p className="price-status">
                <span />
                Billing coming soon
              </p>
            ) : null}
          </article>
        </div>

        <p className="pricing-note" data-reveal>
          Prices in USD. AI actions are only counted when a validated result is
          returned. Failed calls and failed PDF renders are free.
        </p>
      </div>
    </section>
  );
}
