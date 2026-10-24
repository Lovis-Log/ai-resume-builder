import { ArrowUpRight, Check, Sparkles } from "lucide-react";
import { LumeLogo } from "@/components/brand/logo";

const AI_RAIL = ["My resume", "AI assistant", "Templates"];

export function AiWritingDemo() {
  return (
    <div className="ai-demo-card" aria-hidden="true">
      <div className="ai-demo-rail">
        <LumeLogo
          id="ai"
          className="ai-demo-brand"
          markClassName="ai-demo-mark"
          wordmarkClassName="ai-demo-wordmark"
        />
        <p className="ai-demo-rail-label">Workspace</p>
        {AI_RAIL.map((item) => (
          <div
            key={item}
            className={`ai-demo-rail-item${item === "AI assistant" ? " active" : ""}`}
          >
            <span />
            {item}
          </div>
        ))}
        <div className="ai-demo-rail-footer">
          <span className="ai-demo-rail-dot" />
          Opt-in only
        </div>
      </div>

      <div className="ai-demo-body">
        <div className="ai-demo-head">
          <div>
            <h3>Make every word count.</h3>
            <p>Your own thoughtful writing partner.</p>
          </div>
          <span className="ai-demo-pill">
            <Sparkles />
            AI assistant
          </span>
        </div>

        <div className="ai-bubble ai-bubble-assistant">
          <span className="ai-bubble-label">
            <Sparkles /> AI writing assistant
          </span>
          <p>
            Let’s turn that experience into a stronger bullet. What did you
            actually build or improve?
          </p>
        </div>

        <div className="ai-bubble ai-bubble-user">
          <p>
            I helped redesign our team’s onboarding and made it easier for new
            customers to get started.
          </p>
        </div>

        <div className="ai-bubble ai-bubble-result">
          <span className="ai-bubble-label">
            <Sparkles /> Here’s a stronger version
          </span>
          <p>
            Redesigned the customer onboarding journey, reducing friction and
            giving first-time users a clearer path to value.
            <span className="ai-caret" />
          </p>
          <span className="ai-bubble-dots">
            <i />
            <i />
            <i />
          </span>
        </div>

        <div className="ai-demo-footer">
          <span className="ai-demo-cost">
            <span />
            Uses 1 AI action
          </span>
          <span className="ai-demo-button">
            Insert bullet
            <ArrowUpRight />
          </span>
        </div>

        <div className="ai-demo-saved">
          <Check />
          Only charged when the output is valid
        </div>
      </div>
    </div>
  );
}
