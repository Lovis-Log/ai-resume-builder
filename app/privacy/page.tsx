import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Resume Builder collects, uses, and deletes your data, including AI processing by DeepSeek.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="What we collect, why we collect it, and the choices you have. This policy covers the Resume Builder web app and its AI features."
    >
      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          Information we collect
        </h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            <strong>Account data:</strong> your name, email address, profile
            image, and Google account identifier from Google sign-in.
          </li>
          <li>
            <strong>Resume data:</strong> the contact details, summary,
            experience, education, projects, skills, and job descriptions you
            enter or paste.
          </li>
          <li>
            <strong>Usage data:</strong> which features you use, AI action and PDF
            counts, model and token counts, error events, and request identifiers.
          </li>
          <li>
            <strong>Billing data:</strong> once billing is connected, the billing
            provider processes payment and subscription data. We receive customer
            and subscription identifiers and status, not your card number.
          </li>
          <li>
            <strong>Technical data:</strong> authentication cookies and aggregated,
            cookieless analytics from Vercel Analytics.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          How we use information
        </h2>
        <p className="mt-2">
          We use it to provide the editor, save your resumes, calculate the free
          score, generate PDFs, enforce free and Pro limits, process billing,
          prevent abuse, debug failures, and improve the product. We do not sell
          your personal information.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          AI processing and DeepSeek
        </h2>
        <p className="mt-2">
          AI features are optional. Before your first AI action, we ask for
          consent. When you use AI writing or job tailoring, your resume text and
          (for tailoring) the job description you paste are sent to DeepSeek for
          processing. DeepSeek processes API data in the People&apos;s Republic of
          China and may use inputs to improve its models unless you exercise its
          opt-out process. Do not paste sensitive information such as government
          IDs, financial details, or home addresses.
        </p>
        <p className="mt-2">
          The free score, manual editor, autosave, and PDF export do not send your
          resume to an AI provider. You can use the app without enabling AI. AI
          output can be wrong; you review every suggestion before applying it.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          Billing provider
        </h2>
        <p className="mt-2">
          When Pro checkout is connected, a third-party merchant of record handles
          payment, tax, receipts, invoices, and cancellation. That provider&apos;s
          privacy policy applies to the payment data it collects. We store only
          the customer and subscription identifiers needed to grant access.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          Cookies and analytics
        </h2>
        <p className="mt-2">
          We use HTTP-only authentication cookies to keep you signed in. We use
          Vercel Analytics for aggregated page views and performance data; it is
          designed to work without advertising cookies. We do not use advertising
          trackers.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">
          Retention and deletion
        </h2>
        <p className="mt-2">
          Resumes and usage records are retained while your account exists. You can
          delete your account in Settings. Deletion removes your profile, resumes,
          tailoring runs, usage records, and subscription records from the app
          database, and we delete the authentication user through the auth
          provider. Some records may remain briefly in backups, provider logs, or
          legal/financial records as required by law.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Your choices</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Use the editor, score, and PDF without enabling AI.</li>
          <li>Withdraw AI consent by deleting your account or contacting support.</li>
          <li>Delete your account at any time from Settings.</li>
          <li>Contact us to ask about access, correction, or deletion.</li>
        </ul>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Security</h2>
        <p className="mt-2">
          Access is protected by Google sign-in and server-side authorization
          checks. Secrets stay server-side. No system is perfectly secure; use a
          strong Google account and do not paste sensitive information into AI
          features.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Children</h2>
        <p className="mt-2">
          The service is intended for people aged 16 and older. We do not knowingly
          collect data from children under 16.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Changes</h2>
        <p className="mt-2">
          We may update this policy as the product changes. Material changes will
          be announced in the app or by email if we have your address.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-stone-900">Contact</h2>
        <p className="mt-2">
          Questions or requests:{" "}
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
