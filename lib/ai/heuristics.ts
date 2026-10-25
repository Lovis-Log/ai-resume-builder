import type { ResumeContent } from "@/lib/resume/schema";
import type { AiSummaryStyle } from "./styles";

export type HeuristicKeyword = {
  term: string;
  importance: "high" | "medium" | "low";
  evidenceQuote: string;
};

const METRIC_PATTERN = /\d/;

const ACTION_VERBS = new Set([
  "led", "built", "designed", "created", "improved", "shipped", "launched",
  "delivered", "drove", "managed", "developed", "established", "scaled",
  "reduced", "increased", "transformed", "streamlined", "partnered",
  "collaborated", "owned", "directed", "produced", "implemented",
]);

const KEYWORD_LIBRARY = [
  "interaction design", "design systems", "user research", "prototyping",
  "accessibility", "product strategy", "data-informed design",
  "cross-functional collaboration", "design operations", "zero-to-one",
  "visual craft", "developer tools", "figma", "mentorship", "typescript",
  "javascript", "react", "next.js", "node.js", "postgres", "sql", "python",
  "java", "go", "rust", "kubernetes", "docker", "aws", "gcp", "azure",
  "machine learning", "data analysis", "product management", "analytics",
  "experimentation", "stakeholder management", "communication", "leadership",
  "project management", "agile", "ci/cd", "testing", "rest apis", "graphql",
  "tailwind", "css", "html", "git", "terraform", "observability",
];

function splitSkills(skills: string): string[] {
  return skills
    .split(",")
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function firstMetric(content: ResumeContent): string | null {
  for (const entry of content.experience) {
    for (const bullet of entry.bullets) {
      if (METRIC_PATTERN.test(bullet)) return bullet.trim().replace(/\.$/, "");
    }
  }
  return null;
}

function roleFor(content: ResumeContent, targetRole: string): string {
  if (targetRole.trim()) return targetRole.trim();
  if (content.contact.headline.trim()) return content.contact.headline.trim();
  return content.experience[0]?.title?.trim() || "early-career professional";
}

export function heuristicSummary(
  content: ResumeContent,
  targetRole: string,
  style: AiSummaryStyle,
): string {
  const role = roleFor(content, targetRole);
  const skills = splitSkills(content.skills).slice(0, 3).join(", ");
  const metric = firstMetric(content);
  const roleCount = content.experience.filter(
    (entry) => entry.title.trim() && entry.company.trim(),
  ).length;
  const experiencePhrase =
    roleCount >= 3
      ? "Several years of hands-on experience"
      : roleCount > 0
        ? "Hands-on experience"
        : "Early-career experience";

  if (style === "concise") {
    return `${role} focused on clear, useful work. ${experiencePhrase} across ${
      skills || "research, execution, and collaboration"
    }, with a habit of turning feedback into shipped improvements.`;
  }

  if (style === "impact") {
    const metricClause = metric
      ? `Recent work includes ${metric.replace(/^./, (letter) => letter.toLowerCase())}. `
      : "";
    return `${role} who starts with the real problem and finishes with a result the team can measure. ${metricClause}Brings ${
      skills || "product thinking, execution, and collaboration"
    } to complex work without losing the human detail.`;
  }

  return `${role} with ${experiencePhrase.toLowerCase()} turning complex problems into clear, considered outcomes. ${
    metric ? `${metric.replace(/^./, (letter) => letter.toUpperCase())}. ` : ""
  }Works closely with research and engineering, with a high bar for craft and accessibility.`;
}

export function heuristicBullet(bullet: string, company: string): string {
  let next = bullet.trim();

  next = next
    .replace(/^Worked on\s+/i, "Delivered ")
    .replace(/^Helped\s+/i, "Supported ")
    .replace(/^Responsible for\s+/i, "Owned ")
    .replace(/^Assisted with\s+/i, "Contributed to ")
    .replace(/^I\s+/i, "")
    .replace(/^We\s+/i, "")
    .replace(/\b(my|our)\b/gi, "the")
    .replace(/\s+/g, " ");

  if (!/^[A-Z]/.test(next)) {
    next = next.charAt(0).toUpperCase() + next.slice(1);
  }

  const first = next.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z-]/g, "") ?? "";
  if (next === bullet.trim() && !ACTION_VERBS.has(first)) {
    next = `Owned ${next.charAt(0).toLowerCase()}${next.slice(1)}`;
  }

  if (next === bullet.trim() && company) {
    next = `${next.replace(/\.$/, "")}, with a clear focus on measurable outcomes at ${company}.`;
  }

  return next;
}

export function heuristicKeywords(jobDescription: string): HeuristicKeyword[] {
  const haystack = jobDescription.toLowerCase();
  const matches = KEYWORD_LIBRARY.filter((term) => haystack.includes(term));

  if (matches.length < 6) {
    const words = haystack
      .replace(/[^a-z0-9+#./ -]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length >= 4 && !/^\d+$/.test(word));
    const counts = new Map<string, number>();
    for (const word of words) {
      if (["with", "that", "this", "from", "your", "will", "have", "years", "work", "team", "role", "and"].includes(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
    const extra = [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([word]) => word)
      .filter((word) => !matches.includes(word));
    matches.push(...extra.slice(0, 10 - matches.length));
  }

  return matches.slice(0, 10).map((term, index) => ({
    term: term.replace(/\b\w/g, (letter) => letter.toUpperCase()),
    importance: index < 5 ? "high" : "medium",
    evidenceQuote: jobDescription.slice(0, 80),
  }));
}

export function heuristicTailor(content: ResumeContent, jobDescription: string) {
  const firstLine = jobDescription.split("\n").map((line) => line.trim()).find(Boolean);
  const role = firstLine?.split("·")[0]?.trim() || roleFor(content, "");
  const keywords = heuristicKeywords(jobDescription)
    .slice(0, 3)
    .map((keyword) => keyword.term)
    .join(", ");

  const bullets: Array<{ id: string; suggested: string }> = [];
  for (const entry of content.experience) {
    entry.bullets.forEach((bullet, index) => {
      if (bullets.length >= 3) return;
      if (!bullet.trim()) return;
      bullets.push({
        id: `${entry.id}:${index}`,
        suggested: heuristicBullet(bullet, entry.company),
      });
    });
  }

  return {
    summary: {
      suggested: `${role} focused on clear, considered outcomes. Works across ${keywords || "research, execution, and collaboration"} with a habit of turning feedback into shipped improvements.`,
    },
    bullets,
  };
}
