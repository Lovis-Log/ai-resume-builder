import { z } from "zod";

const shortText = z.string().max(200);
const monthValue = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Use YYYY-MM")
  .or(z.literal(""));

export const contactSchema = z.object({
  fullName: shortText,
  headline: shortText.default(""),
  // Allow partial input while autosaving. The score checks email validity.
  email: z.string().max(200),
  phone: shortText,
  location: shortText,
  website: z.string().max(200).default(""),
});

export const experienceEntrySchema = z.object({
  id: z.string().min(1).max(100),
  title: shortText,
  company: shortText,
  location: shortText,
  startDate: monthValue,
  endDate: monthValue.nullable().transform((value) => value ?? ""),
  current: z.boolean(),
  bullets: z.array(z.string().max(500)).max(10),
});

export const educationEntrySchema = z.object({
  id: z.string().min(1).max(100),
  school: shortText,
  degree: shortText,
  // Kept for older exports and the PDF renderer; the studio UI omits it.
  major: shortText.default(""),
  location: shortText,
  startDate: monthValue,
  endDate: monthValue.nullable().transform((value) => value ?? ""),
  gpa: z.string().max(20),
  coursework: z.string().max(1000),
  honors: z.string().max(1000),
});

export const projectEntrySchema = z.object({
  id: z.string().min(1).max(100),
  name: shortText,
  link: z.string().max(500),
  startDate: monthValue,
  endDate: monthValue.nullable().transform((value) => value ?? ""),
  bullets: z.array(z.string().max(500)).max(10),
});

export const resumeContentSchema = z.object({
  contact: contactSchema,
  summary: z.string().max(2000),
  experience: z.array(experienceEntrySchema).max(20),
  education: z.array(educationEntrySchema).max(10),
  projects: z.array(projectEntrySchema).max(10),
  skills: z.string().max(1000),
});

export type Contact = z.infer<typeof contactSchema>;
export type ExperienceEntry = z.infer<typeof experienceEntrySchema>;
export type EducationEntry = z.infer<typeof educationEntrySchema>;
export type ProjectEntry = z.infer<typeof projectEntrySchema>;
export type ResumeContent = z.infer<typeof resumeContentSchema>;

export const resumeTitleSchema = z.string().trim().min(1, "Give the resume a name").max(120);
export const jobDescriptionSchema = z
  .string()
  .trim()
  .min(40, "Paste a longer job description")
  .max(10_000, "Job descriptions are limited to 10,000 characters");
export const idempotencyKeySchema = z.string().uuid();
