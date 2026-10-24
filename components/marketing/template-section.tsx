import Link from "next/link";
import { ArrowUpRight, Check, FileText, Type, Columns3 } from "lucide-react";
import { ResumePreview } from "@/components/preview/resume-preview";
import type { ResumeContent } from "@/lib/resume/schema";

const TEMPLATE_POINTS = [
  {
    icon: Columns3,
    title: "Single column, A4",
    copy: "The reading order stays intact when a parser extracts the text.",
  },
  {
    icon: Type,
    title: "Selectable text, embedded fonts",
    copy: "Source Sans 3 is embedded and hyphenation is off. No images pretending to be words.",
  },
  {
    icon: FileText,
    title: "No tables, icons, or photos",
    copy: "Those are the shapes that commonly scramble an ATS. This template avoids all of them.",
  },
];

export function TemplateSection({ content }: { content: ResumeContent }) {
  return (
    <section className="section template-section" id="template">
      <div className="container template-grid">
        <div className="template-copy" data-reveal>
          <p className="eyebrow">
            <span />
            One template, on purpose
          </p>
          <h2 className="section-title">
            Quiet page.
            <br /> <span className="soft">Loud achievements.</span>
          </h2>
          <p className="section-sub">
            This is not a design tool. It is one carefully built, ATS-safe A4
            resume. The same template works for every application, so you never
            have to wonder whether the layout is the reason you did not hear back.
          </p>

          <ul className="template-points">
            {TEMPLATE_POINTS.map((point) => (
              <li key={point.title}>
                <span className="template-point-icon">
                  <point.icon aria-hidden="true" />
                </span>
                <div>
                  <h3>{point.title}</h3>
                  <p>{point.copy}</p>
                </div>
              </li>
            ))}
          </ul>

          <Link href="/login" className="text-link">
            Use this template — free
            <ArrowUpRight aria-hidden="true" />
          </Link>
          <p className="spotlight-note">
            More templates may come later. This one is done properly first.
          </p>
        </div>

        <div className="paper-stage" data-reveal>
          <span className="paper-halo" aria-hidden="true" />
          <div className="paper-stack" aria-hidden="true">
            <div className="paper-back paper-back-one" />
            <div className="paper-back paper-back-two" />
            <div className="paper-window">
              <div className="paper-scale">
                <ResumePreview content={content} />
              </div>
              <span className="paper-fade" />
            </div>
          </div>

          <span className="paper-note paper-note-one" aria-hidden="true">
            <Check />
            Selectable text
          </span>
          <span className="paper-note paper-note-two" aria-hidden="true">
            <Check />
            Embedded fonts
          </span>
          <span className="paper-note paper-note-three" aria-hidden="true">
            <Check />
            Single column
          </span>

          <p className="paper-caption">
            The actual template used for every PDF export.
          </p>
        </div>
      </div>
    </section>
  );
}
