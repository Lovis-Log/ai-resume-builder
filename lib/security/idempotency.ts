import { ValidationError } from "@/lib/errors";
import { idempotencyKeySchema } from "@/lib/resume/schema";

export function getIdempotencyKey(request: Request, body?: unknown): string {
  const header = request.headers.get("idempotency-key");
  const bodyKey =
    body && typeof body === "object" && "idempotencyKey" in body
      ? (body as { idempotencyKey?: unknown }).idempotencyKey
      : undefined;

  const raw = header ?? (typeof bodyKey === "string" ? bodyKey : undefined);
  const parsed = idempotencyKeySchema.safeParse(raw);
  if (!parsed.success) {
    throw new ValidationError("A valid idempotency key is required");
  }
  return parsed.data;
}
