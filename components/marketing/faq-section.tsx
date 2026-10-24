import { ArrowUpRight, Plus } from "lucide-react";

const FAQS = [
  {
    question: "Is the PDF really ATS-safe?",
    answer:
      "The template is single-column with selectable text and embedded fonts. There are no tables, icons, photos, sidebars, or text boxes. We test extraction with pdftotext and check font embedding before each release. No one can guarantee every applicant tracking system behaves the same, but this avoids the common failure modes.",
  },
  {
    question: "Does the AI invent experience?",
    answer:
      "The prompts tell it to use only the facts you provide, and tailoring suggestions must include source quotes that are checked against your resume. You review every change before applying it. AI can still be wrong, so treat it as a drafting assistant — not a source of truth.",
  },
  {
    question: "What leaves the app for AI?",
    answer:
      "Only when you opt in: your resume text and, for tailoring, the job description. They go to DeepSeek. The editor, the score, and PDF export do not use AI. You can use the whole product without enabling AI.",
  },
  {
    question: "What do I actually get for free?",
    answer:
      "One resume at a time, three AI actions for life, three PDF downloads for life, the full 10-check score, and the ATS-safe template. A full tailoring run uses two AI actions, so the free tier includes one complete run.",
  },
  {
    question: "What happens when I cancel Pro?",
    answer:
      "You keep access through the end of the paid period. After that, the account returns to free limits for new resumes, AI actions, and downloads. Any extra resumes you created stay viewable and editable.",
  },
  {
    question: "Why only one template?",
    answer:
      "One excellent ATS-safe template is more useful than ten mediocre ones. More templates may come later. For now, the constraint is the feature: no layout decisions, no accidental formatting mistakes, no guessing whether the design is the problem.",
  },
];

export function FaqSection() {
  return (
    <section className="section faq-section" id="faq">
      <div className="container faq-grid">
        <div className="faq-copy" data-reveal>
          <p className="eyebrow">
            <span />
            FAQ
          </p>
          <h2 className="section-title">
            Questions worth <span className="soft">asking.</span>
          </h2>
          <p className="section-sub">
            The honest answers, including what the AI can get wrong and why the
            free tier is deliberately small.
          </p>
          <a href="mailto:support@lume.app" className="text-link">
            Ask us something else
            <ArrowUpRight aria-hidden="true" />
          </a>
        </div>

        <div className="faq-list" data-reveal>
          {FAQS.map((item) => (
            <details key={item.question} className="faq-item">
              <summary>
                <span>{item.question}</span>
                <span className="faq-plus" aria-hidden="true">
                  <Plus />
                </span>
              </summary>
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
