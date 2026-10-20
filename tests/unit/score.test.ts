import { describe, expect, it } from "vitest";
import { computeScore } from "@/lib/score/compute";
import {
  createEmptyResumeContent,
  SAMPLE_RESUME_CONTENT,
} from "@/lib/resume/defaults";

describe("computeScore", () => {
  it("gives the sample resume a perfect score on one page", () => {
    const result = computeScore(SAMPLE_RESUME_CONTENT, 1);
    expect(result.score).toBe(100);
    expect(result.passed).toBe(10);
  });

  it("scores an empty resume 20 (only pages and pronouns pass)", () => {
    const result = computeScore(createEmptyResumeContent(), 1);
    expect(result.score).toBe(20);
    const failed = result.checks.filter((check) => !check.passed).map((check) => check.id);
    expect(failed).toContain("contact");
    expect(failed).toContain("summary");
    expect(failed).toContain("experience");
    expect(failed).toContain("skills");
  });

  it("fails the page check at three pages", () => {
    const result = computeScore(SAMPLE_RESUME_CONTENT, 3);
    const pageCheck = result.checks.find((check) => check.id === "pages");
    expect(pageCheck?.passed).toBe(false);
    expect(result.score).toBe(90);
  });

  it("fails first-person pronouns", () => {
    const content = structuredClone(SAMPLE_RESUME_CONTENT);
    content.summary = "I am a computer science graduate with internship experience.";
    const result = computeScore(content, 1);
    const pronounCheck = result.checks.find((check) => check.id === "pronouns");
    expect(pronounCheck?.passed).toBe(false);
  });

  it("requires five comma-separated skills", () => {
    const content = structuredClone(SAMPLE_RESUME_CONTENT);
    content.skills = "TypeScript, React, PostgreSQL";
    const result = computeScore(content, 1);
    const skills = result.checks.find((check) => check.id === "skills");
    expect(skills?.passed).toBe(false);
  });

  it("fails action verbs when most bullets start with weak words", () => {
    const content = structuredClone(SAMPLE_RESUME_CONTENT);
    content.experience = [
      {
        id: "exp",
        title: "Intern",
        company: "Acme",
        location: "Remote",
        startDate: "2024-01",
        endDate: "2024-06",
        current: false,
        bullets: [
          "Responsible for the dashboard",
          "Tasked with testing",
          "Helped the team",
        ],
      },
    ];
    const result = computeScore(content, 1);
    const verbs = result.checks.find((check) => check.id === "action-verbs");
    expect(verbs?.passed).toBe(false);
  });

  it("requires dates on experience entries", () => {
    const content = structuredClone(SAMPLE_RESUME_CONTENT);
    content.experience[0].startDate = "";
    const result = computeScore(content, 1);
    const dates = result.checks.find((check) => check.id === "dates");
    expect(dates?.passed).toBe(false);
  });
});
