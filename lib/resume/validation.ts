import { z } from "zod";
import { resumeContentSchema, resumeTitleSchema } from "./schema";

export const resumeIdSchema = z.string().uuid();

export const templateSchema = z.enum(["modern", "classic", "editorial"]);

export const densitySchema = z.enum(["compact", "comfortable", "airy"]);

export const accentSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Accent colors must be hex values");

export const lastTailoredForSchema = z.object({
  role: z.string().max(200),
  company: z.string().max(200),
  matchedAt: z.string().datetime(),
});

export const saveResumeInputSchema = z.object({
  id: resumeIdSchema,
  title: resumeTitleSchema,
  targetRole: z.string().max(200),
  template: templateSchema,
  accent: accentSchema,
  density: densitySchema,
  content: resumeContentSchema,
  version: z.number().int().min(0),
  lastTailoredFor: lastTailoredForSchema.nullable().optional(),
});

export type SaveResumeInput = z.infer<typeof saveResumeInputSchema>;
