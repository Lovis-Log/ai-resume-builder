import { forwardRef, type CSSProperties, type KeyboardEvent } from "react";
import { formatRange, splitSkills } from "@/lib/resume/format";
import type { ResumeRecord } from "@/lib/resume/types";

type ResumeSection =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "projects"
  | "skills";

function Section({
  title,
  section,
  onSectionClick,
  children,
}: {
  title: string;
  section: ResumeSection;
  onSectionClick?: (section: ResumeSection) => void;
  children: React.ReactNode;
}) {
  const interactive = Boolean(onSectionClick);

  function onKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (!onSectionClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSectionClick(section);
    }
  }

  return (
    <section
      className={`lume-doc-section${interactive ? " is-interactive" : ""}`}
      data-resume-section={section}
      onClick={interactive ? () => onSectionClick?.(section) : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={interactive ? `Edit ${title.toLowerCase()}` : undefined}
    >
      <div className="lume-doc-section-head">
        <h2>{title}</h2>
        <span aria-hidden="true" />
      </div>
      {children}
    </section>
  );
}

export const ResumeDocument = forwardRef<
  HTMLElement,
  {
    resume: ResumeRecord;
    className?: string;
    onSectionClick?: (section: ResumeSection) => void;
    ariaHidden?: boolean;
  }
>(function ResumeDocument(
  { resume, className = "", onSectionClick, ariaHidden },
  ref,
) {
  const { content } = resume;
  const experience = content.experience.filter(
    (entry) =>
      entry.title.trim() ||
      entry.company.trim() ||
      entry.bullets.some((bullet) => bullet.trim()),
  );
  const education = content.education.filter(
    (entry) =>
      entry.school.trim() ||
      entry.degree.trim() ||
      entry.honors.trim() ||
      entry.coursework.trim(),
  );
  const projects = content.projects.filter(
    (entry) =>
      entry.name.trim() ||
      entry.bullets.some((bullet) => bullet.trim()),
  );
  const skills = splitSkills(content.skills);
  const contact = [
    content.contact.email,
    content.contact.phone,
    content.contact.location,
    content.contact.website,
  ].filter((value) => value.trim());

  const hasBody =
    content.summary.trim() ||
    experience.length > 0 ||
    education.length > 0 ||
    projects.length > 0 ||
    skills.length > 0;

  const year = new Date(resume.createdAt).getUTCFullYear() || 2026;

  return (
    <article
      ref={ref}
      className={`lume-doc lume-doc--${resume.template} lume-doc--${resume.density} ${className}`.trim()}
      style={{ "--resume-accent": resume.accent } as CSSProperties}
      aria-label={ariaHidden ? undefined : "Resume preview"}
      aria-hidden={ariaHidden || undefined}
    >
      <header
        className={`lume-doc-head${onSectionClick ? " is-interactive" : ""}`}
        data-resume-section="personal"
        onClick={
          onSectionClick ? () => onSectionClick("personal") : undefined
        }
        role={onSectionClick ? "button" : undefined}
        tabIndex={onSectionClick ? 0 : undefined}
        onKeyDown={
          onSectionClick
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSectionClick("personal");
                }
              }
            : undefined
        }
        aria-label={onSectionClick ? "Edit personal details" : undefined}
      >
        <p className="lume-doc-overline">Curriculum vitae · {year}</p>
        <h1>
          {content.contact.fullName.trim() || (
            <span className="lume-doc-placeholder">Your Name</span>
          )}
        </h1>
        <p className="lume-doc-role">
          {content.contact.headline.trim() || (
            <span className="lume-doc-placeholder">Your title</span>
          )}
        </p>
        {contact.length > 0 ? (
          <div className="lume-doc-contact">
            {contact.map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}
                {index < contact.length - 1 ? (
                  <i aria-hidden="true">·</i>
                ) : null}
              </span>
            ))}
          </div>
        ) : (
          <div className="lume-doc-contact">
            <span className="lume-doc-placeholder">
              email · phone · city
            </span>
          </div>
        )}
      </header>

      {content.summary.trim() ? (
        <Section title="Profile" section="summary" onSectionClick={onSectionClick}>
          <p className="lume-doc-summary">{content.summary}</p>
        </Section>
      ) : null}

      {experience.length > 0 ? (
        <Section title="Experience" section="experience" onSectionClick={onSectionClick}>
          {experience.map((entry) => (
            <div className="lume-doc-entry" key={entry.id}>
              <div className="lume-doc-entry-head">
                <div>
                  <h3>{entry.title || "Role"}</h3>
                  <p className="lume-doc-entry-meta">
                    {[entry.company, entry.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="lume-doc-dates">
                  {formatRange(entry.startDate, entry.endDate, entry.current)}
                </span>
              </div>
              {entry.bullets.some((bullet) => bullet.trim()) ? (
                <ul className="lume-doc-bullets">
                  {entry.bullets
                    .filter((bullet) => bullet.trim())
                    .map((bullet, index) => (
                      <li key={`${entry.id}-${index}`}>{bullet}</li>
                    ))}
                </ul>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section title="Education" section="education" onSectionClick={onSectionClick}>
          {education.map((entry) => (
            <div className="lume-doc-entry" key={entry.id}>
              <div className="lume-doc-entry-head">
                <div>
                  <h3>{entry.degree || entry.school || "Degree"}</h3>
                  <p className="lume-doc-entry-meta">
                    {[entry.school, entry.location].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <span className="lume-doc-dates">
                  {formatRange(entry.startDate, entry.endDate, false)}
                </span>
              </div>
              {entry.gpa || entry.honors ? (
                <p className="lume-doc-education-note">
                  {[entry.gpa ? `GPA ${entry.gpa}` : "", entry.honors]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              ) : null}
              {entry.coursework ? (
                <p className="lume-doc-education-note">
                  <span>Coursework:</span> {entry.coursework}
                </p>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {projects.length > 0 ? (
        <Section title="Selected Projects" section="projects" onSectionClick={onSectionClick}>
          {projects.map((entry) => (
            <div className="lume-doc-entry" key={entry.id}>
              <div className="lume-doc-entry-head">
                <div>
                  <h3>{entry.name || "Project"}</h3>
                  {entry.link ? (
                    <p className="lume-doc-entry-meta">{entry.link}</p>
                  ) : null}
                </div>
                <span className="lume-doc-dates">
                  {formatRange(entry.startDate, entry.endDate, false)}
                </span>
              </div>
              {entry.bullets.some((bullet) => bullet.trim()) ? (
                <ul className="lume-doc-bullets">
                  {entry.bullets
                    .filter((bullet) => bullet.trim())
                    .map((bullet, index) => (
                      <li key={`${entry.id}-${index}`}>{bullet}</li>
                    ))}
                </ul>
              ) : null}
            </div>
          ))}
        </Section>
      ) : null}

      {skills.length > 0 ? (
        <Section title="Skills & Tools" section="skills" onSectionClick={onSectionClick}>
          <div className="lume-doc-skills">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </Section>
      ) : null}

      {!hasBody ? (
        <div className="lume-doc-empty">
          <span />
          <p>Your story starts here.</p>
          <small>
            Add a summary, a role, or a project. The page will build itself
            around your words.
          </small>
        </div>
      ) : null}

      <footer className="lume-doc-foot" aria-hidden="true">
        <span />
        Made with Lume
      </footer>
    </article>
  );
});
