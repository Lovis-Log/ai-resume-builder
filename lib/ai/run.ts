import "server-only";
import { reserveUsage } from "@/lib/billing/usage";
import type { UsageKind } from "@/lib/billing/types";
import { ConflictError } from "@/lib/errors";
import { assertRateLimit } from "@/lib/security/rate-limit";
import { requireAiConsent } from "./consent";

export async function prepareAiRequest(input: {
  userId: string;
  kind: UsageKind;
  resumeId: string;
  idempotencyKey: string;
}): Promise<string> {
  await requireAiConsent(input.userId);
  await assertRateLimit(`ai:${input.userId}`, 20, 60);

  const reservation = await reserveUsage({
    userId: input.userId,
    kind: input.kind,
    resumeId: input.resumeId,
    idempotencyKey: input.idempotencyKey,
  });

  if (reservation.status !== "reserved") {
    throw new ConflictError(
      "This request is already being processed. Wait a moment and try again.",
    );
  }

  return reservation.eventId;
}
