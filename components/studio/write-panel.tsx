"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
  Briefcase,
  ChevronDown,
  FileText,
  FolderKanban,
  GraduationCap,
  Layers,
  Lightbulb,
  Plus,
  Sparkles,
  Trash2,
  UserRound,
  WandSparkles,
} from "lucide-react";
import { splitSkills } from "@/lib/demo/format";
import type {
  DemoEducation,
  DemoExperience,
  DemoProject,
  DemoResume,
  DemoResumeContent,
} from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./panel-header";
import type { StudioSection } from "./studio-types";

type ContentUpdater = (updater: (content: DemoResumeContent) => DemoResumeContent) => void;

type SectionMeta = {
  id: StudioSection;
  name: string;
  description: string;
  icon: ReactNode;
  tone: "blue" | "lavender" | "mint" | "sand";
};

const SECTIONS: SectionMeta[] = [
  {
    id: "personal",
    name: "Personal details",
    description: "The essentials at the top of your page.",
    icon: <UserRound size={18} aria-hidden="true" />,
    tone: "blue",
  },
  {
    id: "summary",
    name: "Professional summary",
    description: "A short opening that earns the next line.",
    icon: <Lightbulb size={18} aria-hidden="true" />,
    tone: "lavender",
  },
  {
    id: "experience",
    name: "Experience",
    description: "Roles, outcomes, and the work that mattered.",
    icon: <Briefcase size={18} aria-hidden="true" />,
    tone: "mint",
  },
  {
    id: "education",
    name: "Education",
    description: "Where the foundation was built.",
    icon: <GraduationCap size={18} aria-hidden="true" />,
    tone: "lavender",
  },
  {
    id: "projects",
    name: "Selected projects",
    description: "Proof of what you can make.",
    icon: <FolderKanban size={18} aria-hidden="true" />,
    tone: "sand",
  },
  {
    id: "skills",
    name: "Skills & tools",
    description: "The vocabulary of your craft.",
    icon: <Layers size={18} aria-hidden="true" />,
    tone: "blue",
  },
];

function createId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function emptyExperience(): DemoExperience {
  return {
    id: createId("exp"),
    title: "",
    company: "",
    location: "",
    startDate: "",
    endDate: "",
    current: false,
    bullets: [""],
  };
}

function emptyEducation(): DemoEducation {
  return {
    id: createId("edu"),
    school: "",
    degree: "",
    location: "",
    startDate: "",
    endDate: "",
    gpa: "",
    coursework: "",
    honors: "",
  };
}

function emptyProject(): DemoProject {
  return {
    id: createId("project"),
    name: "",
    link: "",
    startDate: "",
    endDate: "",
    bullets: [""],
  };
}

function Accordion({
  section,
  meta,
  open,
  onToggle,
  children,
}: {
  section: StudioSection;
  meta: SectionMeta;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      className={cn("write-accordion", open && "is-open")}
      id={`write-${section}`}
      data-section={section}
    >
      <button
        type="button"
        className="write-accordion-trigger"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`write-${section}-body`}
      >
        <span className={`write-section-icon write-section-icon--${meta.tone}`}>
          {meta.icon}
        </span>
        <span className="write-accordion-copy">
          <strong>{meta.name}</strong>
          <small>{meta.description}</small>
        </span>
        <ChevronDown
          size={16}
          className="write-accordion-chevron"
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div className="write-accordion-body" id={`write-${section}-body`}>
          {children}
        </div>
      ) : null}
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  full,
  maxLength,
  disabled,
  hint,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "month" | "url";
  full?: boolean;
  maxLength?: number;
  disabled?: boolean;
  hint?: string;
}) {
  return (
    <label className={cn("app-field", full && "app-field--full")} htmlFor={id}>
      <span className="app-field-label">{label}</span>
      <input
        id={id}
        className="app-input"
        type={type}
        value={value}
        onChange={(event: ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        maxLength={maxLength}
        disabled={disabled}
      />
      {hint ? <small className="app-field-hint">{hint}</small> : null}
    </label>
  );
}

function TextAreaField({
  id,
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  full,
  maxLength,
  labelAction,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  full?: boolean;
  maxLength?: number;
  labelAction?: ReactNode;
}) {
  return (
    <div className={cn("app-field", full && "app-field--full")}>
      <div className="app-field-label-row">
        <label className="app-field-label" htmlFor={id}>
          {label}
        </label>
        {labelAction}
      </div>
      <textarea
        id={id}
        className="app-input app-textarea"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
      />
    </div>
  );
}

export function WritePanel({
  resume,
  active,
  pageCount,
  openSections,
  onToggleSection,
  onEnsureSection,
  onUpdate,
  onOpenAISummary,
  onImproveBullet,
}: {
  resume: DemoResume;
  active: boolean;
  pageCount: number;
  openSections: Set<StudioSection>;
  onToggleSection: (section: StudioSection) => void;
  onEnsureSection: (section: StudioSection) => void;
  onUpdate: (updater: (resume: DemoResume) => DemoResume) => void;
  onOpenAISummary: () => void;
  onImproveBullet: (experienceId: string, bulletIndex: number) => void;
}) {
  const { content } = resume;
  const skills = splitSkills(content.skills);

  const updateContent: ContentUpdater = (updater) => {
    onUpdate((current) => ({
      ...current,
      content: updater(current.content),
    }));
  };

  function updateContact(
    field: keyof DemoResumeContent["contact"],
    value: string,
  ) {
    onUpdate((current) => ({
      ...current,
      targetRole:
        field === "headline" ? value || current.targetRole : current.targetRole,
      content: {
        ...current.content,
        contact: { ...current.content.contact, [field]: value },
      },
    }));
  }

  function updateExperience(
    experienceId: string,
    patch: Partial<DemoExperience>,
  ) {
    updateContent((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function updateBullet(
    experienceId: string,
    bulletIndex: number,
    value: string,
  ) {
    updateContent((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId
          ? {
              ...entry,
              bullets: entry.bullets.map((bullet, index) =>
                index === bulletIndex ? value : bullet,
              ),
            }
          : entry,
      ),
    }));
  }

  function addBullet(experienceId: string) {
    updateContent((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId
          ? { ...entry, bullets: [...entry.bullets, ""].slice(0, 10) }
          : entry,
      ),
    }));
  }

  function removeBullet(experienceId: string, bulletIndex: number) {
    updateContent((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === experienceId
          ? {
              ...entry,
              bullets: entry.bullets.filter((_, index) => index !== bulletIndex),
            }
          : entry,
      ),
    }));
  }

  function addExperience() {
    updateContent((current) => ({
      ...current,
      experience: [...current.experience, emptyExperience()],
    }));
    onEnsureSection("experience");
  }

  function removeExperience(id: string) {
    updateContent((current) => ({
      ...current,
      experience: current.experience.filter((entry) => entry.id !== id),
    }));
  }

  function updateEducation(id: string, patch: Partial<DemoEducation>) {
    updateContent((current) => ({
      ...current,
      education: current.education.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function addEducation() {
    updateContent((current) => ({
      ...current,
      education: [...current.education, emptyEducation()],
    }));
    onEnsureSection("education");
  }

  function removeEducation(id: string) {
    updateContent((current) => ({
      ...current,
      education: current.education.filter((entry) => entry.id !== id),
    }));
  }

  function updateProject(id: string, patch: Partial<DemoProject>) {
    updateContent((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function updateProjectBullet(
    projectId: string,
    bulletIndex: number,
    value: string,
  ) {
    updateContent((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === projectId
          ? {
              ...entry,
              bullets: entry.bullets.map((bullet, index) =>
                index === bulletIndex ? value : bullet,
              ),
            }
          : entry,
      ),
    }));
  }

  function addProject() {
    updateContent((current) => ({
      ...current,
      projects: [...current.projects, emptyProject()],
    }));
    onEnsureSection("projects");
  }

  function removeProject(id: string) {
    updateContent((current) => ({
      ...current,
      projects: current.projects.filter((entry) => entry.id !== id),
    }));
  }

  const progressItems = [
    content.contact.fullName,
    content.contact.headline,
    content.contact.email,
    content.contact.phone,
    content.contact.location,
    content.contact.website,
    content.summary,
    content.experience.length > 0,
    content.education.length > 0,
    content.projects.length > 0,
    skills.length > 0,
  ];
  const completion = Math.round(
    (progressItems.filter(Boolean).length / progressItems.length) * 100,
  );

  return (
    <section className="studio-panel write-panel" hidden={!active}>
      <div className="studio-panel-scroll">
        <PanelHeader
          eyebrow="Build your story"
          title="Craft your resume."
          description="The details that make you, you. Everything you type appears on the page immediately."
        >
          <div className="write-progress">
            <div className="write-progress-track" aria-hidden="true">
              <span style={{ width: `${completion}%` }} />
            </div>
            <span>{completion}% complete</span>
          </div>
        </PanelHeader>

        <div className="write-sections">
          <p className="write-sections-label">Resume sections</p>

          <Accordion
            section="personal"
            meta={SECTIONS[0]}
            open={openSections.has("personal")}
            onToggle={() => onToggleSection("personal")}
          >
            <div className="write-fields-grid">
              <Field
                id="contact-name"
                label="Full name"
                value={content.contact.fullName}
                onChange={(value) => updateContact("fullName", value)}
                placeholder="Your full name"
                maxLength={80}
              />
              <Field
                id="contact-headline"
                label="Job title / focus"
                value={content.contact.headline}
                onChange={(value) => updateContact("headline", value)}
                placeholder="Product Designer"
                maxLength={100}
              />
              <Field
                id="contact-email"
                label="Email address"
                type="email"
                value={content.contact.email}
                onChange={(value) => updateContact("email", value)}
                placeholder="name@example.com"
                full
                maxLength={120}
              />
              <Field
                id="contact-phone"
                label="Phone number"
                type="tel"
                value={content.contact.phone}
                onChange={(value) => updateContact("phone", value)}
                placeholder="+1 (000) 000-0000"
                maxLength={40}
              />
              <Field
                id="contact-location"
                label="Location"
                value={content.contact.location}
                onChange={(value) => updateContact("location", value)}
                placeholder="City, Country"
                maxLength={80}
              />
              <Field
                id="contact-website"
                label="Website / portfolio"
                value={content.contact.website}
                onChange={(value) => updateContact("website", value)}
                placeholder="yourname.com"
                full
                maxLength={120}
              />
            </div>
          </Accordion>

          <Accordion
            section="summary"
            meta={SECTIONS[1]}
            open={openSections.has("summary")}
            onToggle={() => onToggleSection("summary")}
          >
            <TextAreaField
              id="summary"
              label="About you"
              value={content.summary}
              onChange={(value) =>
                updateContent((current) => ({ ...current, summary: value }))
              }
              placeholder="What do you do, who do you do it for, and what makes your work worth a second look?"
              rows={5}
              maxLength={800}
            />
            <div className="write-field-footer">
              <span>{content.summary.trim().length} / 800 characters</span>
              <button
                type="button"
                className="write-ai-link"
                onClick={onOpenAISummary}
              >
                <Sparkles size={14} aria-hidden="true" />
                Shape this with Lume
              </button>
            </div>
          </Accordion>

          <Accordion
            section="experience"
            meta={SECTIONS[2]}
            open={openSections.has("experience")}
            onToggle={() => onToggleSection("experience")}
          >
            {content.experience.length === 0 ? (
              <button
                type="button"
                className="write-empty-entry"
                onClick={addExperience}
              >
                <span>
                  <Briefcase size={18} aria-hidden="true" />
                </span>
                <strong>Add your first role</strong>
                <small>Internship, freelance, part-time — it all counts.</small>
              </button>
            ) : (
              <div className="write-entry-list">
                {content.experience.map((entry, entryIndex) => (
                  <article className="write-entry-card" key={entry.id}>
                    <header className="write-entry-head">
                      <span>
                        Role {String(entryIndex + 1).padStart(2, "0")}
                        {entry.company ? ` · ${entry.company}` : ""}
                      </span>
                      <button
                        type="button"
                        className="write-icon-button is-danger"
                        onClick={() => removeExperience(entry.id)}
                        aria-label={`Remove ${entry.title || `role ${entryIndex + 1}`}`}
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </header>

                    <div className="write-fields-grid">
                      <Field
                        id={`experience-title-${entry.id}`}
                        label="Job title"
                        value={entry.title}
                        onChange={(value) =>
                          updateExperience(entry.id, { title: value })
                        }
                        placeholder="Product Designer"
                        full
                        maxLength={100}
                      />
                      <Field
                        id={`experience-company-${entry.id}`}
                        label="Company"
                        value={entry.company}
                        onChange={(value) =>
                          updateExperience(entry.id, { company: value })
                        }
                        placeholder="Studio name"
                        maxLength={100}
                      />
                      <Field
                        id={`experience-location-${entry.id}`}
                        label="Location"
                        value={entry.location}
                        onChange={(value) =>
                          updateExperience(entry.id, { location: value })
                        }
                        placeholder="Remote"
                        maxLength={80}
                      />
                      <Field
                        id={`experience-start-${entry.id}`}
                        label="Start"
                        type="month"
                        value={entry.startDate}
                        onChange={(value) =>
                          updateExperience(entry.id, { startDate: value })
                        }
                      />
                      <Field
                        id={`experience-end-${entry.id}`}
                        label="End"
                        type="month"
                        value={entry.current ? "" : entry.endDate}
                        onChange={(value) =>
                          updateExperience(entry.id, { endDate: value })
                        }
                        disabled={entry.current}
                        hint={entry.current ? "Currently in this role" : undefined}
                      />
                    </div>

                    <label className="app-check-row app-check-row--compact">
                      <input
                        type="checkbox"
                        checked={entry.current}
                        onChange={(event) =>
                          updateExperience(entry.id, {
                            current: event.target.checked,
                            endDate: event.target.checked ? "" : entry.endDate,
                          })
                        }
                      />
                      <span className="app-check-box" aria-hidden="true">
                        <span />
                      </span>
                      Currently working here
                    </label>

                    <div className="write-bullets-head">
                      <span>Highlights</span>
                      <small>One achievement per line</small>
                    </div>
                    <div className="write-bullet-list">
                      {entry.bullets.map((bullet, bulletIndex) => (
                        <div className="write-bullet" key={`${entry.id}-${bulletIndex}`}>
                          <span className="write-bullet-mark" aria-hidden="true">
                            <FileText size={13} />
                          </span>
                          <textarea
                            value={bullet}
                            onChange={(event) =>
                              updateBullet(entry.id, bulletIndex, event.target.value)
                            }
                            rows={2}
                            maxLength={420}
                            placeholder="Start with a verb. Add a result if you have one."
                            aria-label={`${entry.title || "Role"} bullet ${bulletIndex + 1}`}
                            className="app-input app-textarea write-bullet-input"
                          />
                          <div className="write-bullet-actions">
                            <button
                              type="button"
                              className="write-icon-button"
                              onClick={() =>
                                onImproveBullet(entry.id, bulletIndex)
                              }
                              aria-label={`Improve bullet ${bulletIndex + 1} with Lume AI`}
                              title="Improve with Lume AI"
                            >
                              <Sparkles size={14} aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              className="write-icon-button"
                              onClick={() => removeBullet(entry.id, bulletIndex)}
                              aria-label={`Remove bullet ${bulletIndex + 1}`}
                              title="Remove bullet"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {entry.bullets.length < 10 ? (
                      <button
                        type="button"
                        className="write-add-line"
                        onClick={() => addBullet(entry.id)}
                      >
                        <Plus size={14} aria-hidden="true" />
                        Add a highlight
                      </button>
                    ) : null}
                  </article>
                ))}
              </div>
            )}

            <button type="button" className="write-add-entry" onClick={addExperience}>
              <Plus size={15} aria-hidden="true" />
              Add another role
            </button>
          </Accordion>

          <Accordion
            section="education"
            meta={SECTIONS[3]}
            open={openSections.has("education")}
            onToggle={() => onToggleSection("education")}
          >
            {content.education.length === 0 ? (
              <button
                type="button"
                className="write-empty-entry"
                onClick={addEducation}
              >
                <span>
                  <GraduationCap size={18} aria-hidden="true" />
                </span>
                <strong>Add your education</strong>
                <small>Degree, program, or the coursework that matters here.</small>
              </button>
            ) : (
              <div className="write-entry-list">
                {content.education.map((entry, index) => (
                  <article className="write-entry-card" key={entry.id}>
                    <header className="write-entry-head">
                      <span>
                        Education {String(index + 1).padStart(2, "0")}
                      </span>
                      <button
                        type="button"
                        className="write-icon-button is-danger"
                        onClick={() => removeEducation(entry.id)}
                        aria-label="Remove education entry"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </header>
                    <div className="write-fields-grid">
                      <Field
                        id={`education-school-${entry.id}`}
                        label="Institution"
                        value={entry.school}
                        onChange={(value) =>
                          updateEducation(entry.id, { school: value })
                        }
                        placeholder="School or program"
                        maxLength={100}
                      />
                      <Field
                        id={`education-degree-${entry.id}`}
                        label="Degree / qualification"
                        value={entry.degree}
                        onChange={(value) =>
                          updateEducation(entry.id, { degree: value })
                        }
                        placeholder="B.A. in ..."
                        maxLength={100}
                      />
                      <Field
                        id={`education-location-${entry.id}`}
                        label="Location"
                        value={entry.location}
                        onChange={(value) =>
                          updateEducation(entry.id, { location: value })
                        }
                        placeholder="City, Country"
                        maxLength={80}
                      />
                      <Field
                        id={`education-gpa-${entry.id}`}
                        label="GPA (optional)"
                        value={entry.gpa}
                        onChange={(value) =>
                          updateEducation(entry.id, { gpa: value })
                        }
                        placeholder="3.8 / 4.0"
                        maxLength={20}
                      />
                      <Field
                        id={`education-start-${entry.id}`}
                        label="Start"
                        type="month"
                        value={entry.startDate}
                        onChange={(value) =>
                          updateEducation(entry.id, { startDate: value })
                        }
                      />
                      <Field
                        id={`education-end-${entry.id}`}
                        label="End"
                        type="month"
                        value={entry.endDate}
                        onChange={(value) =>
                          updateEducation(entry.id, { endDate: value })
                        }
                      />
                      <Field
                        id={`education-honors-${entry.id}`}
                        label="Honors (optional)"
                        value={entry.honors}
                        onChange={(value) =>
                          updateEducation(entry.id, { honors: value })
                        }
                        placeholder="Dean's List"
                        full
                        maxLength={180}
                      />
                    </div>
                    <TextAreaField
                      id={`education-coursework-${entry.id}`}
                      label="Relevant coursework (optional)"
                      value={entry.coursework}
                      onChange={(value) =>
                        updateEducation(entry.id, { coursework: value })
                      }
                      placeholder="Interface Design, Research Methods, Typography"
                      rows={2}
                      maxLength={240}
                    />
                  </article>
                ))}
              </div>
            )}
            <button type="button" className="write-add-entry" onClick={addEducation}>
              <Plus size={15} aria-hidden="true" />
              Add education
            </button>
          </Accordion>

          <Accordion
            section="projects"
            meta={SECTIONS[4]}
            open={openSections.has("projects")}
            onToggle={() => onToggleSection("projects")}
          >
            {content.projects.length === 0 ? (
              <button
                type="button"
                className="write-empty-entry"
                onClick={addProject}
              >
                <span>
                  <FolderKanban size={18} aria-hidden="true" />
                </span>
                <strong>Show a project</strong>
                <small>A side project can say more than another bullet point.</small>
              </button>
            ) : (
              <div className="write-entry-list">
                {content.projects.map((entry, index) => (
                  <article className="write-entry-card" key={entry.id}>
                    <header className="write-entry-head">
                      <span>Project {String(index + 1).padStart(2, "0")}</span>
                      <button
                        type="button"
                        className="write-icon-button is-danger"
                        onClick={() => removeProject(entry.id)}
                        aria-label="Remove project"
                      >
                        <Trash2 size={14} aria-hidden="true" />
                      </button>
                    </header>
                    <div className="write-fields-grid">
                      <Field
                        id={`project-name-${entry.id}`}
                        label="Project name"
                        value={entry.name}
                        onChange={(value) =>
                          updateProject(entry.id, { name: value })
                        }
                        placeholder="Common Ground"
                        full
                        maxLength={100}
                      />
                      <Field
                        id={`project-link-${entry.id}`}
                        label="Link (optional)"
                        value={entry.link}
                        onChange={(value) =>
                          updateProject(entry.id, { link: value })
                        }
                        placeholder="project.com"
                        full
                        maxLength={160}
                      />
                      <Field
                        id={`project-start-${entry.id}`}
                        label="Start"
                        type="month"
                        value={entry.startDate}
                        onChange={(value) =>
                          updateProject(entry.id, { startDate: value })
                        }
                      />
                      <Field
                        id={`project-end-${entry.id}`}
                        label="End"
                        type="month"
                        value={entry.endDate}
                        onChange={(value) =>
                          updateProject(entry.id, { endDate: value })
                        }
                      />
                    </div>
                    <div className="write-bullets-head">
                      <span>Highlights</span>
                      <small>What changed because you built it?</small>
                    </div>
                    <div className="write-bullet-list">
                      {entry.bullets.map((bullet, bulletIndex) => (
                        <div className="write-bullet" key={`${entry.id}-${bulletIndex}`}>
                          <textarea
                            value={bullet}
                            onChange={(event) =>
                              updateProjectBullet(
                                entry.id,
                                bulletIndex,
                                event.target.value,
                              )
                            }
                            rows={2}
                            maxLength={420}
                            placeholder="Describe the outcome, not just the build."
                            aria-label={`Project bullet ${bulletIndex + 1}`}
                            className="app-input app-textarea write-bullet-input"
                          />
                          <div className="write-bullet-actions">
                            <button
                              type="button"
                              className="write-icon-button"
                              onClick={() => {
                                updateContent((current) => ({
                                  ...current,
                                  projects: current.projects.map((project) =>
                                    project.id === entry.id
                                      ? {
                                          ...project,
                                          bullets: project.bullets.filter(
                                            (_, bulletIndexToRemove) =>
                                              bulletIndexToRemove !== bulletIndex,
                                          ),
                                        }
                                      : project,
                                  ),
                                }));
                              }}
                              aria-label="Remove project bullet"
                            >
                              <Trash2 size={14} aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="write-add-line"
                      onClick={() =>
                        updateContent((current) => ({
                          ...current,
                          projects: current.projects.map((project) =>
                            project.id === entry.id
                              ? {
                                  ...project,
                                  bullets: [...project.bullets, ""].slice(0, 10),
                                }
                              : project,
                          ),
                        }))
                      }
                    >
                      <Plus size={14} aria-hidden="true" />
                      Add a highlight
                    </button>
                  </article>
                ))}
              </div>
            )}
            <button type="button" className="write-add-entry" onClick={addProject}>
              <Plus size={15} aria-hidden="true" />
              Add a project
            </button>
          </Accordion>

          <Accordion
            section="skills"
            meta={SECTIONS[5]}
            open={openSections.has("skills")}
            onToggle={() => onToggleSection("skills")}
          >
            <TextAreaField
              id="skills"
              label="Skills and tools"
              value={content.skills}
              onChange={(value) =>
                updateContent((current) => ({ ...current, skills: value }))
              }
              placeholder="Product Strategy, UX Research, Figma, Prototyping"
              rows={3}
              maxLength={600}
            />
            <div className="write-skill-chips" aria-label="Parsed skills">
              {skills.length > 0 ? (
                skills.map((skill) => <span key={skill}>{skill}</span>)
              ) : (
                <small>Separate skills with commas. Each one appears as a tag.</small>
              )}
            </div>
            <p className="write-field-note">
              {skills.length} skill{skills.length === 1 ? "" : "s"} · The score
              looks for at least five.
            </p>
          </Accordion>
        </div>

        <div className="write-panel-tip">
          <WandSparkles size={15} aria-hidden="true" />
          <span>
            Tip: click any section on the page preview to jump straight back to
            its fields.
          </span>
          <span className="write-panel-page-count">
            {pageCount} page{pageCount === 1 ? "" : "s"}
          </span>
        </div>
      </div>
    </section>
  );
}
