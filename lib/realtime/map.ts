import type {
  Density,
  LastTailoredFor,
  ResumeRecord,
  TemplateId,
} from "@/lib/resume/types";
import { resumeContentSchema } from "@/lib/resume/schema";

export type LiveResumeRow = {
  id: string;
  title: string;
  target_role: string;
  template: string;
  accent: string;
  density: string;
  last_tailored_for: LastTailoredFor | null;
  content: unknown;
  version: number;
  created_at_ms: string | number;
  updated_at_ms: string | number;
};

export function liveRowToRecord(row: LiveResumeRow): ResumeRecord {
  return {
    id: row.id,
    title: row.title,
    targetRole: row.target_role,
    template: row.template as TemplateId,
    accent: row.accent,
    density: row.density as Density,
    content: resumeContentSchema.parse(row.content),
    version: Number(row.version),
    createdAt: new Date(Number(row.created_at_ms)).toISOString(),
    updatedAt: new Date(Number(row.updated_at_ms)).toISOString(),
    lastTailoredFor: row.last_tailored_for ?? undefined,
  };
}
