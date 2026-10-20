import "server-only";
import { renderToBuffer } from "@react-pdf/renderer";
import type { ResumeContent } from "@/lib/resume/schema";
import { ResumeDocument } from "./document";
import { registerResumeFonts } from "./fonts";

export async function renderResumePdf(content: ResumeContent): Promise<Buffer> {
  registerResumeFonts();
  return renderToBuffer(<ResumeDocument content={content} />);
}
