import type { z } from "zod";
import { ProviderError } from "@/lib/errors";

export function validateAiResult<T>(schema: z.ZodType<T>, data: unknown): T {
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new ProviderError("The AI returned an invalid response. Try again.");
  }
  return parsed.data;
}
