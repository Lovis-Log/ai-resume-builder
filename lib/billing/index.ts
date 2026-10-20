import "server-only";
import { manualBillingProvider } from "./manual";
import type { BillingProvider, BillingProviderName } from "./types";

export function getBillingProvider(): BillingProvider {
  const provider = (process.env.BILLING_PROVIDER ?? "manual") as BillingProviderName;

  switch (provider) {
    case "manual":
      return manualBillingProvider;
    case "creem":
    case "dodo":
      // Provider adapters are intentionally deferred until one is connected.
      return manualBillingProvider;
    default:
      return manualBillingProvider;
  }
}

export function isBillingEnabled(): boolean {
  return getBillingProvider().enabled;
}
