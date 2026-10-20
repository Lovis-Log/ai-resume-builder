import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai/client";
import { buildImprovePrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { prepareAiRequest } from "@/lib/ai/run";
import { improveResultSchema, jsonSchemas, type ImproveResult } from "@/lib/ai/schemas";
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
  bullet: z.string().trim().min(1).max(500),
  jobTitle: z.string().max(200).optional(),
  company: z.string().max(200).optional(),
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
      kind: "ai_improve",
      resumeId: resume.id,
      idempotencyKey,
    });

    try {
      const ai = await generateJson<ImproveResult>({
        system: SYSTEM_PROMPT,
        user: buildImprovePrompt({
          bullet: input.bullet,
          jobTitle: input.jobTitle,
          company: input.company,
        }),
        jsonSchema: jsonSchemas.improve,
        maxTokens: 1024,
        temperature: 0.6,
        timeoutMs: 30_000,
      });
      const result = validateAiResult(improveResultSchema, ai.data);

      await completeUsage(eventId, {
        model: ai.model,
        inputTokens: ai.inputTokens,
        outputTokens: ai.outputTokens,
        costUsd: ai.costUsd,
      });

      const entitlements = await getEntitlements(user.id);
      return NextResponse.json({
        bullet: result.bullet,
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
