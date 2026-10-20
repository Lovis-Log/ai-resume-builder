import type { ResumeContent } from "./schema";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatMonth(value: string): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return "";
  const [year, month] = value.split("-").map(Number);
  return MONTH_FORMATTER.format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatDateRange(
  startDate: string,
  endDate: string | null,
  current: boolean,
): string {
  const start = formatMonth(startDate);
  const end = current ? "Present" : formatMonth(endDate ?? "");
  if (!start && !end) return "";
  if (!start) return end;
  if (!end) return start;
  return `${start} – ${end}`;
}

export function splitSkills(skills: string): string[] {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

export function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

export function resumeText(content: ResumeContent): string {
  const parts: string[] = [
    content.contact.fullName,
    content.contact.email,
    content.contact.phone,
    content.contact.location,
    content.summary,
    content.skills,
  ];

  for (const entry of content.experience) {
    parts.push(entry.title, entry.company, entry.location, ...entry.bullets);
  }
  for (const entry of content.education) {
    parts.push(
      entry.school,
      entry.degree,
      entry.major,
      entry.location,
      entry.gpa,
      entry.coursework,
      entry.honors,
    );
  }
  for (const entry of content.projects) {
    parts.push(entry.name, entry.link, ...entry.bullets);
  }

  return parts.filter(Boolean).join("\n");
}

export function sanitizeFilename(value: string): string {
  const cleaned = value
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "resume";
}

export function resumeFilename(fullName: string): string {
  const name = sanitizeFilename(fullName || "resume");
  return `${name}-Resume.pdf`;
}
