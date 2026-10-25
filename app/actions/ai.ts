"use server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { callAiFunction } from "@/lib/ai/function";
import { prepareAiRequest } from "@/lib/ai/run";
import { requireUser } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { completeUsage, failUsage } from "@/lib/billing/usage";
import { db } from "@/lib/db";
import { resumes, tailoringRuns } from "@/lib/db/schema";
import { ConflictError, NotFoundError, ValidationError } from "@/lib/errors";
import { normalizeText, resumeText } from "@/lib/resume/format";
import {
  getResumeRow,
  toResumeRecord,
} from "@/lib/workspace";
import {
  jobDescriptionSchema,
  resumeContentSchema,
} from "@/lib/resume/schema";
import type {
  TailorAnalysis,
  TailorKeyword,
  TailorSuggestion,
} from "@/lib/resume/types";
import {
  createTailoringRun,
  getTailoringRunForUser,
  readKeywords,
  readSuggestions,
  updateTailoringSuggestions,
} from "@/lib/tailoring/queries";
import type { TailoringSuggestions } from "@/lib/tailoring/types";

const idempotencyKeySchema = z.string().uuid();

const summaryInputSchema = z.object({
  resumeId: z.string().uuid(),
  style: z.enum(["measured", "concise", "impact"]),
  idempotencyKey: idempotencyKeySchema,
});

const bulletInputSchema = z.object({
  resumeId: z.string().uuid(),
  experienceId: z.string().min(1).max(100),
  bulletIndex: z.number().int().min(0).max(9),
  idempotencyKey: idempotencyKeySchema,
});

const analyzeInputSchema = z.object({
  resumeId: z.string().uuid(),
  jobDescription: jobDescriptionSchema,
  idempotencyKey: idempotencyKeySchema,
});

const tailorInputSchema = z.object({
  runId: z.string().uuid(),
  idempotencyKey: idempotencyKeySchema,
});

const applyInputSchema = z.object({
  runId: z.string().uuid(),
  selectedIds: z.array(z.string().min(1).max(200)).max(10),
});

type FunctionUsage = {
  model?: string;
  provider?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
};

type SummaryResponse = FunctionUsage & { summary: string };
type BulletResponse = FunctionUsage & { bullet: string };
type KeywordsResponse = FunctionUsage & {
  keywords: Array<{
    term: string;
    importance: "high" | "medium" | "low";
    evidenceQuote?: string;
  }>;
};
type TailorResponse = FunctionUsage & {
  summary: { suggested: string };
  bullets: Array<{ id: string; suggested: string }>;
};

function usagePayload(ai: FunctionUsage) {
  return {
    model: ai.model ?? ai.provider ?? "neon-function",
    inputTokens: ai.inputTokens,
    outputTokens: ai.outputTokens,
    costUsd: ai.costUsd,
  };
}

async function remainingUsage(userId: string) {
  const entitlements = await getEntitlements(userId);
  return { remaining: entitlements.aiRemaining, limit: entitlements.aiLimit };
}

export async function generateSummary(input: {
  resumeId: string;
  style: "measured" | "concise" | "impact";
  idempotencyKey: string;
}) {
  const user = await requireUser();
  await getOrCreateProfile(user);
  const parsed = summaryInputSchema.parse(input);

  const resume = await getResumeRow(user.id, parsed.resumeId);
  if (!resume) throw new NotFoundError("Resume not found");
  const content = resumeContentSchema.parse(resume.content);

  const eventId = await prepareAiRequest({
    userId: user.id,
    kind: "ai_summary",
    resumeId: resume.id,
    idempotencyKey: parsed.idempotencyKey,
  });

  try {
    const ai = await callAiFunction<SummaryResponse>("/v1/summary", {
      targetRole: resume.targetRole || content.contact.headline,
      style: parsed.style,
      content,
    });
    await completeUsage(eventId, usagePayload(ai));
    return {
      summary: ai.summary,
      provider: ai.provider ?? "deepseek",
      usage: await remainingUsage(user.id),
    };
  } catch (error) {
    await failUsage(eventId, error instanceof Error ? error.message : "AI failed");
    throw error;
  }
}

export async function improveBullet(input: {
  resumeId: string;
  experienceId: string;
  bulletIndex: number;
  idempotencyKey: string;
}) {
  const user = await requireUser();
  await getOrCreateProfile(user);
  const parsed = bulletInputSchema.parse(input);

  const resume = await getResumeRow(user.id, parsed.resumeId);
  if (!resume) throw new NotFoundError("Resume not found");
  const content = resumeContentSchema.parse(resume.content);
  const entry = content.experience.find((item) => item.id === parsed.experienceId);
  const bullet = entry?.bullets[parsed.bulletIndex];
  if (!entry || !bullet?.trim()) {
    throw new ValidationError("Choose a highlight with text first.");
  }

  const eventId = await prepareAiRequest({
    userId: user.id,
    kind: "ai_improve",
    resumeId: resume.id,
    idempotencyKey: parsed.idempotencyKey,
  });

  try {
    const ai = await callAiFunction<BulletResponse>("/v1/bullet", {
      bullet,
      jobTitle: entry.title,
      company: entry.company,
    });
    await completeUsage(eventId, usagePayload(ai));
    return {
      bullet: ai.bullet,
      provider: ai.provider ?? "deepseek",
      usage: await remainingUsage(user.id),
    };
  } catch (error) {
    await failUsage(eventId, error instanceof Error ? error.message : "AI failed");
    throw error;
  }
}

export async function analyzeJob(input: {
  resumeId: string;
  jobDescription: string;
  idempotencyKey: string;
}): Promise<
  TailorAnalysis & {
    runId: string;
    provider: string;
    usage: { remaining: number; limit: number };
  }
> {
  const user = await requireUser();
  await getOrCreateProfile(user);
  const parsed = analyzeInputSchema.parse(input);

  const resume = await getResumeRow(user.id, parsed.resumeId);
  if (!resume) throw new NotFoundError("Resume not found");
  const content = resumeContentSchema.parse(resume.content);
  const resumeHaystack = normalizeText(resumeText(content));

  const eventId = await prepareAiRequest({
    userId: user.id,
    kind: "ai_keywords",
    resumeId: resume.id,
    idempotencyKey: parsed.idempotencyKey,
  });

  try {
    const ai = await callAiFunction<KeywordsResponse>("/v1/keywords", {
      jobDescription: parsed.jobDescription,
    });

    const seen = new Set<string>();
    const keywords: TailorKeyword[] = [];
    for (const keyword of ai.keywords) {
      const term = keyword.term.trim();
      if (!term) continue;
      const key = term.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      keywords.push({
        term,
        importance: keyword.importance,
        evidenceQuote: keyword.evidenceQuote ?? term,
        found: resumeHaystack.includes(normalizeText(term)),
      });
    }

    if (keywords.length === 0) {
      throw new ValidationError("The role did not produce usable keywords.");
    }

    const found = keywords.filter((keyword) => keyword.found).length;
    const missingKeywords = keywords.filter((keyword) => !keyword.found);
    const run = await createTailoringRun({
      userId: user.id,
      resumeId: resume.id,
      jobDescription: parsed.jobDescription,
      keywords,
      missingKeywords,
    });

    await completeUsage(eventId, usagePayload(ai));

    return {
      runId: run.id,
      keywords,
      found,
      missing: missingKeywords.length,
      matchPercent: Math.round((found / Math.max(keywords.length, 1)) * 100),
      provider: ai.provider ?? "deepseek",
      usage: await remainingUsage(user.id),
    };
  } catch (error) {
    await failUsage(eventId, error instanceof Error ? error.message : "AI failed");
    throw error;
  }
}

export async function draftTailoring(input: {
  runId: string;
  idempotencyKey: string;
}): Promise<{
  suggestions: TailorSuggestion[];
  provider: string;
  usage: { remaining: number; limit: number };
}> {
  const user = await requireUser();
  await getOrCreateProfile(user);
  const parsed = tailorInputSchema.parse(input);

  const run = await getTailoringRunForUser(user.id, parsed.runId);
  if (run.status === "applied" || run.status === "discarded") {
    throw new ConflictError("Analyze the job again before tailoring this resume.");
  }

  const resume = await getResumeRow(user.id, run.resumeId);
  if (!resume) throw new NotFoundError("Resume not found");
  const content = resumeContentSchema.parse(resume.content);
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
    idempotencyKey: parsed.idempotencyKey,
  });

  try {
    const ai = await callAiFunction<TailorResponse>("/v1/tailor", {
      content,
      jobDescription: run.jobDescription,
      keywords,
    });

    const candidates = new Map<string, { entryId: string; index: number; text: string; company: string }>();
    for (const entry of content.experience) {
      entry.bullets.forEach((bullet, index) => {
        if (bullet.trim()) {
          candidates.set(`${entry.id}:${index}`, {
            entryId: entry.id,
            index,
            text: bullet,
            company: entry.company,
          });
        }
      });
    }

    const suggestionRows: TailorSuggestion[] = [];
    const stored: TailoringSuggestions = {
      summary: {
        original: content.summary,
        suggested: ai.summary.suggested,
        sourceQuotes: content.summary ? [content.summary] : [],
      },
      bullets: [],
    };

    suggestionRows.push({
      id: "tailor-summary",
      kind: "summary",
      section: "Summary",
      original:
        content.summary ||
        "No summary yet. This suggestion adds a short opening for the role.",
      suggested: ai.summary.suggested,
      reason:
        "Leads with the role's language while keeping the facts already on your resume.",
    });

    for (const suggestion of ai.bullets) {
      const original = candidates.get(suggestion.id);
      if (!original) continue;
      suggestionRows.push({
        id: suggestion.id,
        kind: "bullet",
        section: `${original.company || "Experience"} · highlight ${original.index + 1}`,
        original: original.text,
        suggested: suggestion.suggested.trim(),
        reason:
          "Keeps the original facts and tightens the opening so the impact is visible in the first scan.",
        experienceId: original.entryId,
        bulletIndex: original.index,
      });
      stored.bullets.push({
        id: suggestion.id,
        original: original.text,
        suggested: suggestion.suggested.trim(),
        sourceQuotes: [original.text],
      });
    }

    if (suggestionRows.length === 1 && stored.bullets.length === 0) {
      throw new ValidationError("The AI did not return a usable suggestion.");
    }

    await updateTailoringSuggestions(run.id, stored);
    await completeUsage(eventId, usagePayload(ai));

    return {
      suggestions: suggestionRows,
      provider: ai.provider ?? "deepseek",
      usage: await remainingUsage(user.id),
    };
  } catch (error) {
    await failUsage(eventId, error instanceof Error ? error.message : "AI failed");
    throw error;
  }
}

export async function applyTailoring(input: {
  runId: string;
  selectedIds: string[];
}) {
  const user = await requireUser();
  const parsed = applyInputSchema.parse(input);
  const run = await getTailoringRunForUser(user.id, parsed.runId);

  if (run.status === "applied") {
    throw new ConflictError("These suggestions were already applied.");
  }

  const stored = readSuggestions(run.suggestions);
  if (!stored) {
    throw new ValidationError("There are no suggestions to apply.");
  }

  const resume = await getResumeRow(user.id, run.resumeId);
  if (!resume) throw new NotFoundError("Resume not found");
  const content = resumeContentSchema.parse(resume.content);
  const selected = new Set(parsed.selectedIds);

  if (selected.has("tailor-summary")) {
    content.summary = stored.summary.suggested;
  }

  for (const suggestion of stored.bullets) {
    if (!selected.has(suggestion.id)) continue;
    const [entryId, indexRaw] = suggestion.id.split(":");
    const index = Number(indexRaw);
    const entry = content.experience.find((item) => item.id === entryId);
    if (!entry || !Number.isInteger(index) || index < 0) continue;
    if (index >= entry.bullets.length) continue;
    if (entry.bullets[index]?.trim() !== suggestion.original.trim()) continue;
    entry.bullets[index] = suggestion.suggested;
  }

  const parsedContent = resumeContentSchema.parse(content);
  const role = extractRole(run.jobDescription) || resume.targetRole;
  const lastTailoredFor = {
    role,
    company: extractCompany(run.jobDescription),
    matchedAt: new Date().toISOString(),
  };

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(resumes)
      .set({
        content: parsedContent,
        lastTailoredFor,
        targetRole: role,
        version: sql`${resumes.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, run.resumeId), eq(resumes.userId, user.id)))
      .returning({ id: resumes.id, txid: sql<string>`pg_current_xact_id()::text` });

    if (!row) throw new NotFoundError("Resume not found");

    await tx
      .update(tailoringRuns)
      .set({ status: "applied", updatedAt: new Date() })
      .where(
        and(
          eq(tailoringRuns.id, run.id),
          eq(tailoringRuns.userId, user.id),
        ),
      );

    return row;
  });

  const row = await getResumeRow(user.id, run.resumeId);
  if (!row) throw new NotFoundError("Resume not found");

  return { resume: toResumeRecord(row), txid: updated.txid };
}

function extractRole(jobDescription: string): string {
  const firstLine = jobDescription
    .split("\n")
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine?.split("·")[0]?.trim() ?? "";
}

function extractCompany(jobDescription: string): string {
  const lines = jobDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const possible = lines[1]?.split("·")[0]?.trim() ?? "";
  return possible && possible.length < 48 ? possible : "the team";
}
