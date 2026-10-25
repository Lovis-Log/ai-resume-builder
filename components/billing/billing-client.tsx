"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  CreditCard,
  Download,
  FileText,
  Infinity as InfinityIcon,
  ReceiptText,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AppModal } from "@/components/app/app-modal";
import { AppTopbar } from "@/components/app/app-topbar";
import { useWorkspace } from "@/components/app/workspace-store";
import { useToast } from "@/components/ui/toast";
import { formatLongDate } from "@/lib/resume/format";
import type { WorkspacePlan } from "@/lib/resume/types";
import { cn } from "@/lib/utils";

const freeFeatures = [
  "1 resume at a time",
  "3 AI actions, lifetime",
  "3 PDF downloads, lifetime",
  "The full 10-check score",
  "One ATS-safe template",
];

const proFeatures = [
  "Unlimited resumes and PDFs",
  "500 AI actions each month",
  "Extra actions at $0.05, capped at $25",
  "Job tailoring with per-item review",
  "Every template and accent",
];

export function BillingClient() {
  const { profile, changePlan: applyPlan } = useWorkspace();
  const { toast } = useToast();
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<WorkspacePlan | null>(null);

  const isPro = profile.plan === "pro";
  const used = profile.aiUsed;
  const included = profile.aiIncluded;
  const percent = Math.min(100, Math.round((used / included) * 100));

  async function changePlan(plan: WorkspacePlan) {
    await applyPlan(plan);
    setConfirmPlan(null);
    setManageOpen(false);
    toast(
      plan === "pro"
        ? "Pro plan saved to your workspace."
        : "Switched to the Free plan.",
      "success",
    );
  }

  return (
    <div className="lume-page lume-billing-page">
      <AppTopbar />

      <main className="billing-main">
        <header className="billing-intro">
          <div>
            <p className="app-eyebrow">
              <span aria-hidden="true" />
              Plan & billing
            </p>
            <h1>
              The plan behind the work<span>.</span>
            </h1>
            <p>
              A clear view of what you have, what you&apos;ve used, and what
              renews next. Plans are stored in Neon Postgres; a payment
              provider is not connected yet.
            </p>
          </div>
          <span className="billing-demo-badge">
            <Sparkles size={13} aria-hidden="true" />
            {profile.billingEnabled ? "Live billing" : "Manual billing"}
          </span>
        </header>

        <section className={cn("billing-current", isPro && "is-pro")}>
          <span className="billing-current-glow" aria-hidden="true" />
          <div className="billing-current-head">
            <div>
              <span className="billing-plan-label">
                {isPro ? "Lume Pro" : "Lume Free"}
              </span>
              <h2>{isPro ? "Room for every role." : "A place to begin."}</h2>
              <p>
                {isPro && profile.renewsOn
                  ? `Your plan renews ${formatLongDate(profile.renewsOn)}.`
                  : isPro
                    ? "Your Pro plan is active."
                    : "Create a resume, run the score, and upgrade when you need more."}
              </p>
            </div>
            <span className="billing-plan-mark">
              {isPro ? <Sparkles size={18} /> : <FileText size={18} />}
            </span>
          </div>

          <div className="billing-current-usage">
            <div className="billing-usage-head">
              <span>AI actions this month</span>
              <strong>
                {used} <small>/ {included}</small>
              </strong>
            </div>
            <div className="billing-usage-bar" aria-hidden="true">
              <span style={{ width: `${percent}%` }} />
            </div>
            <div className="billing-usage-foot">
              <span>{Math.max(0, included - used)} actions remaining</span>
              <span>Resets with your billing period</span>
            </div>
          </div>

          <div className="billing-current-stats">
            <div>
              <InfinityIcon size={17} aria-hidden="true" />
              <span>
                <strong>{isPro ? "Unlimited" : "1"}</strong>
                Resumes
              </span>
            </div>
            <div>
              <Download size={17} aria-hidden="true" />
              <span>
                <strong>{isPro ? "Unlimited" : "3"}</strong>
                PDF downloads
              </span>
            </div>
            <div>
              <ShieldCheck size={17} aria-hidden="true" />
              <span>
                <strong>Always free</strong>
                Resume score
              </span>
            </div>
          </div>

          <div className="billing-current-actions">
            <button
              type="button"
              className="app-btn app-btn--light"
              onClick={() => setManageOpen(true)}
            >
              <CreditCard size={15} aria-hidden="true" />
              Manage plan
            </button>
            <span>
              {isPro
                ? "No payment provider is connected yet."
                : "Plan changes are saved to your account."}
            </span>
          </div>
        </section>

        <div className="billing-layout">
          <section className="billing-section">
            <div className="billing-section-head">
              <div>
                <p className="app-eyebrow">Plans</p>
                <h2>Pay for momentum, not pressure.</h2>
              </div>
              <p>
                The score and editor are always free. Pro adds room for the
                whole search.
              </p>
            </div>

            <div className="billing-plans">
              <article
                className={cn(
                  "billing-plan-card",
                  !isPro && "is-current",
                )}
              >
                <div className="billing-plan-top">
                  <span>Free</span>
                  {!isPro ? <i className="is-current">Current</i> : null}
                </div>
                <p className="billing-plan-price">
                  $0 <small>forever</small>
                </p>
                <p className="billing-plan-copy">
                  One focused resume and a free score. No card, no countdown.
                </p>
                <ul>
                  {freeFeatures.map((feature) => (
                    <li key={feature}>
                      <Check size={13} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <button
                    type="button"
                    className="app-btn app-btn--quiet billing-plan-action"
                    onClick={() => setConfirmPlan("free")}
                  >
                    Switch to Free
                  </button>
                ) : (
                  <button
                    type="button"
                    className="app-btn app-btn--soft billing-plan-action"
                    disabled
                  >
                    Your current plan
                  </button>
                )}
              </article>

              <article
                className={cn(
                  "billing-plan-card billing-plan-card--pro",
                  isPro && "is-current",
                )}
              >
                <span className="billing-pro-orb" aria-hidden="true" />
                <div className="billing-plan-top">
                  <span>
                    Pro
                    <Sparkles size={13} aria-hidden="true" />
                  </span>
                  {isPro ? <i className="is-current">Current</i> : null}
                </div>
                <p className="billing-plan-price">
                  $12 <small>/ month</small>
                </p>
                <p className="billing-plan-copy">
                  Unlimited pages and the room to tailor each one.
                </p>
                <ul>
                  {proFeatures.map((feature) => (
                    <li key={feature}>
                      <Check size={13} aria-hidden="true" />
                      {feature}
                    </li>
                  ))}
                </ul>
                {isPro ? (
                  <button
                    type="button"
                    className="app-btn app-btn--light billing-plan-action"
                    onClick={() => setManageOpen(true)}
                  >
                    Manage Pro
                  </button>
                ) : (
                  <button
                    type="button"
                    className="app-btn app-btn--primary billing-plan-action"
                    onClick={() => setConfirmPlan("pro")}
                  >
                    Switch to Pro
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                )}
              </article>
            </div>
          </section>

          <aside className="billing-side">
            <article className="billing-side-card">
              <div className="billing-side-head">
                <span>
                  <ReceiptText size={15} aria-hidden="true" />
                  Invoices
                </span>
                <span>3 recent</span>
              </div>
              <p className="billing-empty-copy">
                No invoices yet. Connect a billing provider before charging for
                Pro; plan changes here only update your workspace entitlement.
              </p>
            </article>

            <article className="billing-side-card billing-billing-note">
              <span>
                <ShieldCheck size={16} aria-hidden="true" />
              </span>
              <div>
                <h3>No surprises, no charge.</h3>
                <p>
                  Plan changes update your subscription row in Neon. Checkout is
                  disabled until a merchant-of-record provider is connected.
                </p>
              </div>
            </article>

            <Link href="/settings" className="billing-side-link">
              Manage account and local data
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </main>

      <AppModal
        open={manageOpen}
        onClose={() => setManageOpen(false)}
        title={isPro ? "Your Pro plan." : "Your Free plan."}
        description="This updates the subscription stored in your Neon workspace."
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setManageOpen(false)}
            >
              Close
            </button>
            {isPro ? (
              <button
                type="button"
                className="app-btn app-btn--soft"
                onClick={() => setConfirmPlan("free")}
              >
                Switch to Free
              </button>
            ) : (
              <button
                type="button"
                className="app-btn app-btn--primary"
                onClick={() => setConfirmPlan("pro")}
              >
                Switch to Pro
              </button>
            )}
          </>
        }
      >
        <div className="manage-plan-list">
          <div>
            <span>Plan</span>
            <strong>{isPro ? "Lume Pro — $12/month" : "Lume Free — $0"}</strong>
          </div>
          <div>
            <span>Renews</span>
            <strong>
              {isPro && profile.renewsOn
                ? formatLongDate(profile.renewsOn)
                : "No renewal"}
            </strong>
          </div>
          <div>
            <span>Payment method</span>
            <strong>None · provider not connected</strong>
          </div>
          <div>
            <span>AI actions</span>
            <strong>
              {profile.aiUsed} of {profile.aiIncluded} used this month
            </strong>
          </div>
        </div>
      </AppModal>

      <AppModal
        open={confirmPlan !== null}
        onClose={() => setConfirmPlan(null)}
        title={
          confirmPlan === "pro"
            ? "Switch to Pro?"
            : "Move to the Free plan?"
        }
        description={
          confirmPlan === "pro"
            ? "This updates your subscription in Neon. No card, checkout, or charge is involved."
            : "Your resumes remain, but the Free-plan limits apply. You can switch back any time."
        }
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setConfirmPlan(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="app-btn app-btn--primary"
              onClick={() => confirmPlan && changePlan(confirmPlan)}
            >
              {confirmPlan === "pro" ? "Switch to Pro" : "Use Free plan"}
            </button>
          </>
        }
      >
        <div className="plan-confirm-mark">
          {confirmPlan === "pro" ? (
            <Sparkles size={20} aria-hidden="true" />
          ) : (
            <FileText size={20} aria-hidden="true" />
          )}
          <div>
            <strong>{confirmPlan === "pro" ? "Lume Pro" : "Lume Free"}</strong>
            <span>
              {confirmPlan === "pro"
                ? "Unlimited resumes and PDFs, 500 AI actions."
                : "One resume, three AI actions, three PDFs."}
            </span>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
