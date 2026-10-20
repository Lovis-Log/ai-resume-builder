import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { errorResponse, getRequestId } from "@/lib/api/http";
import { requireUserForApi } from "@/lib/auth/dal";
import { getOrCreateProfile } from "@/lib/auth/profile";
import { completeUsage, failUsage, reserveUsage } from "@/lib/billing/usage";
import { ConflictError, ValidationError } from "@/lib/errors";
import { renderResumePdf } from "@/lib/pdf/render";
import { resumeFilename } from "@/lib/resume/format";
import { getResumeForUser, parseResumeContent } from "@/lib/resume/queries";
import { getIdempotencyKey } from "@/lib/security/idempotency";
import { assertSameOrigin } from "@/lib/security/origin";

export const maxDuration = 60;

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = getRequestId();

  try {
    assertSameOrigin(request);
    const user = await requireUserForApi();
    await getOrCreateProfile(user);

    const { id } = await context.params;
    const resume = await getResumeForUser(user.id, id);
    const content = parseResumeContent(resume.content);

    if (!content.contact.fullName.trim()) {
      throw new ValidationError("Add your name before downloading.");
    }

    const hasSection =
      content.summary.trim().length > 0 ||
      content.experience.length > 0 ||
      content.education.length > 0 ||
      content.projects.length > 0 ||
      content.skills.trim().length > 0;

    if (!hasSection) {
      throw new ValidationError("Add some resume content before downloading.");
    }

    const idempotencyKey = getIdempotencyKey(request);
    const reservation = await reserveUsage({
      userId: user.id,
      kind: "pdf_download",
      resumeId: resume.id,
      idempotencyKey,
    });

    if (reservation.status === "in_progress") {
      throw new ConflictError("This PDF is already being generated. Wait a moment.");
    }

    const charged = reservation.status === "reserved";

    try {
      const buffer = await renderResumePdf(content);
      const pdf = await PDFDocument.load(buffer);
      const pages = pdf.getPageCount();

      if (charged) {
        await completeUsage(reservation.eventId);
      }

      const filename = resumeFilename(content.contact.fullName);

      return new NextResponse(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Cache-Control": "private, no-store",
          "X-PDF-Pages": String(pages),
          "X-Request-Id": requestId,
        },
      });
    } catch (error) {
      if (charged) {
        await failUsage(
          reservation.eventId,
          error instanceof Error ? error.message : "PDF render failed",
        );
      }
      throw error;
    }
  } catch (error) {
    return errorResponse(error, requestId);
  }
}
