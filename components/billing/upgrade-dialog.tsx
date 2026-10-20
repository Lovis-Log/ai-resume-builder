"use client";

import { useState, useTransition } from "react";
import { Check, Sparkles } from "lucide-react";
import { startCheckout } from "@/app/actions/billing";
import type { Entitlements } from "@/lib/billing/types";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { formatLongDate } from "@/lib/utils";

export type UpgradeReason = "resume" | "ai" | "pdf";

const reasonCopy: Record<UpgradeReason, string> = {
  resume:
    "Free includes one resume. Upgrade to build a separate version for every role you apply to.",
  ai: "You have used your 3 free AI actions. Upgrade for 500 actions every month.",
  pdf: "You have used your 3 free PDF downloads. Upgrade for unlimited downloads.",
};

export function UpgradeDialog({
  open,
  onClose,
  entitlements,
  reason,
}: {
  open: boolean;
  onClose: () => void;
  entitlements: Entitlements;
  reason: UpgradeReason;
}) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const atProLimit = entitlements.plan === "pro" && !entitlements.canUseAI;

  function upgrade() {
    startTransition(async () => {
      setMessage(null);
      const result = await startCheckout();
      if ("disabled" in result) {
        setMessage(result.reason);
      }
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={atProLimit ? "Monthly AI limit reached" : "Upgrade to Pro"}
      description={
        atProLimit
          ? `Your included and overage actions reset on ${formatLongDate(entitlements.periodEnd)}.`
          : reasonCopy[reason]
      }
      footer={
        atProLimit ? (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ) : entitlements.billingEnabled ? (
          <>
            <Button variant="secondary" onClick={onClose} disabled={pending}>
              Not now
            </Button>
            <Button onClick={upgrade} disabled={pending}>
              {pending ? "Opening checkout…" : "Upgrade for $12/month"}
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Keep using free
          </Button>
        )
      }
    >
      {atProLimit ? (
        <p className="text-sm leading-relaxed text-stone-600">
          You have reached 1,000 AI actions this month (500 included plus the
          $25 overage cap). Your plan stays active, and your actions reset at the
          start of the next billing period.
        </p>
      ) : (
        <div>
          <div className="rounded-xl bg-[var(--accent-soft)] p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
              <Sparkles className="h-4 w-4" />
              Pro · $12/month
            </div>
            <ul className="mt-3 space-y-2 text-sm text-stone-700">
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                Unlimited resumes and PDF downloads
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                500 AI actions included every month
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                Extra actions at $0.05 each, capped at $25/month
              </li>
              <li className="flex gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none text-[var(--accent)]" />
                Job tailoring, AI writing, and the full score
              </li>
            </ul>
          </div>

          {!entitlements.billingEnabled ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-medium">Billing is not connected yet.</p>
              <p className="mt-1">
                Start free today. Pro checkout will open soon. If you need early
                access, email{" "}
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

          <p className="mt-4 text-xs leading-relaxed text-stone-500">
            Pro is monthly only. You can cancel from the billing portal. Access
            continues through the end of the paid period, and all of your resumes
            remain intact.
          </p>
        </div>
      )}
    </Modal>
  );
}
