"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { openPortal, startCheckout } from "@/app/actions/billing";
import type { Entitlements } from "@/lib/billing/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatLongDate } from "@/lib/utils";

function UsageBar({
  label,
  used,
  limit,
  detail,
}: {
  label: string;
  used: number;
  limit: number | null;
  detail?: string;
}) {
  const percent = limit === null ? 0 : Math.min(100, (used / Math.max(1, limit)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="text-stone-600">{label}</span>
        <span className="font-medium text-stone-900">
          {limit === null ? `${used} used · unlimited` : `${used} / ${limit}`}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-stone-100">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: `${limit === null ? 8 : percent}%` }}
        />
      </div>
      {detail ? <p className="mt-1 text-xs text-stone-500">{detail}</p> : null}
    </div>
  );
}

export function BillingClient({ entitlements }: { entitlements: Entitlements }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function upgrade() {
    startTransition(async () => {
      setMessage(null);
      const result = await startCheckout();
      if ("disabled" in result) setMessage(result.reason);
    });
  }

  function portal() {
    startTransition(async () => {
      setMessage(null);
      const result = await openPortal();
      if ("disabled" in result) setMessage(result.reason);
    });
  }

  const isPro = entitlements.plan === "pro";

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[var(--accent)]">Plan and usage</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
            Billing
          </h1>
          <p className="mt-2 text-sm text-stone-600">
            Simple monthly pricing. No trial, no annual commitment.
          </p>
        </div>
        <Badge variant={isPro ? "accent" : "neutral"}>
          {isPro ? "Pro" : "Free"}
        </Badge>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              Current plan
            </p>
            <p className="mt-1 text-2xl font-semibold text-stone-900">
              {isPro ? "Pro — $12/month" : "Free"}
            </p>
            <p className="mt-1 text-sm text-stone-600">
              {isPro
                ? entitlements.cancelAtPeriodEnd
                  ? `Cancels on ${formatLongDate(entitlements.periodEnd)}. You keep access until then.`
                  : `Renews on ${formatLongDate(entitlements.periodEnd)}.`
                : "Lifetime free limits. Upgrade when you need more."}
            </p>
          </div>
          {isPro ? (
            <Button
              variant="secondary"
              onClick={portal}
              disabled={pending || !entitlements.billingEnabled}
            >
              {pending ? "Opening…" : "Manage subscription"}
              <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button
              onClick={upgrade}
              disabled={pending || !entitlements.billingEnabled}
            >
              <Sparkles className="h-4 w-4" />
              {pending ? "Opening…" : "Upgrade to Pro"}
            </Button>
          )}
        </div>

        {!entitlements.billingEnabled ? (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-medium">Billing is not connected yet.</p>
            <p className="mt-1">
              The app is fully usable on the free plan. Pro checkout will open
              soon. If you need early access, email{" "}
              <a
                className="underline underline-offset-2"
                href="mailto:support@resumebuilder.app"
              >
                support@resumebuilder.app
              </a>
              .
            </p>
          </div>
        ) : null}

        {message ? (
          <p className="mt-4 rounded-lg bg-stone-100 px-3 py-2 text-sm text-stone-700">
            {message}
          </p>
        ) : null}

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <UsageBar
            label="AI actions this period"
            used={entitlements.aiUsed}
            limit={entitlements.aiLimit}
            detail={
              isPro
                ? `500 included · ${entitlements.aiOverageUsed} of ${entitlements.aiOverageLimit} overage actions used · $25 cap`
                : "Lifetime free actions. Tailoring uses 2 per full run."
            }
          />
          <UsageBar
            label="PDF downloads"
            used={entitlements.pdfUsed}
            limit={entitlements.pdfLimit}
            detail={
              isPro
                ? "Unlimited while Pro is active."
                : "Each successful generation counts. Failed renders are free."
            }
          />
          <UsageBar
            label="Resumes"
            used={entitlements.resumeCount}
            limit={entitlements.resumeLimit}
            detail={
              isPro
                ? "Unlimited while Pro is active."
                : "One concurrent free resume. Deleting it frees the slot."
            }
          />
          <div className="rounded-xl border border-[var(--border)] bg-stone-50 p-4">
            <p className="flex items-center gap-2 text-sm font-medium text-stone-900">
              <CreditCard className="h-4 w-4 text-[var(--accent)]" />
              Provider-managed
            </p>
            <p className="mt-1 text-xs leading-relaxed text-stone-600">
              Checkout, receipts, payment methods, and cancellation are handled by
              the billing provider&apos;s hosted portal. We never store card data.
            </p>
          </div>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <h2 className="text-lg font-semibold text-stone-900">What Pro includes</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {[
            "Unlimited resumes and PDF downloads",
            "500 AI actions every billing month",
            "Extra actions at $0.05, capped at $25/month",
            "Job tailoring with per-item review",
            "The same ATS-safe A4 template",
            "Cancel from the portal at any time",
          ].map((item) => (
            <li key={item} className="flex gap-2 text-sm text-stone-700">
              <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-stone-500">
          Pro is monthly only. If you cancel, you keep access through the end of
          the paid period. After that, your account reverts to free limits for new
          resumes, AI actions, and downloads. Existing extra resumes stay editable.
        </p>
      </Card>
    </main>
  );
}
