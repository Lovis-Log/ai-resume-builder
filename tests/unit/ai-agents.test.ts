import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  analyzeKeywordsAgent,
  draftTailoringAgent,
  generateSummaryAgent,
  improveBulletAgent,
} from "@/lib/ai/agents";
import { SAMPLE_RESUME_CONTENT } from "@/lib/resume/defaults";
import { SAMPLE_JOB_DESCRIPTION } from "@/lib/resume/sample";

const originalKey = process.env.DEEPSEEK_API_KEY;

beforeEach(() => {
  delete process.env.DEEPSEEK_API_KEY;
});

afterEach(() => {
  if (originalKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY = originalKey;
  }
});

describe("AI agents without a DeepSeek key", () => {
  it("falls back to a deterministic summary", async () => {
    const result = await generateSummaryAgent({
      targetRole: "Software Engineer",
      style: "measured",
      content: SAMPLE_RESUME_CONTENT,
    });

    expect(result.provider).toBe("heuristic");
    expect(result.model).toBe("local-heuristic");
    expect(result.summary.length).toBeGreaterThan(20);
  });

  it("falls back to a rewritten bullet", async () => {
    const entry = SAMPLE_RESUME_CONTENT.experience[0];
    const result = await improveBulletAgent({
      bullet: entry.bullets[0] ?? "",
      jobTitle: entry.title,
      company: entry.company,
    });

    expect(result.provider).toBe("heuristic");
    expect(result.bullet.length).toBeGreaterThan(0);
  });

  it("falls back to keyword extraction", async () => {
    const result = await analyzeKeywordsAgent({
      jobDescription: SAMPLE_JOB_DESCRIPTION,
    });

    expect(result.provider).toBe("heuristic");
    expect(result.keywords.length).toBeGreaterThan(0);
  });

  it("falls back to tailoring suggestions", async () => {
    const result = await draftTailoringAgent({
      content: SAMPLE_RESUME_CONTENT,
      jobDescription: SAMPLE_JOB_DESCRIPTION,
      keywords: [{ term: "Figma", importance: "high" }],
    });

    expect(result.provider).toBe("heuristic");
    expect(result.summary.suggested.length).toBeGreaterThan(20);
    expect(result.bullets.length).toBeGreaterThan(0);
  });
});
