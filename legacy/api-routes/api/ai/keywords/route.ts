import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai/client";
import { buildKeywordsPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { prepareAiRequest } from "@/lib/ai/run";
import {
  jsonSchemas,
  keywordsResultSchema,
  type KeywordsResult,
} from "@/lib/ai/schemas";
import { validateAiResult } from "@/lib/ai/validate";
import { errorResponse, getRequestId, readJson } from "@/lib/api/http";
import { requireUserForApi } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { completeUsage, failUsage } from "@/lib/billing/usage";
import { ProviderError } from "@/lib/errors";
import { normalizeText, resumeText } from "@/lib/resume/format";
import {
  getResumeForUser,
  parseResumeContent,
} from "@/lib/resume/queries";
import { jobDescriptionSchema } from "@/lib/resume/schema";
import { getIdempotencyKey } from "@/lib/security/idempotency";
import { assertSameOrigin } from "@/lib/security/origin";
import { createTailoringRun } from "@/lib/tailoring/queries";
import type { TailoringKeyword } from "@/lib/tailoring/types";

export const maxDuration = 60;

const bodySchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: jobDescriptionSchema,
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
    const content = parseResumeContent(resume.content);
    const resumeHaystack = normalizeText(resumeText(content));
    const jobHaystack = normalizeText(input.jobDescription);

    const eventId = await prepareAiRequest({
      userId: user.id,
      kind: "ai_keywords",
      resumeId: resume.id,
      idempotencyKey,
    });

    try {
      const ai = await generateJson<KeywordsResult>({
        system: SYSTEM_PROMPT,
        user: buildKeywordsPrompt(input.jobDescription),
        jsonSchema: jsonSchemas.keywords,
        maxTokens: 2048,
        temperature: 0.2,
        timeoutMs: 30_000,
      });
      const result = validateAiResult(keywordsResultSchema, ai.data);

      const seen = new Set<string>();
      const keywords: TailoringKeyword[] = [];
      for (const keyword of result.keywords) {
        const term = keyword.term.trim();
        if (!term) continue;
        if (!jobHaystack.includes(normalizeText(keyword.evidenceQuote))) continue;
        const key = term.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        keywords.push({
          term,
          importance: keyword.importance,
          evidenceQuote: keyword.evidenceQuote,
          found: resumeHaystack.includes(normalizeText(term)),
        });
      }

      if (keywords.length === 0) {
        throw new ProviderError(
          "The AI could not extract reliable keywords. Try a more detailed job description.",
        );
      }

      const missingKeywords = keywords.filter((keyword) => !keyword.found);
      const run = await createTailoringRun({
        userId: user.id,
        resumeId: resume.id,
        jobDescription: input.jobDescription,
        keywords,
        missingKeywords,
      });

      await completeUsage(eventId, {
        model: ai.model,
        inputTokens: ai.inputTokens,
        outputTokens: ai.outputTokens,
        costUsd: ai.costUsd,
      });

      const entitlements = await getEntitlements(user.id);
      return NextResponse.json({
        runId: run.id,
        keywords,
        missing: missingKeywords,
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
