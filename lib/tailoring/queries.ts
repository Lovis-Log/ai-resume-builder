import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tailoringRuns } from "@/lib/db/schema";
import { NotFoundError } from "@/lib/errors";
import type { TailoringKeyword, TailoringSuggestions } from "./types";

export async function getTailoringRunForUser(userId: string, runId: string) {
  const [run] = await db
    .select()
    .from(tailoringRuns)
    .where(and(eq(tailoringRuns.id, runId), eq(tailoringRuns.userId, userId)))
    .limit(1);

  if (!run) {
    throw new NotFoundError("Tailoring run not found");
  }

  return run;
}

export async function createTailoringRun(input: {
  userId: string;
  resumeId: string;
  jobDescription: string;
  keywords: TailoringKeyword[];
  missingKeywords: TailoringKeyword[];
}) {
  const [run] = await db
    .insert(tailoringRuns)
    .values({
      userId: input.userId,
      resumeId: input.resumeId,
      jobDescription: input.jobDescription,
      keywords: input.keywords,
      missingKeywords: input.missingKeywords,
      status: "keywords_ready",
    })
    .returning();

  return run;
}

export async function updateTailoringSuggestions(
  runId: string,
  suggestions: TailoringSuggestions,
) {
  await db
    .update(tailoringRuns)
    .set({
      suggestions,
      status: "tailored",
      updatedAt: new Date(),
    })
    .where(eq(tailoringRuns.id, runId));
}

export async function markTailoringRunApplied(runId: string) {
  await db
    .update(tailoringRuns)
    .set({ status: "applied", updatedAt: new Date() })
    .where(eq(tailoringRuns.id, runId));
}

export function readKeywords(value: unknown): TailoringKeyword[] {
  return Array.isArray(value) ? (value as TailoringKeyword[]) : [];
}

export function readSuggestions(value: unknown): TailoringSuggestions | null {
  if (!value || typeof value !== "object") return null;
  return value as TailoringSuggestions;
}
