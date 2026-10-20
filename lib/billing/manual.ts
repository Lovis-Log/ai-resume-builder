import "server-only";
import type { BillingProvider, CheckoutResult, WebhookEvent } from "./types";

export const manualBillingProvider: BillingProvider = {
  name: "manual",
  enabled: false,
  async createCheckout(): Promise<CheckoutResult> {
    return {
      disabled: true,
      reason:
        "Billing is not connected yet. Start free and we will email you when Pro opens.",
    };
  },
  async createPortal(): Promise<CheckoutResult> {
    return {
      disabled: true,
      reason: "Billing is not connected yet.",
    };
  },
  async verifyWebhook(): Promise<WebhookEvent> {
    throw new Error("The manual billing adapter does not accept webhooks");
  },
  async handleWebhook(): Promise<void> {
    // no-op
  },
};
