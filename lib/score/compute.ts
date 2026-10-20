import { splitSkills } from "@/lib/resume/format";
import type { ResumeContent } from "@/lib/resume/schema";
import {
  EMAIL_PATTERN,
  FIRST_PERSON_PRONOUNS,
  hasNumber,
  startsWithActionVerb,
} from "./rules";

export type ScoreCheckId =
  | "contact"
  | "summary"
  | "experience"
  | "bullets"
  | "action-verbs"
  | "numbers"
  | "skills"
  | "pages"
  | "dates"
  | "pronouns";

export type ScoreCheck = {
  id: ScoreCheckId;
  label: string;
  description: string;
  passed: boolean;
  weight: number;
  fixTarget: string;
  detail: string;
};

export type ScoreResult = {
  score: number;
  passed: number;
  total: number;
  checks: ScoreCheck[];
};

const WEIGHT = 10;

export function computeScore(content: ResumeContent, pageCount: number): ScoreResult {
  const checks: ScoreCheck[] = [];

  const contactComplete =
    content.contact.fullName.trim().length > 0 &&
    EMAIL_PATTERN.test(content.contact.email.trim()) &&
    content.contact.phone.replace(/\D/g, "").length >= 7;
  checks.push({
    id: "contact",
    label: "Contact info",
    description: "Add your name, a valid email, and a phone number.",
    passed: contactComplete,
    weight: WEIGHT,
    fixTarget: "#contact",
    detail: contactComplete
      ? "Name, email, and phone are present."
      : "Name, email, and phone are required.",
  });

  const summaryPresent = content.summary.trim().length >= 20;
  checks.push({
    id: "summary",
    label: "Summary present",
    description: "Write 2–3 sentences about what you bring.",
    passed: summaryPresent,
    weight: WEIGHT,
    fixTarget: "#summary",
    detail: summaryPresent ? "Summary is present." : "Add a short professional summary.",
  });

  const filledExperience = content.experience.filter(
    (entry) => entry.title.trim() && entry.company.trim(),
  );
  const experiencePresent = filledExperience.length > 0;
  checks.push({
    id: "experience",
    label: "Experience present",
    description: "Add at least one role, internship, or relevant experience.",
    passed: experiencePresent,
    weight: WEIGHT,
    fixTarget: "#experience",
    detail: experiencePresent
      ? `${filledExperience.length} experience entr${filledExperience.length === 1 ? "y" : "ies"}.`
      : "Add a role with a title and company.",
  });

  const entriesWithTwoBullets = filledExperience.filter(
    (entry) => entry.bullets.filter((bullet) => bullet.trim()).length >= 2,
  );
  const bulletsPass =
    experiencePresent && entriesWithTwoBullets.length === filledExperience.length;
  checks.push({
    id: "bullets",
    label: "2+ bullets per job",
    description: "Give every role at least two achievement bullets.",
    passed: bulletsPass,
    weight: WEIGHT,
    fixTarget: "#experience",
    detail: experiencePresent
      ? `${entriesWithTwoBullets.length} of ${filledExperience.length} roles have 2+ bullets.`
      : "Add experience before adding bullets.",
  });

  const allBullets = content.experience.flatMap((entry) =>
    entry.bullets.map((bullet) => bullet.trim()).filter(Boolean),
  );
  const actionBullets = allBullets.filter(startsWithActionVerb);
  const actionPass =
    allBullets.length > 0 && actionBullets.length / allBullets.length >= 0.8;
  checks.push({
    id: "action-verbs",
    label: "Action verbs",
    description: "Start bullets with verbs like built, led, improved, or analyzed.",
    passed: actionPass,
    weight: WEIGHT,
    fixTarget: "#experience",
    detail:
      allBullets.length === 0
        ? "Add bullets with strong action verbs."
        : `${actionBullets.length} of ${allBullets.length} bullets start with an action verb.`,
  });

  const entriesWithNumbers = filledExperience.filter((entry) =>
    entry.bullets.some((bullet) => hasNumber(bullet)),
  );
  const numbersPass =
    filledExperience.length > 0 &&
    entriesWithNumbers.length / filledExperience.length >= 0.5;
  checks.push({
    id: "numbers",
    label: "Numbers in bullets",
    description: "Quantify impact with numbers, percentages, or dollar amounts.",
    passed: numbersPass,
    weight: WEIGHT,
    fixTarget: "#experience",
    detail:
      filledExperience.length === 0
        ? "Add experience with measurable impact."
        : `${entriesWithNumbers.length} of ${filledExperience.length} roles include a number.`,
  });

  const skills = splitSkills(content.skills);
  const skillsPass = skills.length >= 5;
  checks.push({
    id: "skills",
    label: "5+ skills",
    description: "List at least five relevant skills, separated by commas.",
    passed: skillsPass,
    weight: WEIGHT,
    fixTarget: "#skills",
    detail: `${skills.length} skill${skills.length === 1 ? "" : "s"} listed.`,
  });

  const normalizedPages = Math.max(1, pageCount);
  const pagesPass = normalizedPages <= 2;
  checks.push({
    id: "pages",
    label: "1–2 pages",
    description: "Keep the resume to one or two pages.",
    passed: pagesPass,
    weight: WEIGHT,
    fixTarget: "#preview",
    detail: `Estimated length: ${normalizedPages} page${normalizedPages === 1 ? "" : "s"}.`,
  });

  const datedExperience = content.experience.every(
    (entry) => entry.startDate && (entry.current || entry.endDate),
  );
  const datedEducation = content.education.every(
    (entry) => entry.startDate && entry.endDate,
  );
  const datedProjects = content.projects.every(
    (entry) => entry.startDate && entry.endDate,
  );
  const hasDatedEntries =
    content.experience.length + content.education.length + content.projects.length > 0;
  const datesPass = hasDatedEntries && datedExperience && datedEducation && datedProjects;
  checks.push({
    id: "dates",
    label: "Dates present",
    description: "Add start and end dates for every entry.",
    passed: datesPass,
    weight: WEIGHT,
    fixTarget: "#experience",
    detail: datesPass
      ? "All entries have dates."
      : "At least one entry is missing dates.",
  });

  const searchableText = [
    content.summary,
    ...content.experience.flatMap((entry) => entry.bullets),
    ...content.projects.flatMap((entry) => entry.bullets),
    ...content.education.flatMap((entry) => [entry.coursework, entry.honors]),
  ]
    .filter(Boolean)
    .join(" ");
  const pronounsPass = !FIRST_PERSON_PRONOUNS.test(searchableText);
  checks.push({
    id: "pronouns",
    label: "No first-person pronouns",
    description: "Remove I, me, my, we, our, and us from resume text.",
    passed: pronounsPass,
    weight: WEIGHT,
    fixTarget: "#summary",
    detail: pronounsPass ? "No first-person pronouns found." : "First-person pronouns found.",
  });

  const passed = checks.filter((check) => check.passed).length;
  return {
    score: passed * WEIGHT,
    passed,
    total: checks.length,
    checks,
  };
}
