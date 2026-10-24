import {
  EMAIL_PATTERN,
  FIRST_PERSON_PRONOUNS,
  hasNumber,
  startsWithActionVerb,
} from "@/lib/score/rules";
import type { DemoResumeContent } from "./types";
import { splitSkills } from "./format";

export type DemoScoreCheck = {
  id: string;
  label: string;
  description: string;
  passed: boolean;
  fixTarget: "personal" | "summary" | "experience" | "education" | "skills" | "preview";
  hint: string;
};

export type DemoScore = {
  score: number;
  passed: number;
  total: number;
  checks: DemoScoreCheck[];
  label: string;
};

export function computeDemoScore(
  content: DemoResumeContent,
  pageCount = 1,
): DemoScore {
  const experience = content.experience.filter(
    (entry) => entry.title.trim() && entry.company.trim(),
  );
  const bullets = experience.flatMap((entry) =>
    entry.bullets.map((bullet) => bullet.trim()).filter(Boolean),
  );
  const rolesWithTwoBullets = experience.filter(
    (entry) => entry.bullets.filter((bullet) => bullet.trim()).length >= 2,
  );
  const actionBullets = bullets.filter(startsWithActionVerb);
  const rolesWithNumbers = experience.filter((entry) =>
    entry.bullets.some((bullet) => hasNumber(bullet)),
  );
  const skills = splitSkills(content.skills);
  const contactComplete =
    content.contact.fullName.trim().length > 0 &&
    EMAIL_PATTERN.test(content.contact.email.trim()) &&
    content.contact.phone.replace(/\D/g, "").length >= 7;
  const dateEntries = [
    ...content.experience.map((entry) => ({
      complete: Boolean(entry.startDate) && (entry.current || Boolean(entry.endDate)),
    })),
    ...content.education.map((entry) => ({
      complete: Boolean(entry.startDate) && Boolean(entry.endDate),
    })),
    ...content.projects.map((entry) => ({
      complete: Boolean(entry.startDate) && Boolean(entry.endDate),
    })),
  ];
  const datesComplete =
    dateEntries.length > 0 && dateEntries.every((entry) => entry.complete);
  const searchableText = [
    content.summary,
    ...content.experience.flatMap((entry) => entry.bullets),
    ...content.projects.flatMap((entry) => entry.bullets),
    ...content.education.flatMap((entry) => [entry.coursework, entry.honors]),
  ]
    .filter(Boolean)
    .join(" ");
  const noPronouns = !FIRST_PERSON_PRONOUNS.test(searchableText);
  const summaryReady = content.summary.trim().length >= 40;

  const checks: DemoScoreCheck[] = [
    {
      id: "contact",
      label: "Contact details are complete",
      description: "A recruiter can reach you without hunting.",
      passed: contactComplete,
      fixTarget: "personal",
      hint: contactComplete
        ? "Name, email, and phone are present."
        : "Add your name, a valid email, and a phone number.",
    },
    {
      id: "summary",
      label: "Summary earns the first scan",
      description: "A short, specific opening is faster to read.",
      passed: summaryReady,
      fixTarget: "summary",
      hint: summaryReady
        ? "Your summary has enough substance."
        : "Write at least two sentences about your focus.",
    },
    {
      id: "experience",
      label: "Experience section is present",
      description: "At least one role gives the page a spine.",
      passed: experience.length > 0,
      fixTarget: "experience",
      hint:
        experience.length > 0
          ? `${experience.length} role${experience.length === 1 ? "" : "s"} included.`
          : "Add a role, internship, or freelance project.",
    },
    {
      id: "bullets",
      label: "Each role has two or more bullets",
      description: "Two strong details beat five vague lines.",
      passed:
        experience.length > 0 && rolesWithTwoBullets.length === experience.length,
      fixTarget: "experience",
      hint:
        experience.length === 0
          ? "Add experience first."
          : `${rolesWithTwoBullets.length} of ${experience.length} roles have 2+ bullets.`,
    },
    {
      id: "verbs",
      label: "Bullets open with action verbs",
      description: "Lead with what you did, not what was assigned.",
      passed:
        bullets.length > 0 &&
        actionBullets.length / Math.max(bullets.length, 1) >= 0.8,
      fixTarget: "experience",
      hint:
        bullets.length === 0
          ? "Add bullets to your roles."
          : `${actionBullets.length} of ${bullets.length} bullets start with a strong verb.`,
    },
    {
      id: "numbers",
      label: "Impact is quantified",
      description: "Numbers give the reader a way to weigh your work.",
      passed:
        experience.length > 0 &&
        rolesWithNumbers.length / Math.max(experience.length, 1) >= 0.5,
      fixTarget: "experience",
      hint:
        experience.length === 0
          ? "Add measurable outcomes to your roles."
          : `${rolesWithNumbers.length} of ${experience.length} roles include a metric.`,
    },
    {
      id: "skills",
      label: "Five or more skills are listed",
      description: "Give keyword-matching systems something concrete.",
      passed: skills.length >= 5,
      fixTarget: "skills",
      hint: `${skills.length} skill${skills.length === 1 ? "" : "s"} listed.`,
    },
    {
      id: "length",
      label: "Fits within two pages",
      description: "Editing is strongest when it has a boundary.",
      passed: pageCount <= 2,
      fixTarget: "preview",
      hint: `${pageCount} page${pageCount === 1 ? "" : "s"} estimated from preview.`,
    },
    {
      id: "dates",
      label: "Every entry has dates",
      description: "A clear timeline is easier to trust.",
      passed: datesComplete,
      fixTarget: "experience",
      hint: datesComplete
        ? "Every timeline is complete."
        : "At least one entry is missing a start or end date.",
    },
    {
      id: "pronouns",
      label: "No first-person pronouns",
      description: "Resume language reads cleanest without I, me, or we.",
      passed: noPronouns,
      fixTarget: "summary",
      hint: noPronouns
        ? "No first-person language found."
        : "Remove I, me, my, we, our, or us.",
    },
  ];

  const passed = checks.filter((check) => check.passed).length;
  const score = passed * 10;
  const label =
    score >= 90
      ? "Ready to share"
      : score >= 70
        ? "Almost there"
        : score >= 40
          ? "Taking shape"
          : "Needs a little work";

  return { score, passed, total: checks.length, checks, label };
}
