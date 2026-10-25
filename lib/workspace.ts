import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getEntitlements } from "@/lib/billing/entitlements";
import { db } from "@/lib/db";
import { profiles, resumes } from "@/lib/db/schema";
import type { CurrentUser } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { initialsFromName } from "@/lib/resume/format";
import type {
  Density,
  ResumeRecord,
  TemplateId,
  WorkspaceProfile,
} from "@/lib/resume/types";
import { parseResumeContent } from "@/lib/resume/queries";

export type ResumeRow = typeof resumes.$inferSelect;

export function toResumeRecord(row: ResumeRow): ResumeRecord {
  return {
    id: row.id,
    title: row.title,
    targetRole: row.targetRole,
    template: row.template as TemplateId,
    accent: row.accent,
    density: row.density as Density,
    content: parseResumeContent(row.content),
    version: row.version,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    lastTailoredFor: row.lastTailoredFor ?? undefined,
  };
}

export async function listResumeRows(userId: string) {
  return db
    .select()
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));
}

export async function getResumeRow(userId: string, resumeId: string) {
  const [row] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .limit(1);
  return row ?? null;
}

export async function getWorkspaceSnapshot(
  user: CurrentUser,
): Promise<{ profile: WorkspaceProfile; resumes: ResumeRecord[] }> {
  const profile = await getOrCreateProfile(user);
  const [entitlements, resumeRows] = await Promise.all([
    getEntitlements(user.id),
    listResumeRows(user.id),
  ]);

  return {
    profile: {
      id: profile.id,
      name: profile.name,
      firstName: profile.name.split(/\s+/)[0] || "there",
      email: profile.email,
      initials: initialsFromName(profile.name),
      avatarUrl: profile.avatarUrl,
      plan: entitlements.plan,
      aiUsed: entitlements.aiUsed,
      aiIncluded: entitlements.aiIncluded,
      renewsOn: entitlements.periodEnd?.toISOString() ?? null,
      memberSince: profile.createdAt.toISOString(),
      hasAiConsent: Boolean(profile.aiConsentAt),
      billingEnabled: entitlements.billingEnabled,
    },
    resumes: resumeRows.map(toResumeRecord),
  };
}

export async function getProfileRow(userId: string) {
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, userId))
    .limit(1);
  return profile ?? null;
}
