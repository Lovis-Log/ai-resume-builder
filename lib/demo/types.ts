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

export type DemoContact = {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
};

export type DemoExperience = {
  id: string;
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
};

export type DemoEducation = {
  id: string;
  school: string;
  degree: string;
  location: string;
  startDate: string;
  endDate: string;
  gpa: string;
  coursework: string;
  honors: string;
};

export type DemoProject = {
  id: string;
  name: string;
  link: string;
  startDate: string;
  endDate: string;
  bullets: string[];
};

export type DemoResumeContent = {
  contact: DemoContact;
  summary: string;
  experience: DemoExperience[];
  education: DemoEducation[];
  projects: DemoProject[];
  skills: string;
};

export type DemoResume = {
  id: string;
  title: string;
  targetRole: string;
  template: TemplateId;
  accent: string;
  density: Density;
  content: DemoResumeContent;
  createdAt: string;
  updatedAt: string;
  lastTailoredFor?: {
    role: string;
    company: string;
    matchedAt: string;
  };
};

export type DemoPlan = "free" | "pro";

export type DemoProfile = {
  name: string;
  firstName: string;
  email: string;
  initials: string;
  plan: DemoPlan;
  aiUsed: number;
  aiIncluded: number;
  renewsOn: string;
  memberSince: string;
};

export type DemoState = {
  version: 1;
  profile: DemoProfile;
  resumes: DemoResume[];
};

export type DemoTool = "write" | "design" | "ai" | "tailor" | "score";

export type TailorKeyword = {
  term: string;
  importance: "high" | "medium";
  found: boolean;
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
