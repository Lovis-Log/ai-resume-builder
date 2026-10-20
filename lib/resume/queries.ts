import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { resumes } from "@/lib/db/schema";
import { NotFoundError } from "@/lib/errors";
import { resumeContentSchema, type ResumeContent } from "./schema";

export async function listResumes(userId: string) {
  return db
    .select({
      id: resumes.id,
      title: resumes.title,
      updatedAt: resumes.updatedAt,
      createdAt: resumes.createdAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, userId))
    .orderBy(desc(resumes.updatedAt));
}

export async function getResumeForUser(userId: string, resumeId: string) {
  const [row] = await db
    .select()
    .from(resumes)
    .where(and(eq(resumes.id, resumeId), eq(resumes.userId, userId)))
    .limit(1);

  if (!row) {
    throw new NotFoundError("Resume not found");
  }

  return row;
}

export function parseResumeContent(content: unknown): ResumeContent {
  return resumeContentSchema.parse(content);
}
