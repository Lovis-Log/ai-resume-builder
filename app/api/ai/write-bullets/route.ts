import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai/client";
import { buildBulletsPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { prepareAiRequest } from "@/lib/ai/run";
import { bulletsResultSchema, jsonSchemas, type BulletsResult } from "@/lib/ai/schemas";
import { validateAiResult } from "@/lib/ai/validate";
import { errorResponse, getRequestId, readJson } from "@/lib/api/http";
import { requireUserForApi } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { completeUsage, failUsage } from "@/lib/billing/usage";
import { getResumeForUser } from "@/lib/resume/queries";
import { getIdempotencyKey } from "@/lib/security/idempotency";
import { assertSameOrigin } from "@/lib/security/origin";

export const maxDuration = 60;

const bodySchema = z.object({
  resumeId: z.string().uuid(),
  experienceId: z.string().max(100).nullable().optional(),
  jobTitle: z.string().max(200).default(""),
  company: z.string().max(200).default(""),
  notes: z.string().max(4000).default(""),
  idempotencyKey: z.string().uuid(),
});

export async function POST(request: Request) {
  const requestId = getRequestId();

  try {
    assertSameOrigin(request);
    const user = await requireUserForApi();
    await getOrCreateProfile(user);

    const rawBody = await readJson(request);
    const input = bodySchema.parse(rawBody);
    const idempotencyKey = getIdempotencyKey(request, rawBody);

    const resume = await getResumeForUser(user.id, input.resumeId);
    const eventId = await prepareAiRequest({
      userId: user.id,
      kind: "ai_bullets",
      resumeId: resume.id,
      idempotencyKey,
    });

    try {
      const ai = await generateJson<BulletsResult>({
        system: SYSTEM_PROMPT,
        user: buildBulletsPrompt({
          jobTitle: input.jobTitle,
          company: input.company,
          notes: input.notes,
        }),
        jsonSchema: jsonSchemas.bullets,
        maxTokens: 2048,
        temperature: 0.7,
        timeoutMs: 30_000,
      });
      const result = validateAiResult(bulletsResultSchema, ai.data);

      await completeUsage(eventId, {
        model: ai.model,
        inputTokens: ai.inputTokens,
        outputTokens: ai.outputTokens,
        costUsd: ai.costUsd,
      });

      const entitlements = await getEntitlements(user.id);
      return NextResponse.json({
        bullets: result.bullets,
        usage: { remaining: entitlements.aiRemaining, limit: entitlements.aiLimit },
      });
    } catch (error) {
      await failUsage(eventId, error instanceof Error ? error.message : "AI failed");
      throw error;
    }
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
