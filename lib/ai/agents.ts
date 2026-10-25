import "server-only";
import { z } from "zod";
import type { ResumeContent } from "@/lib/resume/schema";
import { generateJson, isAiConfigured } from "./client";
import {
  heuristicBullet,
  heuristicKeywords,
  heuristicSummary,
  heuristicTailor,
} from "./heuristics";
import {
  buildImprovePrompt,
  buildKeywordsPrompt,
  buildSummaryPrompt,
  buildTailorPrompt,
  SYSTEM_PROMPT,
} from "./prompts";
import {
  improveResultSchema,
  jsonSchemas,
  summaryResultSchema,
} from "./schemas";
import type { AiSummaryStyle } from "./styles";
import { validateAiResult } from "./validate";

export type AiProviderName = "deepseek" | "heuristic";

export type AgentMeta = {
  provider: AiProviderName;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};

export type KeywordSuggestion = {
  term: string;
  importance: "high" | "medium" | "low";
  evidenceQuote: string;
};

const HEURISTIC_META: AgentMeta = {
  provider: "heuristic",
  model: "local-heuristic",
  inputTokens: 0,
  outputTokens: 0,
  costUsd: 0,
};

const FIRST_PERSON = /\b(i|me|my|mine|we|our|ours|us)\b/i;

// The studio only needs the summary and bullet ids; source quotes are rebuilt
// from the original resume when the suggestions are stored. These schemas stay
// intentionally lenient so one over-long value does not discard a usable reply.
const tailorAgentSchema = z.object({
  summary: z.object({
    suggested: z.string().trim().min(1),
  }),
  bullets: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        suggested: z.string().trim().min(1),
      }),
    )
    .min(1),
});

const keywordsAgentSchema = z.object({
  keywords: z.array(
    z.object({
      term: z.string(),
      importance: z.string(),
      evidenceQuote: z.string(),
    }),
  ),
});

type RunInput<T> = {
  user: string;
  jsonSchema: Record<string, unknown>;
  maxTokens: number;
  temperature?: number;
  schema: z.ZodType<T>;
};

async function runDeepSeek<T>(
  input: RunInput<T>,
): Promise<{ data: T; meta: AgentMeta }> {
  const result = await generateJson<unknown>({
    system: SYSTEM_PROMPT,
    user: input.user,
    jsonSchema: input.jsonSchema,
    maxTokens: input.maxTokens,
    temperature: input.temperature,
  });

  return {
    data: validateAiResult(input.schema, result.data),
    meta: {
      provider: "deepseek",
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      costUsd: result.costUsd,
    },
  };
}

function noteFallback(label: string, error: unknown) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.warn(`[ai] ${label} fell back to local heuristics: ${message}`);
}

export async function generateSummaryAgent(input: {
  targetRole: string;
  style: AiSummaryStyle;
  content: ResumeContent;
}): Promise<{ summary: string } & AgentMeta> {
  if (isAiConfigured()) {
    try {
      const ai = await runDeepSeek({
        user: buildSummaryPrompt({
          targetRole: input.targetRole,
          style: input.style,
          content: input.content,
        }),
        jsonSchema: jsonSchemas.summary,
        maxTokens: 700,
        temperature: 0.5,
        schema: summaryResultSchema,
      });

      const summary = ai.data.summary.trim();
      if (summary) return { summary, ...ai.meta };
    } catch (error) {
      noteFallback("summary", error);
    }
  }

  return {
    summary: heuristicSummary(input.content, input.targetRole, input.style),
    ...HEURISTIC_META,
  };
}

export async function improveBulletAgent(input: {
  bullet: string;
  jobTitle: string;
  company: string;
}): Promise<{ bullet: string } & AgentMeta> {
  if (isAiConfigured()) {
    try {
      const ai = await runDeepSeek({
        user: buildImprovePrompt(input),
        jsonSchema: jsonSchemas.improve,
        maxTokens: 400,
        temperature: 0.5,
        schema: improveResultSchema,
      });

      const bullet = ai.data.bullet.trim();
      if (bullet && !FIRST_PERSON.test(bullet)) return { bullet, ...ai.meta };
    } catch (error) {
      noteFallback("bullet", error);
    }
  }

  return {
    bullet: heuristicBullet(input.bullet, input.company),
    ...HEURISTIC_META,
  };
}

export async function analyzeKeywordsAgent(input: {
  jobDescription: string;
}): Promise<{ keywords: KeywordSuggestion[] } & AgentMeta> {
  if (isAiConfigured()) {
    try {
      const ai = await runDeepSeek({
        user: buildKeywordsPrompt(input.jobDescription),
        jsonSchema: jsonSchemas.keywords,
        maxTokens: 900,
        temperature: 0.3,
        schema: keywordsAgentSchema,
      });

      const haystack = input.jobDescription.toLowerCase();
      const seen = new Set<string>();
      const keywords: KeywordSuggestion[] = [];

      for (const keyword of ai.data.keywords) {
        const term = keyword.term.trim();
        if (!term) continue;
        if (!haystack.includes(keyword.evidenceQuote.toLowerCase())) continue;
        const key = term.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        keywords.push({
          term,
          importance:
            keyword.importance === "high" || keyword.importance === "medium"
              ? keyword.importance
              : "low",
          evidenceQuote: keyword.evidenceQuote,
        });
        if (keywords.length === 10) break;
      }

      if (keywords.length > 0) return { keywords, ...ai.meta };
    } catch (error) {
      noteFallback("keywords", error);
    }
  }

  return {
    keywords: heuristicKeywords(input.jobDescription),
    ...HEURISTIC_META,
  };
}

export async function draftTailoringAgent(input: {
  content: ResumeContent;
  jobDescription: string;
  keywords: Array<{ term: string; importance: string }>;
}): Promise<{
  summary: { suggested: string };
  bullets: Array<{ id: string; suggested: string }>;
} & AgentMeta> {
  if (isAiConfigured()) {
    try {
      const ai = await runDeepSeek({
        user: buildTailorPrompt(input),
        jsonSchema: jsonSchemas.tailor,
        maxTokens: 1800,
        temperature: 0.5,
        schema: tailorAgentSchema,
      });

      const validIds = new Set<string>();
      for (const entry of input.content.experience) {
        entry.bullets.forEach((bullet, index) => {
          if (bullet.trim()) validIds.add(`${entry.id}:${index}`);
        });
      }

      const bullets = ai.data.bullets
        .filter((bullet) => validIds.has(bullet.id))
        .slice(0, 3)
        .map((bullet) => ({
          id: bullet.id,
          suggested: bullet.suggested.trim(),
        }));

      if (bullets.length > 0) {
        return {
          summary: { suggested: ai.data.summary.suggested.trim() },
          bullets,
          ...ai.meta,
        };
      }
    } catch (error) {
      noteFallback("tailor", error);
    }
  }

  return {
    ...heuristicTailor(input.content, input.jobDescription),
    ...HEURISTIC_META,
  };
}
