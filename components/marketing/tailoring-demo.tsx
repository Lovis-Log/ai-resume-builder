import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import {
  MARKETING_JOB_DESCRIPTION,
  MARKETING_KEYWORDS,
} from "@/lib/marketing/demo";

export function TailoringDemo() {
  return (
    <div className="tailor-demo-card" aria-hidden="true">
      <div className="tailor-demo-head">
        <div>
          <p className="tailor-demo-kicker">Tailor to a job</p>
          <h3>Software Engineer Intern</h3>
        </div>
        <span className="tailor-demo-status">
          <span />
          Analyzed
        </span>
      </div>

      <div className="tailor-demo-jd">
        <p className="tailor-demo-label">Job description</p>
        <p>{MARKETING_JOB_DESCRIPTION}</p>
      </div>

      <div className="tailor-keywords">
        <p className="tailor-demo-label">
          Keywords <span>6 of 10 shown</span>
        </p>
        <div className="tailor-keyword-row">
          {MARKETING_KEYWORDS.map((keyword) => (
            <span
              key={keyword.term}
              className={`keyword${keyword.found ? " found" : " missing"}`}
            >
              {keyword.found ? <Check /> : <ArrowUpRight />}
              {keyword.term}
            </span>
          ))}
        </div>
      </div>

      <div className="tailor-suggestion">
        <div className="tailor-suggestion-head">
          <p>
            <Sparkles />
            Suggested summary
          </p>
          <span>1 of 4 changes</span>
        </div>

        <div className="tailor-compare">
          <div>
            <p className="tailor-compare-label">Original</p>
            <p>
              I am a computer science graduate with internship experience
              building accessible web applications.
            </p>
          </div>
          <div className="suggested">
            <p className="tailor-compare-label">Suggested</p>
            <p>
              Computer science graduate with internship experience building
              accessible, customer-facing web applications in React and
              TypeScript.
            </p>
          </div>
        </div>

        <div className="tailor-apply-row">
          <span className="tailor-checkbox">
            <Check />
            Apply this change
          </span>
          <span className="tailor-source">
            Source quote checked against your resume
          </span>
        </div>
      </div>

      <div className="tailor-demo-footer">
        <span>
          Full run: <strong>2 AI actions</strong>
        </span>
        <span className="tailor-demo-button">Apply selected</span>
      </div>
    </div>
  );
}
