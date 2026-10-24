import {
  FileDown,
  PenLine,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

type Step = {
  number: string;
  icon: LucideIcon;
  title: string;
  copy: string;
};

const STEPS: Step[] = [
  {
    number: "01",
    icon: PenLine,
    title: "Add the real stuff",
    copy: "Six fixed sections: contact, summary, experience, education, projects, and skills. Nothing to format.",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "Write with a nudge",
    copy: "Draft a summary, turn notes into bullets, or improve one line. Keep only what sounds like you.",
  },
  {
    number: "03",
    icon: Target,
    title: "Tailor to the job",
    copy: "Paste a description. See the missing keywords and rewrites for your summary and top bullets.",
  },
  {
    number: "04",
    icon: FileDown,
    title: "Score it. Send it.",
    copy: "Run ten free checks, fix what is flagged, then download one clean A4 PDF with selectable text.",
  },
];

export function HowItWorks() {
  return (
    <section className="section how-section" id="how">
      <div className="container">
        <div className="section-head" data-reveal>
          <p className="eyebrow">
            <span />
            How it works
          </p>
          <h2 className="section-title">
            Four steps. <span className="soft">No blank page.</span>
          </h2>
          <p className="section-sub">
            The editor is deliberately small. You bring the facts; it handles the
            shape, the wording prompts, and the file at the end.
          </p>
        </div>

        <div className="steps-grid">
          {STEPS.map((step) => (
            <article key={step.number} className="step-card" data-reveal>
              <span className="step-watermark" aria-hidden="true">
                {step.number}
              </span>
              <span className="step-icon">
                <step.icon aria-hidden="true" />
              </span>
              <p className="step-number">Step {step.number}</p>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
