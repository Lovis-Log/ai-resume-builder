import type {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeContent,
} from "./schema";

export function createId(): string {
  return crypto.randomUUID();
}

export function createEmptyExperience(): ExperienceEntry {
  return {
    id: createId(),
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

export function createEmptyEducation(): EducationEntry {
  return {
    id: createId(),
    school: "",
    degree: "",
    major: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    coursework: "",
    honors: "",
  };
}

export function createEmptyProject(): ProjectEntry {
  return {
    id: createId(),
    name: "",
    link: "",
    startDate: "",
    endDate: "",
    bullets: [""],
  };
}

export function createEmptyResumeContent(): ResumeContent {
  return {
    contact: {
      fullName: "",
      headline: "",
      email: "",
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

export function createSampleResumeContent(): ResumeContent {
  return {
    contact: {
      fullName: "Jordan Lee",
      headline: "Software Engineer",
      email: "jordan.lee@example.com",
      phone: "+1 (555) 012-3456",
      location: "Toronto, Canada",
      website: "jordanlee.dev",
    },
    summary:
      "Computer science graduate with internship experience building accessible web applications. Skilled at turning user feedback into shipped features and comfortable working across frontend and backend.",
    experience: [
      {
        id: createId(),
        title: "Software Engineering Intern",
        company: "Northstar Labs",
        location: "Remote",
        startDate: "2025-05",
        endDate: "2025-08",
        current: false,
        bullets: [
          "Built a customer dashboard in React and TypeScript, reducing support tickets by 18%.",
          "Added automated tests for the billing flow, catching 12 regressions before release.",
          "Collaborated with designers to improve onboarding completion from 61% to 74%.",
        ],
      },
      {
        id: createId(),
        title: "Teaching Assistant, Intro to Programming",
        company: "University of Toronto",
        location: "Toronto, Canada",
        startDate: "2024-09",
        endDate: "",
        current: true,
        bullets: [
          "Led weekly labs for 40 students and held office hours on debugging and data structures.",
          "Reviewed 120 assignments per term and gave written feedback on code quality.",
        ],
      },
    ],
    education: [
      {
        id: createId(),
        school: "University of Toronto",
        degree: "Bachelor of Science",
        major: "Computer Science",
        location: "Toronto, Canada",
        startDate: "2021-09",
        endDate: "2025-06",
        gpa: "3.8/4.0",
        coursework: "Data Structures, Algorithms, Databases, Human-Computer Interaction",
        honors: "Dean's List (2023, 2024)",
      },
    ],
    projects: [
      {
        id: createId(),
        name: "Campus Ride Share",
        link: "github.com/jordanlee/campus-rideshare",
        startDate: "2024-01",
        endDate: "2024-04",
        bullets: [
          "Built a Next.js and Postgres app that matched 300+ students for shared rides.",
          "Implemented authentication and a review system with 98% test coverage on core flows.",
        ],
      },
    ],
    skills:
      "TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Git, Jest, Playwright, Figma",
  };
}

/**
 * Fixed-id version for static pages and tests. Avoids random UUIDs during
 * prerendering.
 */
export const SAMPLE_RESUME_CONTENT: ResumeContent = {
  contact: {
    fullName: "Jordan Lee",
    headline: "Software Engineer",
    email: "jordan.lee@example.com",
    phone: "+1 (555) 012-3456",
    location: "Toronto, Canada",
    website: "jordanlee.dev",
  },
  summary:
    "Computer science graduate with internship experience building accessible web applications. Skilled at turning user feedback into shipped features and comfortable working across frontend and backend.",
  experience: [
    {
      id: "sample-exp-1",
      title: "Software Engineering Intern",
      company: "Northstar Labs",
      location: "Remote",
      startDate: "2025-05",
      endDate: "2025-08",
      current: false,
      bullets: [
        "Built a customer dashboard in React and TypeScript, reducing support tickets by 18%.",
        "Added automated tests for the billing flow, catching 12 regressions before release.",
        "Collaborated with designers to improve onboarding completion from 61% to 74%.",
      ],
    },
    {
      id: "sample-exp-2",
      title: "Teaching Assistant, Intro to Programming",
      company: "University of Toronto",
      location: "Toronto, Canada",
      startDate: "2024-09",
      endDate: "",
      current: true,
      bullets: [
        "Led weekly labs for 40 students and held office hours on debugging and data structures.",
        "Reviewed 120 assignments per term and gave written feedback on code quality.",
      ],
    },
  ],
  education: [
    {
      id: "sample-edu-1",
      school: "University of Toronto",
      degree: "Bachelor of Science",
      major: "Computer Science",
      location: "Toronto, Canada",
      startDate: "2021-09",
      endDate: "2025-06",
      gpa: "3.8/4.0",
      coursework: "Data Structures, Algorithms, Databases, Human-Computer Interaction",
      honors: "Dean's List (2023, 2024)",
    },
  ],
  projects: [
    {
      id: "sample-project-1",
      name: "Campus Ride Share",
      link: "github.com/jordanlee/campus-rideshare",
      startDate: "2024-01",
      endDate: "2024-04",
      bullets: [
        "Built a Next.js and Postgres app that matched 300+ students for shared rides.",
        "Implemented authentication and a review system with 98% test coverage on core flows.",
      ],
    },
  ],
  skills:
    "TypeScript, React, Next.js, Node.js, PostgreSQL, Tailwind CSS, Git, Jest, Playwright, Figma",
};
