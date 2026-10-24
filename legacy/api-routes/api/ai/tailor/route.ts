import { NextResponse } from "next/server";
import { z } from "zod";
import { generateJson } from "@/lib/ai/client";
import { buildTailorPrompt, SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { prepareAiRequest } from "@/lib/ai/run";
import { jsonSchemas, tailorResultSchema, type TailorResult } from "@/lib/ai/schemas";
import { validateAiResult } from "@/lib/ai/validate";
import { errorResponse, getRequestId, readJson } from "@/lib/api/http";
import { requireUserForApi } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { completeUsage, failUsage } from "@/lib/billing/usage";
import { ConflictError, ProviderError } from "@/lib/errors";
import { normalizeText, resumeText } from "@/lib/resume/format";
import { getResumeForUser, parseResumeContent } from "@/lib/resume/queries";
import { getIdempotencyKey } from "@/lib/security/idempotency";
import { assertSameOrigin } from "@/lib/security/origin";
import {
  getTailoringRunForUser,
  readKeywords,
  updateTailoringSuggestions,
} from "@/lib/tailoring/queries";
import type { TailoringSuggestions } from "@/lib/tailoring/types";

export const maxDuration = 60;

const bodySchema = z.object({
  runId: z.string().uuid(),
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

    const run = await getTailoringRunForUser(user.id, input.runId);
    if (run.status === "applied" || run.status === "discarded") {
      throw new ConflictError("Analyze the job again before tailoring this resume.");
    }

    const resume = await getResumeForUser(user.id, run.resumeId);
    const content = parseResumeContent(resume.content);
    const resumeHaystack = normalizeText(resumeText(content));
    const keywords = readKeywords(run.keywords).map((keyword) => ({
      term: keyword.term,
      importance: keyword.importance,
    }));

    if (keywords.length === 0) {
      throw new ConflictError("Analyze the job description again before tailoring.");
    }

    const eventId = await prepareAiRequest({
      userId: user.id,
      kind: "ai_tailor",
      resumeId: resume.id,
      idempotencyKey,
    });

    try {
      const ai = await generateJson<TailorResult>({
        system: SYSTEM_PROMPT,
        user: buildTailorPrompt({
          content,
          jobDescription: run.jobDescription,
          keywords,
        }),
        jsonSchema: jsonSchemas.tailor,
        maxTokens: 10_000,
        temperature: 0.4,
        timeoutMs: 60_000,
      });
      const result = validateAiResult(tailorResultSchema, ai.data);

      const summaryQuotes = result.summary.sourceQuotes.filter((quote) =>
        resumeHaystack.includes(normalizeText(quote)),
      );
      if (summaryQuotes.length === 0) {
        throw new ProviderError(
          "The AI could not ground the summary in your resume. Try again.",
        );
      }

      const candidates = new Map<string, string>();
      for (const entry of content.experience) {
        entry.bullets.forEach((bullet, index) => {
          if (bullet.trim()) {
            candidates.set(`${entry.id}:${index}`, bullet.trim());
          }
        });
      }

      const bullets = result.bullets
        .map((suggestion) => {
          const original = candidates.get(suggestion.id);
          if (!original) return null;
          const sourceQuotes = suggestion.sourceQuotes.filter((quote) =>
            resumeHaystack.includes(normalizeText(quote)),
          );
          if (sourceQuotes.length === 0) return null;
          return {
            id: suggestion.id,
            original,
            suggested: suggestion.suggested.trim(),
            sourceQuotes,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      if (bullets.length === 0) {
        throw new ProviderError(
          "The AI could not ground its suggestions in your resume. Try again.",
        );
      }

      const suggestions: TailoringSuggestions = {
        summary: {
          original: content.summary,
          suggested: result.summary.suggested.trim(),
          sourceQuotes: summaryQuotes,
        },
        bullets,
      };

      await updateTailoringSuggestions(run.id, suggestions);
      await completeUsage(eventId, {
        model: ai.model,
        inputTokens: ai.inputTokens,
        outputTokens: ai.outputTokens,
        costUsd: ai.costUsd,
      });

      const entitlements = await getEntitlements(user.id);
      return NextResponse.json({
        runId: run.id,
        suggestions,
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
