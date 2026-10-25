import type { ResumeContent } from "./schema";

export type TemplateId = "modern" | "classic" | "editorial";

export type Density = "compact" | "comfortable" | "airy";

export type AccentOption = {
  name: string;
  value: string;
};

export const ACCENTS: AccentOption[] = [
  { name: "Cobalt", value: "#416af5" },
  { name: "Iris", value: "#916af7" },
  { name: "Lagoon", value: "#159b96" },
  { name: "Clay", value: "#c97055" },
  { name: "Graphite", value: "#313e55" },
  { name: "Ochre", value: "#ad7b3f" },
];

export type TemplateInfo = {
  id: TemplateId;
  name: string;
  description: string;
  tone: string;
};

export const TEMPLATES: TemplateInfo[] = [
  {
    id: "modern",
    name: "Modern",
    description: "A light, structured page with a confident type hierarchy.",
    tone: "Crisp",
  },
  {
    id: "classic",
    name: "Classic",
    description: "Centered, serif-led, and quietly traditional.",
    tone: "Timeless",
  },
  {
    id: "editorial",
    name: "Editorial",
    description: "Big type, fine rules, and a little more presence.",
    tone: "Expressive",
  },
];

export type LastTailoredFor = {
  role: string;
  company: string;
  matchedAt: string;
};

export type ResumeRecord = {
  id: string;
  title: string;
  targetRole: string;
  template: TemplateId;
  accent: string;
  density: Density;
  content: ResumeContent;
  version: number;
  createdAt: string;
  updatedAt: string;
  lastTailoredFor?: LastTailoredFor;
};

export type WorkspacePlan = "free" | "pro";

export type WorkspaceProfile = {
  id: string;
  name: string;
  firstName: string;
  email: string;
  initials: string;
  avatarUrl: string | null;
  plan: WorkspacePlan;
  aiUsed: number;
  aiIncluded: number;
  renewsOn: string | null;
  memberSince: string;
  hasAiConsent: boolean;
  billingEnabled: boolean;
};

export type WorkspaceData = {
  profile: WorkspaceProfile;
  resumes: ResumeRecord[];
};

export type WorkspaceTool = "write" | "design" | "ai" | "tailor" | "score";

export type TailorKeyword = {
  term: string;
  importance: "high" | "medium" | "low";
  found: boolean;
  evidenceQuote: string;
};

export type TailorSuggestion = {
  id: string;
  kind: "summary" | "bullet";
  section: string;
  original: string;
  suggested: string;
  reason: string;
  experienceId?: string;
  bulletIndex?: number;
};

export type TailorAnalysis = {
  keywords: TailorKeyword[];
  found: number;
  missing: number;
  matchPercent: number;
};

export type CreateResumeInput = {
  title: string;
  template: TemplateId;
  startWithExample?: boolean;
};

export type SaveResumeInput = {
  id: string;
  title: string;
  targetRole: string;
  template: TemplateId;
  accent: string;
  density: Density;
  content: ResumeContent;
  version: number;
  lastTailoredFor?: LastTailoredFor | null;
};
