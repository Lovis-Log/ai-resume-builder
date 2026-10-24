import type { Metadata } from "next";
import { BillingClient } from "@/components/billing/billing-client";

export const metadata: Metadata = {
  title: "Plan & billing",
  description: "Your Lume plan, usage, and demo invoices.",
};

export default function BillingPage() {
  return <BillingClient />;
}
