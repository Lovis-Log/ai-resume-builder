import { splitSkills } from "./format";
import type { DemoResume } from "./types";

export type AiSummaryStyle = "measured" | "concise" | "impact";

export const AI_SUMMARY_STYLES: {
  id: AiSummaryStyle;
  label: string;
  description: string;
}[] = [
  {
    id: "measured",
    label: "Measured",
    description: "Warm, specific, and calm.",
  },
  {
    id: "concise",
    label: "Concise",
    description: "Two short, high-signal sentences.",
  },
  {
    id: "impact",
    label: "Impact-led",
    description: "Lead with the outcomes.",
  },
];

function yearsOfExperience(resume: DemoResume): string {
  const roles = resume.content.experience.filter((entry) => !entry.current);
  if (resume.content.experience.length >= 3 || roles.length >= 2) {
    return "four years";
  }
  if (resume.content.experience.length >= 1) return "hands-on";
  return "early-career";
}

function firstMetric(resume: DemoResume): string | null {
  const bullets = resume.content.experience.flatMap((entry) => entry.bullets);
  return (
    bullets.find((bullet) => /\d/.test(bullet))?.replace(/\.$/, "") ?? null
  );
}

export function mockSummary(
  resume: DemoResume,
  style: AiSummaryStyle,
): string {
  const role =
    resume.targetRole ||
    resume.content.contact.headline ||
    "Product designer";
  const years = yearsOfExperience(resume);
  const skills = splitSkills(resume.content.skills);
  const strength = [...skills].slice(0, 3).join(", ");
  const metric = firstMetric(resume);
  const experiencePhrase =
    years === "early-career"
      ? "Early-career experience"
      : years === "hands-on"
        ? "Hands-on experience"
        : "Four years of experience";

  if (style === "concise") {
    return `${role} focused on clear, accessible product experiences. ${experiencePhrase} across research, interaction design, and systems thinking, with engineering close at hand.`;
  }

  if (style === "impact") {
    if (metric) {
      const clause = metric
        .replace(/^(Led|Built|Designed|Created|Improved|Redesigned)\s+/i, "")
        .replace(/^./, (letter) => letter.toLowerCase());
      return `${role} with a record of shipping work that moves the measure: ${clause}. Brings a careful research habit and systems thinking to complex product problems, without losing the human detail.`;
    }
    return `${role} who starts with the user's real problem and finishes with a result the team can measure. ${strength ? `Works fluently across ${strength}, ` : ""}and brings clarity to complex product decisions.`;
  }

  return `${role} with ${years === "early-career" ? "early-career experience" : `${years} of experience`} turning complex workflows into clear, human interfaces. ${
    metric ? `${metric.replace(/^./, (letter) => letter.toUpperCase())}. ` : ""
  }Brings engineering and research into the same conversation, with a high bar for craft and accessibility.`;
}

const bulletRewrites: Record<string, string> = {
  "Led end-to-end redesign of a B2B analytics platform used by 40,000+ customers.":
    "Directed an end-to-end redesign of a 40,000-customer analytics platform, aligning product, research, and engineering around one clear experience.",
  "Built a 68-component design system adopted by 6 product teams, cutting design QA time by 32%.":
    "Scaled a 68-component design system across six product teams, reducing design QA time by 32%.",
  "Partnered with researchers on 24 usability sessions to lift onboarding completion from 61% to 78%.":
    "Turned 24 usability sessions into onboarding changes that raised completion from 61% to 78%.",
  "Designed and shipped mobile onboarding flows for 12 early-stage products.":
    "Shipped mobile onboarding flows for 12 early-stage products, from first concept to release.",
  "Created a lightweight research playbook that reduced concept testing time by two weeks.":
    "Standardized concept testing in a lightweight research playbook, trimming turnaround by two weeks.",
  "Redesigned the search experience, increasing task completion by 22%.":
    "Reworked search around observed user behavior, increasing task completion by 22%.",
  "Documented interaction specs for a 4-person engineering team.":
    "Documented interaction specs that kept a four-person engineering team aligned through delivery.",
  "Created a neighborhood skill-sharing platform focused on low-bandwidth access.":
    "Built a neighborhood skill-sharing platform designed for low-bandwidth access.",
  "Improved first-session task success from 54% to 81% across 18 usability tests.":
    "Raised first-session task success from 54% to 81% across 18 usability tests.",
};

export function mockImprovedBullet(
  bullet: string,
  role: string,
  company: string,
): string {
  const normalized = bullet.trim();
  if (!normalized) return "";
  if (bulletRewrites[normalized]) return bulletRewrites[normalized];

  let next = normalized
    .replace(/^Worked on\s+/i, "Delivered ")
    .replace(/^Helped\s+/i, "Supported ")
    .replace(/^Responsible for\s+/i, "Owned ")
    .replace(/^I\s+/i, "")
    .replace(/^We\s+/i, "")
    .replace(/\s+/g, " ");

  if (!/^[A-Z]/.test(next)) {
    next = next.charAt(0).toUpperCase() + next.slice(1);
  }

  if (next === normalized) {
    const context = company ? ` at ${company}` : "";
    next = `${next.replace(/\.$/, "")}${context}, with a clear focus on measurable product outcomes.`;
  }

  if (role && /\b(my|our)\b/i.test(next)) {
    next = next.replace(/\b(my|our)\b/gi, "the");
  }

  return next;
}

export function nextTargetExperienceLabel(
  role: string,
  company: string,
): string {
  return [role, company].filter(Boolean).join(" at ");
}
