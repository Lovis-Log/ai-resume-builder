import "server-only";
import path from "node:path";
import { Font } from "@react-pdf/renderer";
import { RESUME_FONT } from "@/lib/resume/design";

let registered = false;

export function registerResumeFonts() {
  if (registered) return;

  const fontDirectory = path.join(process.cwd(), "public", "fonts");

  Font.register({
    family: RESUME_FONT.regular,
    src: path.join(fontDirectory, "SourceSans3-Regular.ttf"),
  });
  Font.register({
    family: RESUME_FONT.semibold,
    src: path.join(fontDirectory, "SourceSans3-SemiBold.ttf"),
  });
  Font.register({
    family: RESUME_FONT.bold,
    src: path.join(fontDirectory, "SourceSans3-Bold.ttf"),
  });

  // Hyphenation inserts characters that are not in the source text and can
  // break emails, URLs, and keyword extraction. Disable it globally.
  Font.registerHyphenationCallback((word) => [word]);

  registered = true;
}
