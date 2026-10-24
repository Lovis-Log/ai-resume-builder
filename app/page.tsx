import type { Metadata, Viewport } from "next";
import { Instrument_Sans } from "next/font/google";
import { AiWritingDemo } from "@/components/marketing/ai-writing-demo";
import { FactStrip } from "@/components/marketing/fact-strip";
import { FaqSection } from "@/components/marketing/faq-section";
import { FeatureSpotlight } from "@/components/marketing/feature-spotlight";
import { FinalCta } from "@/components/marketing/final-cta";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { LandingMotion } from "@/components/marketing/landing-motion";
import { PricingSection } from "@/components/marketing/pricing-section";
import { ScoreSection } from "@/components/marketing/score-section";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";
import { TailoringDemo } from "@/components/marketing/tailoring-demo";
import { TemplateSection } from "@/components/marketing/template-section";
import {
  MARKETING_RESUME_CONTENT,
  MARKETING_SCORE,
} from "@/lib/marketing/demo";

const display = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: { absolute: "Lume — AI Resume Builder for New Grads" },
  description:
    "Lume builds an ATS-safe resume with AI. Free 10-check score, live preview, job tailoring, and a clean one-click PDF. Built for early-career candidates.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

export const viewport: Viewport = {
  themeColor: "#6f9dd9",
};

const billingEnabled =
  Boolean(process.env.BILLING_PROVIDER) &&
  process.env.BILLING_PROVIDER !== "manual";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Lume",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "Lume is an AI resume builder for early-career candidates and new grads, with a free score, job tailoring, and ATS-safe PDF export.",
    offers: {
      "@type": "Offer",
      price: "12",
      priceCurrency: "USD",
      description: "Pro monthly plan with 500 AI actions.",
    },
  };

  return (
    <div className={`landing ${display.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <LandingMotion />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteNav />

      <main id="main" tabIndex={-1}>
        <Hero />
        <FactStrip />
        <HowItWorks />

        <FeatureSpotlight
          id="features"
          eyebrow="AI that asks first"
          title={
            <>
              Less staring. <span className="soft">More saying it well.</span>
            </>
          }
          description="Draft a summary, turn rough notes into real bullets, or improve a single line. Every result arrives as a suggestion — you decide what stays. The AI only sees your resume when you opt in, and it is never the one clicking “apply.”"
          points={[
            "Uses your roles and notes; no invented employers, dates, or metrics.",
            "Improve one bullet without rewriting the whole section.",
            "One action per valid generation. Successful results only.",
          ]}
          note="Free accounts get 3 AI actions for life. The score and editor never use them."
          ctaLabel="Draft with AI — free"
          tone="white"
        >
          <AiWritingDemo />
        </FeatureSpotlight>

        <FeatureSpotlight
          id="tailoring"
          eyebrow="Tailored, not fabricated"
          title={
            <>
              Same resume. <span className="soft">This job’s language.</span>
            </>
          }
          description="Paste a job description. See the top ten keywords and which ones your resume misses. Then get a tailored summary and three rewritten bullets, with the original beside every suggestion. Apply only the changes that are true."
          points={[
            "Keyword analysis uses 1 AI action; tailoring uses 1 more.",
            "Source quotes are checked against your resume to reduce fabrication.",
            "Review each change and apply selected items. Nothing changes silently.",
          ]}
          note="A full tailoring run uses 2 AI actions. The free tier includes 3, so you can try one complete run."
          ctaLabel="Try tailoring free"
          reverse
          tone="lavender"
        >
          <TailoringDemo />
        </FeatureSpotlight>

        <ScoreSection result={MARKETING_SCORE} />
        <TemplateSection content={MARKETING_RESUME_CONTENT} />
        <PricingSection billingEnabled={billingEnabled} />
        <FaqSection />
        <FinalCta />
      </main>

      <SiteFooter />
    </div>
  );
}
