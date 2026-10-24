import { mockImprovedBullet } from "./ai";
import type {
  DemoResume,
  TailorKeyword,
  TailorSuggestion,
} from "./types";

type Candidate = {
  term: string;
  pattern: RegExp;
  importance: "high" | "medium";
};

const CANDIDATES: Candidate[] = [
  { term: "Interaction design", pattern: /interaction design/i, importance: "high" },
  { term: "Design systems", pattern: /design systems?/i, importance: "high" },
  { term: "User research", pattern: /user research|research methods/i, importance: "high" },
  { term: "Prototyping", pattern: /prototyp/i, importance: "high" },
  { term: "Accessibility", pattern: /accessib/i, importance: "high" },
  { term: "Product strategy", pattern: /product strategy|product thinking/i, importance: "high" },
  { term: "Data-informed design", pattern: /data-informed|product data|analytics data/i, importance: "medium" },
  { term: "Cross-functional collaboration", pattern: /cross-functional/i, importance: "high" },
  { term: "Design operations", pattern: /design operations|design ops/i, importance: "medium" },
  { term: "Zero-to-one", pattern: /zero-to-one|0 to 1/i, importance: "medium" },
  { term: "Visual craft", pattern: /visual craft|polish/i, importance: "medium" },
  { term: "Developer tools", pattern: /developer tools|productivity tools/i, importance: "medium" },
  { term: "Figma", pattern: /figma/i, importance: "medium" },
  { term: "Mentorship", pattern: /mentor/i, importance: "medium" },
];

const FALLBACK_TERMS: {
  term: string;
  resumePattern: RegExp;
  importance: "high" | "medium";
}[] = [
  { term: "Interaction design", resumePattern: /interaction design|prototyp/i, importance: "high" },
  { term: "Design systems", resumePattern: /design system/i, importance: "high" },
  { term: "User research", resumePattern: /research|usability/i, importance: "high" },
  { term: "Prototyping", resumePattern: /prototyp/i, importance: "high" },
  { term: "Accessibility", resumePattern: /accessib/i, importance: "high" },
  { term: "Product strategy", resumePattern: /product strategy|strategy/i, importance: "medium" },
  { term: "Data-informed design", resumePattern: /data-informed|analytics|metric/i, importance: "medium" },
  { term: "Cross-functional collaboration", resumePattern: /cross-functional|cross functional/i, importance: "medium" },
];

function resumeText(resume: DemoResume): string {
  return [
    resume.content.summary,
    resume.content.contact.headline,
    resume.content.skills,
    ...resume.content.experience.flatMap((entry) => [
      entry.title,
      entry.company,
      ...entry.bullets,
    ]),
    ...resume.content.projects.flatMap((entry) => [
      entry.name,
      ...entry.bullets,
    ]),
    ...resume.content.education.flatMap((entry) => [
      entry.degree,
      entry.coursework,
      entry.honors,
    ]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function extractJobMeta(jobDescription: string): {
  role: string;
  company: string;
} {
  const lines = jobDescription
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  const role = (lines[0] || "Product Designer").split("·")[0].trim();
  let company = "";

  if (lines[1]) {
    const possible = lines[1].split("·")[0].trim();
    if (possible && possible.length < 48 && !/^(remote|hybrid|onsite)/i.test(possible)) {
      company = possible;
    }
  }

  return { role, company: company || "the team" };
}

export function analyzeJobMock(
  resume: DemoResume,
  jobDescription: string,
): {
  keywords: TailorKeyword[];
  found: number;
  missing: number;
  matchPercent: number;
} {
  const jd = jobDescription.toLowerCase();
  const text = resumeText(resume);

  const matchedCandidates = CANDIDATES.filter((candidate) =>
    candidate.pattern.test(jd),
  );

  let results: TailorKeyword[] = matchedCandidates.map((candidate) => ({
    term: candidate.term,
    importance: candidate.importance,
    found: candidate.pattern.test(text) || text.includes(candidate.term.toLowerCase()),
  }));

  if (results.length < 6) {
    const existing = new Set(results.map((keyword) => keyword.term));
    const fallback = FALLBACK_TERMS.filter((item) => !existing.has(item.term))
      .map((item) => ({
        term: item.term,
        importance: item.importance,
        found: item.resumePattern.test(text),
      }))
      .slice(0, 8 - results.length);
    results = [...results, ...fallback];
  }

  results = results.slice(0, 10);
  if (!results.some((keyword) => !keyword.found)) {
    results[results.length - 1] = {
      ...results[results.length - 1],
      found: false,
    };
  }

  const found = results.filter((keyword) => keyword.found).length;
  const missing = results.length - found;

  return {
    keywords: results,
    found,
    missing,
    matchPercent: Math.round((found / Math.max(results.length, 1)) * 100),
  };
}

export function buildTailorSuggestions(
  resume: DemoResume,
  jobDescription: string,
): TailorSuggestion[] {
  const { role, company } = extractJobMeta(jobDescription);
  const suggestions: TailorSuggestion[] = [];
  const currentSummary = resume.content.summary.trim();
  const topExperience = resume.content.experience.find(
    (entry) => entry.bullets.filter((bullet) => bullet.trim()).length > 0,
  );
  const firstBullet = topExperience?.bullets.find((bullet) => bullet.trim()) ?? "";
  const secondBullet = topExperience?.bullets.filter((bullet) => bullet.trim())[1] ?? "";

  suggestions.push({
    id: "tailor-summary",
    kind: "summary",
    section: "Summary",
    original:
      currentSummary ||
      "No summary yet. This suggestion adds a short opening for the role.",
    suggested: `${role} focused on making complex workflows feel clear and considered. Pairs strong interaction craft with research, data-informed decisions, and close cross-functional collaboration. Experienced in scaling design systems and bringing a high bar for accessibility to every release.`,
    reason:
      "Leads with the role's language and brings the gaps — data-informed design and design operations — into your existing experience.",
  });

  if (firstBullet) {
    suggestions.push({
      id: "tailor-bullet-1",
      kind: "bullet",
      section: `${topExperience?.company || "Experience"} · first bullet`,
      original: firstBullet,
      suggested: mockImprovedBullet(
        firstBullet,
        topExperience?.title ?? role,
        topExperience?.company ?? company,
      ),
      reason:
        "Keeps the original outcome and tightens the opening so the impact is visible in the first scan.",
      experienceId: topExperience?.id,
      bulletIndex: resume.content.experience
        .find((entry) => entry.id === topExperience?.id)
        ?.bullets.findIndex((bullet) => bullet === firstBullet),
    });
  }

  if (secondBullet) {
    suggestions.push({
      id: "tailor-bullet-2",
      kind: "bullet",
      section: `${topExperience?.company || "Experience"} · second bullet`,
      original: secondBullet,
      suggested: mockImprovedBullet(
        secondBullet,
        topExperience?.title ?? role,
        topExperience?.company ?? company,
      ),
      reason:
        "Makes the contribution easier to scan, while preserving the facts already on your resume.",
      experienceId: topExperience?.id,
      bulletIndex: resume.content.experience
        .find((entry) => entry.id === topExperience?.id)
        ?.bullets.findIndex((bullet) => bullet === secondBullet),
    });
  }

  return suggestions;
}

export function tailorMatchLabel(percent: number): string {
  if (percent >= 80) return "Strong overlap";
  if (percent >= 60) return "Close match";
  return "Worth tailoring";
}
