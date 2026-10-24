import {
  AlignLeft,
  Briefcase,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Download,
  FolderKanban,
  GraduationCap,
  Search,
  Sparkles,
  User,
  Wrench,
} from "lucide-react";
import { LumeLogo } from "@/components/brand/logo";
import { MARKETING_RESUME_CONTENT as demo } from "@/lib/marketing/demo";
import { formatDateRange } from "@/lib/resume/format";

const RAIL_ITEMS = [
  { label: "Contact", icon: User },
  { label: "Summary", icon: AlignLeft },
  { label: "Experience", icon: Briefcase, active: true },
  { label: "Education", icon: GraduationCap },
  { label: "Projects", icon: FolderKanban },
  { label: "Skills", icon: Wrench },
];

export function EditorMockup({ score }: { score: number }) {
  const firstRole = demo.experience[0];
  const education = demo.education[0];

  return (
    <div className="editor-mock" aria-hidden="true">
      <div className="mock-topbar">
        <div className="mock-crumbs">
          <ChevronLeft className="mock-back" />
          <span>Dashboard</span>
          <span className="mock-slash">/</span>
          <strong>My Resume</strong>
        </div>
        <div className="mock-save">
          <span className="mock-save-dot" />
          All changes saved
        </div>
        <div className="mock-topbar-actions">
          <span className="mock-icon-button">
            <Search />
          </span>
          <span className="mock-avatar">J</span>
          <span className="mock-button ghost">Preview</span>
          <span className="mock-button primary">
            <Download />
            Download PDF
          </span>
        </div>
      </div>

      <div className="mock-body">
        <aside className="mock-rail">
          <LumeLogo
            id="mock"
            className="mock-rail-brand"
            markClassName="mock-mark"
            wordmarkClassName="mock-rail-wordmark"
          />
          <p className="mock-rail-label">Build</p>
          {RAIL_ITEMS.map((item) => (
            <div
              key={item.label}
              className={`mock-rail-item${item.active ? " active" : ""}`}
            >
              <item.icon />
              {item.label}
            </div>
          ))}
          <div className="mock-rail-bottom">
            <p className="mock-rail-label">Plan</p>
            <div className="mock-rail-plan">
              <span className="mock-rail-plan-dot" />
              Free
              <span>3 AI left</span>
            </div>
          </div>
        </aside>

        <div className="mock-form">
          <div className="mock-form-head">
            <div>
              <p className="mock-doc-title">My Resume</p>
              <p className="mock-doc-sub">
                <Check /> All changes saved
              </p>
            </div>
            <span className="mock-ai-badge">
              <Sparkles /> 3 AI actions left
            </span>
          </div>

          <section className="mock-card">
            <div className="mock-card-head">
              Contact
              <ChevronUp />
            </div>
            <div className="mock-field-grid">
              <div className="mock-field">
                <span>Full name</span>
                <div className="mock-input">Jordan Lee</div>
              </div>
              <div className="mock-field">
                <span>Email</span>
                <div className="mock-input">jordan.lee@example.com</div>
              </div>
              <div className="mock-field">
                <span>Phone</span>
                <div className="mock-input">+1 (555) 012-3456</div>
              </div>
              <div className="mock-field">
                <span>Location</span>
                <div className="mock-input">Toronto, Canada</div>
              </div>
            </div>
          </section>

          <section className="mock-card">
            <div className="mock-card-head">
              Summary
              <span className="mock-inline-action">
                <Sparkles /> Write summary
              </span>
            </div>
            <p className="mock-summary-text">{demo.summary}</p>
          </section>

          <section className="mock-card">
            <div className="mock-card-head">
              Experience
              <ChevronUp />
            </div>
            <div className="mock-entry">
              <div className="mock-entry-head">
                <div>
                  <strong>{firstRole.title}</strong>
                  <span>{firstRole.company}</span>
                </div>
                <span className="mock-entry-dates">
                  {formatDateRange(firstRole.startDate, firstRole.endDate, false)}
                </span>
              </div>
              <ul className="mock-bullet-list">
                {firstRole.bullets.slice(0, 2).map((bullet) => (
                  <li key={bullet}>
                    <span className="mock-bullet-dot" />
                    <span>{bullet}</span>
                    <Sparkles className="mock-bullet-spark" />
                  </li>
                ))}
              </ul>
              <span className="mock-add-row">+ Add bullet</span>
            </div>
          </section>

          <div className="mock-collapsed">
            <GraduationCap />
            Education
            <ChevronDown />
          </div>
          <div className="mock-collapsed">
            <FolderKanban />
            Projects
            <ChevronDown />
          </div>
          <div className="mock-collapsed">
            <Wrench />
            Skills
            <ChevronDown />
          </div>
        </div>

        <aside className="mock-preview">
          <div className="mock-tabs">
            <span className="active">Preview</span>
            <span>Score {score}</span>
            <span>Tailor</span>
          </div>
          <div className="mock-paper">
            <h3>{demo.contact.fullName}</h3>
            <p className="mock-paper-contact">
              {demo.contact.email} <i /> {demo.contact.phone} <i />{" "}
              {demo.contact.location}
            </p>
            <p className="mock-paper-label">Summary</p>
            <p className="mock-paper-copy">{demo.summary}</p>
            <p className="mock-paper-label">Experience</p>
            <div className="mock-paper-role">
              <strong>{firstRole.title}</strong>
              <span>
                {formatDateRange(firstRole.startDate, firstRole.endDate, false)}
              </span>
            </div>
            <p className="mock-paper-meta">
              {firstRole.company} · {firstRole.location}
            </p>
            <ul className="mock-paper-bullets">
              {firstRole.bullets.slice(0, 2).map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
            <p className="mock-paper-label">Education</p>
            <div className="mock-paper-role">
              <strong>
                {education.degree}, {education.major}
              </strong>
              <span>2021 – 2025</span>
            </div>
            <p className="mock-paper-meta">{education.school}</p>
            <p className="mock-paper-label">Skills</p>
            <p className="mock-paper-copy">{demo.skills}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
