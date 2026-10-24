import type {
  DemoProfile,
  DemoResume,
  DemoResumeContent,
  DemoState,
} from "./types";

/**
 * The demo is intentionally local and deterministic. This timestamp keeps
 * server-rendered dates stable and makes the seeded workspace feel current.
 */
export const DEMO_NOW = "2026-10-24T09:30:00.000Z";

export const DEMO_PROFILE: DemoProfile = {
  name: "Alex Morgan",
  firstName: "Alex",
  email: "alex.morgan@email.com",
  initials: "AM",
  plan: "pro",
  aiUsed: 14,
  aiIncluded: 500,
  renewsOn: "2026-11-24T00:00:00.000Z",
  memberSince: "2026-02-11T00:00:00.000Z",
};

const primarySummary =
  "Product designer with 4+ years of experience turning complex workflows into clear, human interfaces. Partners closely with engineering and research to ship accessible products that earn trust — and measurable results.";

const primaryContent: DemoResumeContent = {
  contact: {
    fullName: "Alex Morgan",
    headline: "Product Designer",
    email: "alex.morgan@email.com",
    phone: "+1 (415) 555-0128",
    location: "San Francisco, CA",
    website: "alexmorgan.design",
  },
  summary: primarySummary,
  experience: [
    {
      id: "exp-northstar",
      title: "Product Designer",
      company: "Northstar Studio",
      location: "San Francisco, CA",
      startDate: "2022-04",
      endDate: "",
      current: true,
      bullets: [
        "Led end-to-end redesign of a B2B analytics platform used by 40,000+ customers.",
        "Built a 68-component design system adopted by 6 product teams, cutting design QA time by 32%.",
        "Partnered with researchers on 24 usability sessions to lift onboarding completion from 61% to 78%.",
      ],
    },
    {
      id: "exp-orbit",
      title: "UX Designer",
      company: "Orbit Digital",
      location: "Remote",
      startDate: "2020-06",
      endDate: "2022-03",
      current: false,
      bullets: [
        "Designed and shipped mobile onboarding flows for 12 early-stage products.",
        "Created a lightweight research playbook that reduced concept testing time by two weeks.",
      ],
    },
    {
      id: "exp-studio-field",
      title: "Product Design Intern",
      company: "Studio Field",
      location: "Portland, OR",
      startDate: "2019-06",
      endDate: "2019-09",
      current: false,
      bullets: [
        "Rebuilt the search experience, increasing task completion by 22%.",
        "Documented interaction specs for a 4-person engineering team.",
      ],
    },
  ],
  education: [
    {
      id: "edu-cca",
      school: "California College of the Arts",
      degree: "B.A. in Interaction Design",
      location: "San Francisco, CA",
      startDate: "2016-08",
      endDate: "2020-05",
      gpa: "",
      coursework: "Interface Design, Research Methods, Typography, Human Factors",
      honors: "Design Honors Society · Portfolio Award, 2020",
    },
  ],
  projects: [
    {
      id: "proj-common-ground",
      name: "Common Ground",
      link: "commonground.design",
      startDate: "2024-01",
      endDate: "2024-08",
      bullets: [
        "Created a neighborhood skill-sharing platform focused on low-bandwidth access.",
        "Improved first-session task success from 54% to 81% across 18 usability tests.",
      ],
    },
  ],
  skills:
    "Product Strategy, UX Research, Figma, Prototyping, Design Systems, Accessibility, Interaction Design, Framer",
};

const linearContent: DemoResumeContent = {
  ...structuredClone(primaryContent),
  summary:
    "Product designer who makes complex systems feel obvious. Four years shaping analytics, onboarding, and design systems with cross-functional teams. Drawn to craft, clarity, and measurable product outcomes.",
  experience: [
    {
      ...structuredClone(primaryContent.experience[0]),
      bullets: [
        "Led end-to-end redesign of a B2B analytics platform used by 40,000+ customers.",
        "Built a 68-component design system adopted by 6 product teams, cutting QA time by 32%.",
      ],
    },
    {
      ...structuredClone(primaryContent.experience[1]),
      bullets: [
        "Designed and shipped mobile onboarding flows for 12 early-stage products.",
      ],
    },
  ],
  projects: [
    {
      ...structuredClone(primaryContent.projects[0]),
      bullets: [
        "Created a neighborhood skill-sharing platform focused on low-bandwidth access.",
      ],
    },
  ],
  skills:
    "Product Strategy, Interaction Design, Design Systems, Prototyping, UX Research, Figma, Accessibility",
};

const newGradContent: DemoResumeContent = {
  contact: {
    fullName: "Alex Morgan",
    headline: "Product Design Intern",
    email: "alex.morgan@email.com",
    phone: "+1 (415) 555-0128",
    location: "San Francisco, CA",
    website: "alexmorgan.design",
  },
  summary: "",
  experience: [
    {
      id: "exp-field-intern-2",
      title: "Design Intern",
      company: "Studio Field",
      location: "Portland, OR",
      startDate: "2019-06",
      endDate: "",
      current: false,
      bullets: [
        "Rebuilt the search experience, increasing task completion by 22%.",
      ],
    },
  ],
  education: [
    {
      id: "edu-cca-2",
      school: "California College of the Arts",
      degree: "B.A. in Interaction Design",
      location: "San Francisco, CA",
      startDate: "2016-08",
      endDate: "2020-05",
      gpa: "3.8",
      coursework: "",
      honors: "",
    },
  ],
  projects: [],
  skills: "Figma, Prototyping, Research",
};

export const DEMO_RESUMES: DemoResume[] = [
  {
    id: "alex-product-designer",
    title: "Alex Morgan — Product Designer",
    targetRole: "Product Designer",
    template: "modern",
    accent: "#416af5",
    density: "comfortable",
    content: primaryContent,
    createdAt: "2026-10-06T16:20:00.000Z",
    updatedAt: "2026-10-24T08:05:00.000Z",
  },
  {
    id: "product-designer-linear",
    title: "Product Designer — Linear",
    targetRole: "Product Designer",
    template: "editorial",
    accent: "#916af7",
    density: "airy",
    content: linearContent,
    createdAt: "2026-10-18T11:05:00.000Z",
    updatedAt: "2026-10-23T04:12:00.000Z",
    lastTailoredFor: {
      role: "Product Designer",
      company: "Linear",
      matchedAt: "2026-10-23T04:12:00.000Z",
    },
  },
  {
    id: "summer-applications",
    title: "Summer applications — Draft",
    targetRole: "Product Design Intern",
    template: "classic",
    accent: "#159b96",
    density: "compact",
    content: newGradContent,
    createdAt: "2026-10-15T14:08:00.000Z",
    updatedAt: "2026-10-18T19:26:00.000Z",
  },
];

export const DEMO_JOB_DESCRIPTION = `Product Designer
Linear · San Francisco / Remote

We are looking for a product designer to shape the next generation of tools for high-performing teams. You will own problems from early research through polished execution, working closely with engineers, product managers, and other designers.

What you will do
- Lead zero-to-one exploration and improve core product workflows.
- Turn research and product data into clear, opinionated interaction design.
- Contribute to and evolve our design system, with a high bar for craft and accessibility.
- Partner with engineering to ship thoughtfully and iteratively.

What we are looking for
- 3+ years designing software products, ideally productivity or developer tools.
- Strong product thinking, prototyping skills, and a clear point of view on interaction design.
- Experience with design systems, user research, and data-informed decisions.
- Comfortable working in a fast-moving, cross-functional environment.
- A portfolio that shows rigorous process and exceptional visual craft.

Bonus
- Experience with design operations and scaling design processes.
- Familiarity with Figma variables and component libraries.`;

export function createDemoState(): DemoState {
  return structuredClone({
    version: 1,
    profile: DEMO_PROFILE,
    resumes: DEMO_RESUMES,
  });
}

export const DEMO_STORAGE_KEY = "lume-demo-workspace-v1";

export type CreateResumeInput = {
  title: string;
  template: DemoResume["template"];
  startWithExample?: boolean;
};

const seedId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `demo-${Date.now()}`;
};

export function createResumeRecord(input: CreateResumeInput): DemoResume {
  const now = new Date().toISOString();
  const title = input.title.trim() || "Untitled resume";
  const base = input.startWithExample
    ? structuredClone(primaryContent)
    : blankContent(DEMO_PROFILE);

  return {
    id: seedId(),
    title,
    targetRole: base.contact.headline || "Your next role",
    template: input.template,
    accent: "#416af5",
    density: "comfortable",
    content: base,
    createdAt: now,
    updatedAt: now,
  };
}

export function duplicateResumeRecord(resume: DemoResume): DemoResume {
  const now = new Date().toISOString();
  return {
    ...structuredClone(resume),
    id: seedId(),
    title: `${resume.title} — Copy`,
    createdAt: now,
    updatedAt: now,
  };
}

export function blankContent(profile: DemoProfile): DemoResumeContent {
  return {
    contact: {
      fullName: profile.name,
      headline: "",
      email: profile.email,
      phone: "",
      location: "",
      website: "",
    },
    summary: "",
    experience: [],
    education: [],
    projects: [],
    skills: "",
  };
}
