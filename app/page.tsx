import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";
import { ResumePreview } from "@/components/preview/resume-preview";
import { SAMPLE_RESUME_CONTENT } from "@/lib/resume/defaults";
import { computeScore } from "@/lib/score/compute";

export const metadata: Metadata = {
  title: "AI Resume Builder for New Grads",
  description:
    "Build an ATS-safe resume with AI. Free 10-check score, live preview, job tailoring, and a clean one-click PDF. Built for early-career candidates.",
  alternates: { canonical: "/" },
  openGraph: { url: "/" },
};

const sampleScore = computeScore(SAMPLE_RESUME_CONTENT, 1);
const billingEnabled =
  Boolean(process.env.BILLING_PROVIDER) &&
  process.env.BILLING_PROVIDER !== "manual";

export default function HomePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Resume Builder",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "AI resume builder for early-career candidates and new grads, with a free score, job tailoring, and ATS-safe PDF export.",
    offers: {
      "@type": "Offer",
      price: "12",
      priceCurrency: "USD",
      description: "Pro monthly plan with 500 AI actions.",
    },
  };

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Resume Builder
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-stone-600 md:flex">
            <a href="#how-it-works" className="hover:text-stone-900">
              How it works
            </a>
            <a href="#score" className="hover:text-stone-900">
              Score
            </a>
            <a href="#pricing" className="hover:text-stone-900">
              Pricing
            </a>
            <a href="#faq" className="hover:text-stone-900">
              FAQ
            </a>
          </nav>
          <Link
            href="/login"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
          >
            Build my resume
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.05fr_0.95fr] lg:pt-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-[var(--accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Built for early-career candidates
            </div>
            <h1 className="mt-5 text-5xl font-semibold leading-[1.04] tracking-tight text-stone-900 sm:text-6xl">
              A resume that gets past the bots.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-stone-600">
              Start with your real experience. Get AI help when the wording is
              stuck. Tailor it to the job. Then download a clean, ATS-safe PDF
              that looks like you know what you are doing.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="inline-flex h-12 items-center gap-2 rounded-lg bg-[var(--accent)] px-6 text-base font-medium text-white shadow-sm hover:bg-[var(--accent-hover)]"
              >
                Build my resume — free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#score"
                className="inline-flex h-12 items-center gap-2 rounded-lg border border-[var(--border)] bg-white px-5 text-sm font-medium text-stone-800 hover:bg-stone-50"
              >
                See the 10 checks
              </a>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs text-stone-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                No credit card
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                Google sign-in
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
                A4, selectable text
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[480px]">
            <div className="relative h-[520px] overflow-hidden rounded-[28px] border border-stone-200 bg-white p-4 shadow-2xl">
              <div className="origin-top-left scale-[0.52]">
                <ResumePreview content={SAMPLE_RESUME_CONTENT} />
              </div>
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 w-52 rounded-2xl border border-stone-200 bg-white p-4 shadow-xl">
              <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
                Resume score
              </p>
              <div className="mt-1 flex items-end gap-1">
                <span className="text-3xl font-semibold text-stone-900">
                  {sampleScore.score}
                </span>
                <span className="pb-1 text-xs text-stone-400">/ 100</span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                <div
                  className="h-full rounded-full bg-green-500"
                  style={{ width: `${sampleScore.score}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-stone-500">
                {sampleScore.passed} of {sampleScore.total} checks pass
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-white py-10">
          <div className="mx-auto grid max-w-7xl gap-6 px-6 sm:grid-cols-3">
            {[
              {
                icon: FileText,
                title: "One clean template",
                copy: "Single column, real text, embedded fonts. No tables, icons, or photos for an ATS to choke on.",
              },
              {
                icon: Target,
                title: "Tailored to the job",
                copy: "Paste a job description, see the keywords you are missing, and rewrite the summary and top bullets.",
              },
              {
                icon: ShieldCheck,
                title: "Free score first",
                copy: "Ten checks, no AI required. See exactly what to fix before you pay for anything.",
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-3">
                <item.icon className="mt-0.5 h-5 w-5 flex-none text-[var(--accent)]" />
                <div>
                  <h2 className="text-sm font-semibold text-stone-900">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">
                    {item.copy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-[var(--accent)]">How it works</p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
              From blank page to a job-ready PDF.
            </h2>
            <p className="mt-3 text-stone-600">
              No design decisions. No formatting rabbit holes. Just the content
              that gets you an interview.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Fill the six sections",
                copy: "Contact, summary, experience, education, projects, and skills. Add only what is true.",
              },
              {
                step: "02",
                title: "Use AI where it helps",
                copy: "Write a summary, draft bullets from your notes, or improve one line. You review every change.",
              },
              {
                step: "03",
                title: "Tailor, score, download",
                copy: "Paste a job description, apply the suggestions you trust, check the score, and export.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-[var(--border)] bg-white p-6 shadow-sm"
              >
                <span className="font-mono text-xs text-[var(--accent)]">
                  {item.step}
                </span>
                <h3 className="mt-3 text-lg font-semibold text-stone-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.copy}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section id="score" className="border-y border-[var(--border)] bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-sm font-medium text-[var(--accent)]">
                  The free hook
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                  Ten checks. One honest score.
                </h2>
                <p className="mt-3 max-w-lg leading-relaxed text-stone-600">
                  The score is rule-based, not AI. It looks for the things
                  recruiters and parsers actually care about, and every failed
                  check links to the field that fixes it.
                </p>
                <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-stone-700">
                      Example resume
                    </span>
                    <span className="text-2xl font-semibold text-stone-900">
                      {sampleScore.score}/100
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${sampleScore.score}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                {sampleScore.checks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-start gap-2 rounded-xl border border-stone-200 p-3"
                  >
                    {check.passed ? (
                      <CheckCircle2 className="mt-0.5 h-4 w-4 flex-none text-green-600" />
                    ) : (
                      <XCircle className="mt-0.5 h-4 w-4 flex-none text-amber-600" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-stone-900">
                        {check.label}
                      </p>
                      <p className="mt-0.5 text-xs text-stone-500">
                        {check.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div className="rounded-3xl border border-[var(--border)] bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-stone-900">
                  Job description
                </p>
                <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs text-stone-500">
                  Pasted
                </span>
              </div>
              <div className="mt-3 space-y-2 text-sm leading-relaxed text-stone-600">
                <p>
                  “We are looking for a software engineering intern with
                  experience in <strong>TypeScript</strong>,{" "}
                  <strong>React</strong>, and <strong>PostgreSQL</strong>. You will
                  build customer-facing dashboards, write tests, and work with
                  designers…”
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  ["TypeScript", true],
                  ["React", true],
                  ["PostgreSQL", true],
                  ["Docker", false],
                  ["GraphQL", false],
                  ["Accessibility", false],
                ].map(([label, found]) => (
                  <span
                    key={String(label)}
                    className={
                      found
                        ? "inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200"
                        : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200"
                    }
                  >
                    {found ? (
                      <Check className="h-3 w-3" />
                    ) : (
                      <ArrowRight className="h-3 w-3" />
                    )}
                    {String(label)}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-[var(--accent)]">
                The paid value
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Tailor without rewriting your whole resume.
              </h2>
              <p className="mt-3 leading-relaxed text-stone-600">
                Analyze the job description, see which keywords are missing, then
                rewrite the summary and your three most relevant bullets. You
                accept or reject each suggestion individually. Nothing changes
                until you say so.
              </p>
              <ul className="mt-6 space-y-3 text-sm text-stone-700">
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                  Keyword analysis uses 1 AI action; tailoring uses 1 more.
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                  Original and suggested text side by side.
                </li>
                <li className="flex gap-2">
                  <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                  Source quotes are checked against your resume to reduce
                  fabrication.
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section id="pricing" className="border-y border-[var(--border)] bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-[var(--accent)]">Pricing</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 sm:text-4xl">
                Start free. Upgrade when you need more.
              </h2>
              <p className="mt-3 text-stone-600">
                No trial countdown. The free tier is the trial. Pro is $12/month
                with 500 AI actions included.
              </p>
            </div>

            <div className="mt-10 grid gap-5 lg:grid-cols-2">
              <div className="rounded-2xl border border-[var(--border)] p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-stone-900">Free</h3>
                  <span className="text-2xl font-semibold text-stone-900">$0</span>
                </div>
                <p className="mt-1 text-sm text-stone-500">
                  Everything you need to test the workflow.
                </p>
                <ul className="mt-5 space-y-3 text-sm text-stone-700">
                  {[
                    "1 resume",
                    "3 AI actions, lifetime",
                    "3 PDF downloads, lifetime",
                    "The full 10-check score",
                    "A4, ATS-safe template",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg border border-[var(--border)] bg-white text-sm font-medium text-stone-800 hover:bg-stone-50"
                >
                  Start free
                </Link>
              </div>

              <div className="relative rounded-2xl border-2 border-[var(--accent)] bg-[var(--accent)] p-6 text-white shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Pro</h3>
                  <div className="text-right">
                    <span className="text-2xl font-semibold">$12</span>
                    <span className="text-sm text-teal-100">/month</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-teal-100">
                  For the job search, not just one application.
                </p>
                <ul className="mt-5 space-y-3 text-sm text-teal-50">
                  {[
                    "Unlimited resumes and PDF downloads",
                    "500 AI actions every month",
                    "Extra actions at $0.05, capped at $25/month",
                    "Job tailoring with per-item review",
                    "Cancel any time from the billing portal",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-teal-200" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className="mt-6 inline-flex h-11 w-full items-center justify-center rounded-lg bg-white text-sm font-semibold text-[var(--accent)] hover:bg-teal-50"
                >
                  {billingEnabled ? "Start free, upgrade later" : "Start free — Pro coming soon"}
                </Link>
                {!billingEnabled ? (
                  <p className="mt-2 text-center text-xs text-teal-100">
                    Checkout is not connected yet. Your free account works today.
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-6 py-20">
          <p className="text-sm font-medium text-[var(--accent)]">FAQ</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
            Questions worth asking.
          </h2>
          <div className="mt-8 divide-y divide-stone-200 rounded-2xl border border-[var(--border)] bg-white">
            {[
              {
                q: "Is the PDF really ATS-safe?",
                a: "The template is single-column with selectable text and embedded fonts. There are no tables, icons, photos, or text boxes. We test extraction with pdftotext and check font embedding before each release. No one can guarantee every ATS behaves the same, but this avoids the common failure modes.",
              },
              {
                q: "Does the AI invent experience?",
                a: "The prompts tell it to use only facts you provide, and tailoring suggestions must include source quotes that are checked against your resume. You review every change before applying it. AI can still be wrong; treat it as a drafting assistant.",
              },
              {
                q: "What leaves the app for AI?",
                a: "Only when you opt in: your resume text and, for tailoring, the job description. They go to DeepSeek. The score, editor, and PDF export do not use AI. You can use the app without enabling AI.",
              },
              {
                q: "What happens if I cancel Pro?",
                a: "You keep access through the end of the paid period. After that, the account reverts to free limits for new resumes, AI actions, and downloads. Extra resumes stay editable.",
              },
              {
                q: "Why only one template?",
                a: "One excellent ATS-safe template is more useful than ten mediocre ones. More templates will come after payment, once the core workflow is proven.",
              },
            ].map((item) => (
              <details key={item.q} className="group px-5 py-4">
                <summary className="cursor-pointer list-none text-sm font-medium text-stone-900">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="border-t border-[var(--border)] bg-[var(--accent)] py-16 text-white">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Your next application deserves a better first draft.
              </h2>
              <p className="mt-2 text-sm text-teal-100">
                Start free. No credit card. Takes a few minutes.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex h-12 flex-none items-center gap-2 rounded-lg bg-white px-6 text-sm font-semibold text-[var(--accent)] hover:bg-teal-50"
            >
              Build my resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-stone-950 py-10 text-stone-400">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Resume Builder</p>
            <p className="mt-1 text-xs">
              AI drafts, human judgment. Built for early-career candidates.
            </p>
          </div>
          <div className="flex flex-wrap gap-5 text-xs">
            <Link href="/privacy" className="hover:text-white">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white">
              Terms
            </Link>
            <a href="mailto:support@resumebuilder.app" className="hover:text-white">
              Support
            </a>
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-7xl px-6 text-[11px] leading-relaxed text-stone-500">
          AI processing is provided by DeepSeek after you opt in. The billing
          provider is the merchant of record once checkout is connected. This site
          is not affiliated with any applicant tracking system.
        </div>
      </footer>
    </div>
  );
}
