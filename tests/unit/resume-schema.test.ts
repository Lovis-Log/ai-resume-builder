import { describe, expect, it } from "vitest";
import {
  createEmptyResumeContent,
  SAMPLE_RESUME_CONTENT,
} from "@/lib/resume/defaults";
import { resumeContentSchema } from "@/lib/resume/schema";

describe("resumeContentSchema", () => {
  it("accepts the sample resume", () => {
    expect(resumeContentSchema.safeParse(SAMPLE_RESUME_CONTENT).success).toBe(true);
  });

  it("accepts an empty draft", () => {
    expect(resumeContentSchema.safeParse(createEmptyResumeContent()).success).toBe(
      true,
    );
  });

  it("allows partial email input while autosaving", () => {
    const content = structuredClone(createEmptyResumeContent());
    content.contact.email = "jordan@";
    expect(resumeContentSchema.safeParse(content).success).toBe(true);
  });

  it("rejects an invalid month", () => {
    const content = structuredClone(createEmptyResumeContent());
    content.experience.push({
      id: "exp",
      title: "",
      company: "",
      location: "",
      startDate: "2024-13",
      endDate: "",
      current: false,
      bullets: [],
    });
    expect(resumeContentSchema.safeParse(content).success).toBe(false);
  });

  it("rejects an overlong summary", () => {
    const content = structuredClone(createEmptyResumeContent());
    content.summary = "a".repeat(2001);
    expect(resumeContentSchema.safeParse(content).success).toBe(false);
  });
});
