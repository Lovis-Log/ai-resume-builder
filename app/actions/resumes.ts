"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { db } from "@/lib/db";
import { resumes, tailoringRuns } from "@/lib/db/schema";
import {
  ConflictError,
  LimitReachedError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { createEmptyResumeContent } from "@/lib/resume/defaults";
import {
  resumeContentSchema,
  resumeTitleSchema,
} from "@/lib/resume/schema";
import { getResumeForUser, parseResumeContent } from "@/lib/resume/queries";
import {
  getTailoringRunForUser,
  readSuggestions,
} from "@/lib/tailoring/queries";

const idSchema = z.string().uuid();

export async function createResume(input: { title: string }) {
  const user = await requireUser();
  await getOrCreateProfile(user);
  const title = resumeTitleSchema.parse(input.title);
  const entitlements = await getEntitlements(user.id);

  if (!entitlements.canCreateResume) {
    throw new LimitReachedError("resume");
  }

  const id = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);

    const [countRow] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(resumes)
      .where(eq(resumes.userId, user.id));

    if (!entitlements.isPro && (countRow?.count ?? 0) >= 1) {
      throw new LimitReachedError("resume");
    }

    const [created] = await tx
      .insert(resumes)
      .values({
        userId: user.id,
        title,
        content: createEmptyResumeContent(),
      })
      .returning({ id: resumes.id });

    return created.id;
  });

  revalidatePath("/dashboard");
  return { id };
}

export async function renameResume(input: { id: string; title: string }) {
  const user = await requireUser();
  const id = idSchema.parse(input.id);
  const title = resumeTitleSchema.parse(input.title);

  const updated = await db
    .update(resumes)
    .set({ title, updatedAt: new Date() })
    .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)))
    .returning({ id: resumes.id });

  if (updated.length === 0) {
    throw new NotFoundError("Resume not found");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/resume/${id}`);
}

export async function deleteResume(input: { id: string }) {
  const user = await requireUser();
  const id = idSchema.parse(input.id);

  const deleted = await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)))
    .returning({ id: resumes.id });

  if (deleted.length === 0) {
    throw new NotFoundError("Resume not found");
  }

  revalidatePath("/dashboard");
}

export async function saveResume(input: {
  id: string;
  content: unknown;
  version: number;
}) {
  const user = await requireUser();
  const id = idSchema.parse(input.id);
  const content = resumeContentSchema.parse(input.content);
  const version = z.number().int().min(0).parse(input.version);

  const [updated] = await db
    .update(resumes)
    .set({
      content,
      version: sql`${resumes.version} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(resumes.id, id),
        eq(resumes.userId, user.id),
        eq(resumes.version, version),
      ),
    )
    .returning({ version: resumes.version });

  if (!updated) {
    await getResumeForUser(user.id, id);
    throw new ConflictError(
      "This resume was updated in another tab. Reload the latest version before saving.",
    );
  }

  return { version: updated.version };
}

export async function applyTailoring(input: {
  runId: string;
  selectedIds: string[];
}) {
  const user = await requireUser();
  const runId = idSchema.parse(input.runId);
  const selectedIds = z.array(z.string().min(1).max(200)).max(10).parse(input.selectedIds);

  const run = await getTailoringRunForUser(user.id, runId);
  if (run.status === "applied") {
    throw new ConflictError("These suggestions were already applied.");
  }

  const suggestions = readSuggestions(run.suggestions);
  if (!suggestions) {
    throw new ValidationError("There are no suggestions to apply.");
  }

  const resume = await getResumeForUser(user.id, run.resumeId);
  const content = parseResumeContent(resume.content);
  const selected = new Set(selectedIds);

  if (selected.has("summary")) {
    content.summary = suggestions.summary.suggested;
  }

  for (const suggestion of suggestions.bullets) {
    if (!selected.has(suggestion.id)) continue;
    const [entryId, indexRaw] = suggestion.id.split(":");
    const index = Number(indexRaw);
    const entry = content.experience.find((item) => item.id === entryId);
    if (!entry || !Number.isInteger(index) || index < 0) continue;
    if (index >= entry.bullets.length) continue;
    // Skip suggestions whose source bullet changed after the analysis ran.
    if (entry.bullets[index]?.trim() !== suggestion.original.trim()) continue;
    entry.bullets[index] = suggestion.suggested;
  }

  const parsed = resumeContentSchema.parse(content);

  const result = await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(resumes)
      .set({
        content: parsed,
        version: sql`${resumes.version} + 1`,
        updatedAt: new Date(),
      })
      .where(and(eq(resumes.id, run.resumeId), eq(resumes.userId, user.id)))
      .returning({ version: resumes.version });

    if (!updated) {
      throw new NotFoundError("Resume not found");
    }

    await tx
      .update(tailoringRuns)
      .set({ status: "applied", updatedAt: new Date() })
      .where(
        and(
          eq(tailoringRuns.id, run.id),
          eq(tailoringRuns.userId, user.id),
        ),
      );

    return updated;
  });

  revalidatePath(`/resume/${run.resumeId}`);
  return { content: parsed, version: result.version };
}
