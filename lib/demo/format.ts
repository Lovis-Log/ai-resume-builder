import { DEMO_NOW } from "./seed";

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

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

export function formatMonth(value: string): string {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return "";
  const [year, month] = value.split("-").map(Number);
  return monthFormatter.format(new Date(Date.UTC(year, month - 1, 1)));
}

export function formatRange(
  startDate: string,
  endDate: string,
  current: boolean,
): string {
  const start = formatMonth(startDate);
  const end = current ? "Present" : formatMonth(endDate);
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

export function formatUpdated(iso: string, now = DEMO_NOW): string {
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
