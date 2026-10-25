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

/** Studio variant where an empty end date is represented by "". */
export function formatRange(
  startDate: string,
  endDate: string,
  current: boolean,
): string {
  return formatDateRange(startDate, endDate, current);
}

const shortDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  timeZone: "UTC",
});

const longDateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export function formatUpdated(iso: string, now = new Date().toISOString()): string {
  const date = new Date(iso);
  const reference = new Date(now);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diff = reference.getTime() - date.getTime();
  const minute = 60_000;
  const hour = 60 * minute;

  if (diff < 2 * minute) return "Just now";
  if (diff < hour) return `${Math.max(1, Math.round(diff / minute))} min ago`;
  if (diff < 6 * hour) return `${Math.round(diff / hour)} hr ago`;
  if (diff < 24 * hour) return "Earlier today";
  if (diff < 48 * hour) return "Yesterday";
  return shortDateFormatter.format(date);
}

export function formatLongDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return longDateFormatter.format(date);
}

export function formatShortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return shortDateFormatter.format(date);
}

export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "L";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function fileStem(value: string): string {
  const cleaned = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleaned || "lume-resume";
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
