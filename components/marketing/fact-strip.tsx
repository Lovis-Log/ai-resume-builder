import { FileText, ShieldCheck, Sparkles, Target } from "lucide-react";

const FACTS = [
  {
    icon: ShieldCheck,
    title: "Free 10-check score",
    copy: "No AI action, no card, no sign-up wall.",
  },
  {
    icon: FileText,
    title: "ATS-safe by default",
    copy: "Single column, real text, embedded fonts.",
  },
  {
    icon: Target,
    title: "Built to tailor",
    copy: "Keyword gaps and rewrites you approve.",
  },
  {
    icon: Sparkles,
    title: "AI on your terms",
    copy: "Opt in, review every line, keep what is true.",
  },
];

export function FactStrip() {
  return (
    <section className="fact-strip" aria-label="Product highlights">
      <div className="container fact-strip-grid">
        {FACTS.map((fact) => (
          <div key={fact.title} className="fact-item">
            <span className="fact-icon">
              <fact.icon aria-hidden="true" />
            </span>
            <div>
              <h2>{fact.title}</h2>
              <p>{fact.copy}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
