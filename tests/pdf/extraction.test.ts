import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import { renderResumePdf } from "@/lib/pdf/render";
import { SAMPLE_RESUME_CONTENT } from "@/lib/resume/defaults";

function hasCommand(command: string): boolean {
  try {
    execFileSync(command, ["-v"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}

const HAS_PDFTOTEXT = hasCommand("pdftotext");

describe("PDF pipeline", () => {
  it("renders an A4 PDF with at least one page", async () => {
    const buffer = await renderResumePdf(SAMPLE_RESUME_CONTENT);
    const pdf = await PDFDocument.load(buffer);
    expect(pdf.getPageCount()).toBeGreaterThanOrEqual(1);
    const page = pdf.getPage(0);
    expect(page.getWidth()).toBeGreaterThan(590);
    expect(page.getHeight()).toBeGreaterThan(835);
  });

  it.skipIf(!HAS_PDFTOTEXT)(
    "extracts the expected text in reading order",
    async () => {
      const buffer = await renderResumePdf(SAMPLE_RESUME_CONTENT);
      const directory = mkdtempSync(path.join(tmpdir(), "resume-pdf-"));
      const file = path.join(directory, "resume.pdf");

      try {
        writeFileSync(file, buffer);
        const text = execFileSync("pdftotext", ["-layout", file, "-"], {
          encoding: "utf8",
          maxBuffer: 10 * 1024 * 1024,
        });

        expect(text).toContain("Jordan Lee");
        expect(text).toContain("jordan.lee@example.com");
        expect(text).toContain("Software Engineering Intern");
        expect(text).toContain("Northstar Labs");
        expect(text).toContain("University of Toronto");
        expect(text).toContain("Campus Ride Share");
        expect(text).toContain("TypeScript");

        const nameIndex = text.indexOf("Jordan Lee");
        const experienceIndex = text.indexOf("Software Engineering Intern");
        const educationIndex = text.indexOf("Bachelor of Science");
        expect(nameIndex).toBeLessThan(experienceIndex);
        expect(experienceIndex).toBeLessThan(educationIndex);
        expect(text).not.toContain("(cid:");
        expect(text).not.toContain("�");
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  );
});
