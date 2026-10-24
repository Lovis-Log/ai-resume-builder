"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
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
import { useDemoStore } from "@/components/app/demo-store";
import { useToast } from "@/components/ui/toast";
import { formatLongDate } from "@/lib/demo/format";
import type { DemoPlan } from "@/lib/demo/types";
import { cn } from "@/lib/utils";

const invoices = [
  { id: "INV-2026-0412", date: "2026-10-24T09:00:00.000Z", amount: "$12.00" },
  { id: "INV-2026-0321", date: "2026-09-24T09:00:00.000Z", amount: "$12.00" },
  { id: "INV-2026-0247", date: "2026-08-24T09:00:00.000Z", amount: "$12.00" },
];

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
  const { profile, updateProfile } = useDemoStore();
  const { toast } = useToast();
  const [manageOpen, setManageOpen] = useState(false);
  const [confirmPlan, setConfirmPlan] = useState<DemoPlan | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  const isPro = profile.plan === "pro";
  const used = profile.aiUsed;
  const included = profile.aiIncluded;
  const percent = Math.min(100, Math.round((used / included) * 100));
  const invoice = invoices.find((item) => item.id === invoiceId) ?? null;

  function changePlan(plan: DemoPlan) {
    updateProfile({ plan });
    setConfirmPlan(null);
    setManageOpen(false);
    toast(
      plan === "pro"
        ? "Pro plan restored in this local demo."
        : "Switched to the Free plan for this demo.",
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
              renews next. Billing is simulated in this demo.
            </p>
          </div>
          <span className="billing-demo-badge">
            <Sparkles size={13} aria-hidden="true" />
            Demo billing
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
                {isPro
                  ? `Your plan renews ${formatLongDate(profile.renewsOn)}.`
                  : "Create a resume, run the score, and keep everything local."}
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
                ? "No card on file — this is a local demo."
                : "Upgrade or downgrade instantly in the demo."}
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
                    Simulate an upgrade
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
              {isPro ? (
                <div className="billing-invoices">
                  {invoices.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setInvoiceId(item.id)}
                    >
                      <span>
                        <strong>{formatLongDate(item.date)}</strong>
                        <small>{item.id}</small>
                      </span>
                      <span>
                        {item.amount}
                        <ArrowUpRight size={12} aria-hidden="true" />
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="billing-empty-copy">
                  Invoices will appear here after you upgrade. This is a local
                  demo, so no charge is ever made.
                </p>
              )}
            </article>

            <article className="billing-side-card billing-billing-note">
              <span>
                <ShieldCheck size={16} aria-hidden="true" />
              </span>
              <div>
                <h3>No surprises, no real payment.</h3>
                <p>
                  Plan changes are simulated and stored only in this browser.
                  There is no checkout, card field, or provider connected.
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
        description="Everything on this page is a local simulation. You can change plans freely."
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
                Upgrade in demo
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
              {isPro ? formatLongDate(profile.renewsOn) : "No renewal"}
            </strong>
          </div>
          <div>
            <span>Payment method</span>
            <strong>None · demo mode</strong>
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
            ? "Move to Pro in this demo?"
            : "Move to the Free plan?"
        }
        description={
          confirmPlan === "pro"
            ? "This simulates an upgrade instantly. No card, checkout, or charge is involved."
            : "Your local resumes remain, but the demo will show Free-plan limits. You can switch back any time."
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
              {confirmPlan === "pro" ? "Simulate upgrade" : "Use Free plan"}
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

      <AppModal
        open={invoice !== null}
        onClose={() => setInvoiceId(null)}
        title="Invoice preview"
        description="A sample receipt from the local demo. No payment was processed."
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setInvoiceId(null)}
            >
              Close
            </button>
            <button
              type="button"
              className="app-btn app-btn--primary"
              onClick={() => {
                toast("This is a demo invoice. No download was charged.", "info");
                setInvoiceId(null);
              }}
            >
              <Download size={14} aria-hidden="true" />
              Download demo receipt
            </button>
          </>
        }
      >
        {invoice ? (
          <div className="invoice-preview">
            <div className="invoice-preview-head">
              <div>
                <strong>Lume</strong>
                <span>Thoughtfully yours</span>
              </div>
              <span>Paid</span>
            </div>
            <div className="invoice-preview-row">
              <span>Invoice</span>
              <strong>{invoice.id}</strong>
            </div>
            <div className="invoice-preview-row">
              <span>Date</span>
              <strong>{formatLongDate(invoice.date)}</strong>
            </div>
            <div className="invoice-preview-row">
              <span>Lume Pro · monthly</span>
              <strong>{invoice.amount}</strong>
            </div>
            <p>
              Demo receipt only. Billing provider integration is not connected.
            </p>
          </div>
        ) : null}
      </AppModal>
    </div>
  );
}
