"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { getEntitlements } from "@/lib/billing/entitlements";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import {
  ConflictError,
  LimitReachedError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import {
  createEmptyResumeContent,
  createSampleResumeContent,
} from "@/lib/resume/defaults";
import {
  resumeContentSchema,
  resumeTitleSchema,
  type ResumeContent,
} from "@/lib/resume/schema";
import {
  resumeIdSchema,
  saveResumeInputSchema,
  templateSchema,
} from "@/lib/resume/validation";
import { getResumeRow, toResumeRecord } from "@/lib/workspace";

const createInputSchema = z.object({
  title: resumeTitleSchema,
  template: templateSchema.default("modern"),
  startWithExample: z.boolean().optional().default(false),
});

const duplicateInputSchema = z.object({
  id: resumeIdSchema,
});

const renameInputSchema = z.object({
  id: resumeIdSchema,
  title: resumeTitleSchema,
});

const templateDefaults = {
  modern: { accent: "#416af5", density: "comfortable" as const },
  classic: { accent: "#313e55", density: "compact" as const },
  editorial: { accent: "#916af7", density: "airy" as const },
};

function txid() {
  return sql<string>`pg_current_xact_id()::text`;
}

export async function createResume(input: {
  title: string;
  template?: "modern" | "classic" | "editorial";
  startWithExample?: boolean;
}) {
  const user = await requireUser();
  await getOrCreateProfile(user);
  const parsed = createInputSchema.parse(input);
  const entitlements = await getEntitlements(user.id);

  if (!entitlements.canCreateResume) {
    throw new LimitReachedError("resume");
  }

  const defaults = templateDefaults[parsed.template];
  const content = parsed.startWithExample
    ? createSampleResumeContent()
    : createEmptyResumeContent();

  const created = await db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtext(${user.id}))`);

    const [countRow] = await tx
      .select({ count: sql<number>`count(*)::int` })
      .from(resumes)
      .where(eq(resumes.userId, user.id));

    if (!entitlements.isPro && (countRow?.count ?? 0) >= 1) {
      throw new LimitReachedError("resume");
    }

    const [row] = await tx
      .insert(resumes)
      .values({
        userId: user.id,
        title: parsed.title,
        targetRole: content.contact.headline || "",
        template: parsed.template,
        accent: defaults.accent,
        density: defaults.density,
        content,
      })
      .returning({ id: resumes.id, txid: txid() });

    return row;
  });

  const row = await getResumeRow(user.id, created.id);
  if (!row) {
    throw new NotFoundError("Resume not found after creation");
  }

  revalidatePath("/dashboard");
  return { resume: toResumeRecord(row), txid: created.txid };
}

export async function renameResume(input: { id: string; title: string }) {
  const user = await requireUser();
  const parsed = renameInputSchema.parse(input);

  const [updated] = await db
    .update(resumes)
    .set({ title: parsed.title, updatedAt: new Date() })
    .where(and(eq(resumes.id, parsed.id), eq(resumes.userId, user.id)))
    .returning({ id: resumes.id, txid: txid() });

  if (!updated) {
    throw new NotFoundError("Resume not found");
  }

  revalidatePath("/dashboard");
  revalidatePath(`/resume/${parsed.id}`);
  return { id: updated.id, txid: updated.txid };
}

export async function deleteResume(input: { id: string }) {
  const user = await requireUser();
  const { id } = duplicateInputSchema.parse(input);

  const [deleted] = await db
    .delete(resumes)
    .where(and(eq(resumes.id, id), eq(resumes.userId, user.id)))
    .returning({ id: resumes.id, txid: txid() });

  if (!deleted) {
    throw new NotFoundError("Resume not found");
  }

  revalidatePath("/dashboard");
  return { id: deleted.id, txid: deleted.txid };
}

export async function duplicateResume(input: { id: string }) {
  const user = await requireUser();
  const { id } = duplicateInputSchema.parse(input);
  const entitlements = await getEntitlements(user.id);

  if (!entitlements.canCreateResume) {
    throw new LimitReachedError("resume");
  }

  const source = await getResumeRow(user.id, id);
  if (!source) {
    throw new NotFoundError("Resume not found");
  }

  const [copy] = await db
    .insert(resumes)
    .values({
      userId: user.id,
      title: `${source.title} — Copy`,
      targetRole: source.targetRole,
      template: source.template,
      accent: source.accent,
      density: source.density,
      lastTailoredFor: source.lastTailoredFor,
      content: source.content,
    })
    .returning({ id: resumes.id, txid: txid() });

  const row = await getResumeRow(user.id, copy.id);
  if (!row) {
    throw new NotFoundError("Resume not found after duplication");
  }

  revalidatePath("/dashboard");
  return { resume: toResumeRecord(row), txid: copy.txid };
}

export async function saveResume(input: {
  id: string;
  title: string;
  targetRole: string;
  template: string;
  accent: string;
  density: string;
  content: unknown;
  version: number;
  lastTailoredFor?: unknown;
}) {
  const user = await requireUser();
  const parsed = saveResumeInputSchema.parse(input);

  const [updated] = await db
    .update(resumes)
    .set({
      title: parsed.title,
      targetRole: parsed.targetRole,
      template: parsed.template,
      accent: parsed.accent,
      density: parsed.density,
      lastTailoredFor: parsed.lastTailoredFor ?? null,
      content: parsed.content,
      version: sql`${resumes.version} + 1`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(resumes.id, parsed.id),
        eq(resumes.userId, user.id),
        eq(resumes.version, parsed.version),
      ),
    )
    .returning({ txid: txid() });

  if (!updated) {
    const current = await getResumeRow(user.id, parsed.id);
    if (!current) {
      throw new NotFoundError("Resume not found");
    }
    throw new ConflictError(
      "This resume was updated in another tab. Reload the latest version before saving.",
    );
  }

  const row = await getResumeRow(user.id, parsed.id);
  if (!row) {
    throw new NotFoundError("Resume not found");
  }

  return { resume: toResumeRecord(row), txid: updated.txid };
}

/** Kept for callers that want to validate a full document before saving. */
export async function validateResumeContent(input: unknown): Promise<ResumeContent> {
  const parsed = resumeContentSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError("The resume content is invalid");
  }
  return parsed.data;
}
