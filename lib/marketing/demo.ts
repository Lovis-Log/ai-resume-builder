import type { ResumeContent } from "@/lib/resume/schema";
import { computeScore } from "@/lib/score/compute";

/**
 * Marketing-only sample. It is intentionally imperfect: the score section uses
 * it to demonstrate the checks. The resume preview shows the same content, so
 * the demo stays consistent across the page.
 */
export const MARKETING_RESUME_CONTENT: ResumeContent = {
  contact: {
    fullName: "Jordan Lee",
    headline: "Software Engineer",
    email: "jordan.lee@example.com",
    phone: "+1 (555) 012-3456",
    location: "Toronto, Canada",
    website: "jordanlee.dev",
  },
  summary:
    "I am a computer science graduate with internship experience building accessible web applications. I like turning user feedback into shipped features across frontend and backend.",
  experience: [
    {
      id: "demo-exp-1",
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
      id: "demo-exp-2",
      title: "Teaching Assistant, Intro to Programming",
      company: "University of Toronto",
      location: "Toronto, Canada",
      startDate: "2024-09",
      endDate: "",
      current: true,
      bullets: [
        "Led weekly labs for 40 students and held office hours on debugging.",
      ],
    },
  ],
  education: [
    {
      id: "demo-edu-1",
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
      id: "demo-project-1",
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

export const MARKETING_SCORE = computeScore(MARKETING_RESUME_CONTENT, 1);

export const MARKETING_JOB_DESCRIPTION =
  "We are hiring a software engineering intern to build customer-facing dashboards in React and TypeScript. You will work with PostgreSQL, write tests, and collaborate with designers. Familiarity with Docker and CI/CD pipelines is a plus.";

export const MARKETING_KEYWORDS = [
  { term: "TypeScript", found: true },
  { term: "React", found: true },
  { term: "PostgreSQL", found: true },
  { term: "testing", found: true },
  { term: "Docker", found: false },
  { term: "CI/CD", found: false },
] as const;
