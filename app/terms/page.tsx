import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms that govern your use of Resume Builder, including free and Pro plans, AI output, and cancellation.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="The rules for using Resume Builder. By creating an account, you agree to these terms."
    >
      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          1. The service
        </h2>
        <p className="mt-2">
          Resume Builder helps you create, score, tailor, and export resumes. It
          includes a manual editor, a rule-based score, optional AI writing and job
          tailoring, and PDF export. Features may change as the product develops.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          2. Accounts
        </h2>
        <p className="mt-2">
          You sign in with Google. You are responsible for your Google account and
          for the activity under your account. Provide accurate information and do
          not share access. You must be at least 16 years old.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          3. Your content
        </h2>
        <p className="mt-2">
          You own the content you enter. You grant us permission to store,
          process, and display it to provide the service, including sending it to
          the AI provider when you enable AI features. Do not upload content you do
          not have the right to use, or sensitive information you do not want
          processed by a third-party AI provider.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          4. AI output
        </h2>
        <p className="mt-2">
          AI output is a draft, not a statement of fact. It can be inaccurate,
          incomplete, or biased. You are responsible for reviewing and verifying
          every suggestion before using it. We do not guarantee that AI output will
          be error-free, original, or suitable for a particular job.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          5. Plans and billing
        </h2>
        <p className="mt-2">
          The free plan includes one concurrent resume, three lifetime AI actions,
          and three lifetime PDF downloads. Pro costs $12 per month and includes
          unlimited resumes and PDFs and 500 AI actions per billing period. Extra
          AI actions cost $0.05 each, capped at $25 per month. Pro is monthly only.
        </p>
        <p className="mt-2">
          When billing is connected, a third-party merchant of record processes
          payments and taxes. Checkout, receipts, payment methods, and cancellation
          are handled by that provider. If you cancel, you keep access through the
          end of the paid period; afterward the account reverts to free limits.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          6. Acceptable use
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Do not use the service for unlawful, deceptive, or harmful content.</li>
          <li>Do not attempt to bypass limits, scrape the service, or attack it.</li>
          <li>Do not upload malware or content that infringes someone else&apos;s rights.</li>
          <li>Do not misrepresent your experience or credentials.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          7. Suspension and termination
        </h2>
        <p className="mt-2">
          We may suspend or terminate access for abuse, fraud, non-payment, or
          violation of these terms. You can delete your account at any time in
          Settings. Deletion is permanent.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          8. Disclaimers
        </h2>
        <p className="mt-2">
          The service is provided “as is” and “as available.” We do not guarantee
          that your resume will pass any particular applicant tracking system,
          lead to an interview, or be free of errors. Job outcomes depend on many
          factors outside our control.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          9. Limitation of liability
        </h2>
        <p className="mt-2">
          To the maximum extent permitted by law, we are not liable for indirect,
          incidental, special, consequential, or punitive damages, or for lost
          profits, data, or opportunities. Our total liability for a claim is
          limited to the amount you paid us in the three months before the claim.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          10. Changes
        </h2>
        <p className="mt-2">
          We may update these terms. If a change is material, we will provide
          reasonable notice in the app or by email. Continued use after the change
          means you accept the updated terms.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          11. Contact
        </h2>
        <p className="mt-2">
          Questions about these terms:{" "}
          <a
            href="mailto:support@resumebuilder.app"
            className="font-medium text-[var(--accent)] underline underline-offset-2"
          >
            support@resumebuilder.app
          </a>
          .
        </p>
      </section>
    </LegalPage>
  );
}
