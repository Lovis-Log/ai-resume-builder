"use client";

import type { ReactNode } from "react";
import {
  Plus,
  Sparkles,
  Trash2,
  WandSparkles,
} from "lucide-react";
import {
  createEmptyEducation,
  createEmptyExperience,
  createEmptyProject,
} from "@/lib/resume/defaults";
import type {
  EducationEntry,
  ExperienceEntry,
  ProjectEntry,
  ResumeContent,
} from "@/lib/resume/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type Updater = (updater: (current: ResumeContent) => ResumeContent) => void;

function SectionCard({
  id,
  title,
  description,
  action,
  children,
}: {
  id: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card id={id} className="scroll-mt-24 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-stone-900">{title}</h2>
          <p className="mt-1 text-sm text-stone-500">{description}</p>
        </div>
        {action}
      </div>
      <div className="mt-5">{children}</div>
    </Card>
  );
}

function AiButton({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <Sparkles className="h-3.5 w-3.5" />
      {children}
    </Button>
  );
}

export function ResumeForm({
  content,
  onChange,
  onWriteSummary,
  onWriteBullets,
  onImprove,
}: {
  content: ResumeContent;
  onChange: Updater;
  onWriteSummary: () => void;
  onWriteBullets: (entryId: string) => void;
  onImprove: (entryId: string, index: number, bullet: string) => void;
}) {
  function updateContact(field: keyof ResumeContent["contact"], value: string) {
    onChange((current) => ({
      ...current,
      contact: { ...current.contact, [field]: value },
    }));
  }

  function updateExperience(id: string, patch: Partial<ExperienceEntry>) {
    onChange((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function updateBullet(entryId: string, index: number, value: string) {
    onChange((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              bullets: entry.bullets.map((bullet, bulletIndex) =>
                bulletIndex === index ? value : bullet,
              ),
            }
          : entry,
      ),
    }));
  }

  function addBullet(entryId: string) {
    onChange((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === entryId
          ? { ...entry, bullets: [...entry.bullets, ""].slice(0, 10) }
          : entry,
      ),
    }));
  }

  function removeBullet(entryId: string, index: number) {
    onChange((current) => ({
      ...current,
      experience: current.experience.map((entry) =>
        entry.id === entryId
          ? {
              ...entry,
              bullets: entry.bullets.filter((_, bulletIndex) => bulletIndex !== index),
            }
          : entry,
      ),
    }));
  }

  function updateEducation(id: string, patch: Partial<EducationEntry>) {
    onChange((current) => ({
      ...current,
      education: current.education.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function updateProject(id: string, patch: Partial<ProjectEntry>) {
    onChange((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    }));
  }

  function updateProjectBullet(projectId: string, index: number, value: string) {
    onChange((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === projectId
          ? {
              ...entry,
              bullets: entry.bullets.map((bullet, bulletIndex) =>
                bulletIndex === index ? value : bullet,
              ),
            }
          : entry,
      ),
    }));
  }

  function addProjectBullet(projectId: string) {
    onChange((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === projectId
          ? { ...entry, bullets: [...entry.bullets, ""].slice(0, 10) }
          : entry,
      ),
    }));
  }

  function removeProjectBullet(projectId: string, index: number) {
    onChange((current) => ({
      ...current,
      projects: current.projects.map((entry) =>
        entry.id === projectId
          ? {
              ...entry,
              bullets: entry.bullets.filter((_, bulletIndex) => bulletIndex !== index),
            }
          : entry,
      ),
    }));
  }

  return (
    <div className="space-y-5">
      <SectionCard
        id="contact"
        title="Contact"
        description="Keep it short. Recruiters and ATS parsers need the essentials."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="fullName">Full name</Label>
            <Input
              id="fullName"
              value={content.contact.fullName}
              onChange={(event) => updateContact("fullName", event.target.value)}
              maxLength={200}
              placeholder="Jordan Lee"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={content.contact.email}
              onChange={(event) => updateContact("email", event.target.value)}
              maxLength={200}
              placeholder="jordan@example.com"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={content.contact.phone}
              onChange={(event) => updateContact("phone", event.target.value)}
              maxLength={200}
              placeholder="+1 (555) 012-3456"
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={content.contact.location}
              onChange={(event) => updateContact("location", event.target.value)}
              maxLength={200}
              placeholder="Toronto, Canada"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard
        id="summary"
        title="Summary"
        description="Two or three sentences on what you bring. Optional, but it helps the score."
        action={<AiButton onClick={onWriteSummary}>Write summary</AiButton>}
      >
        <Label htmlFor="summary-text">Professional summary</Label>
        <Textarea
          id="summary-text"
          value={content.summary}
          onChange={(event) =>
            onChange((current) => ({ ...current, summary: event.target.value }))
          }
          maxLength={2000}
          rows={4}
          placeholder="Computer science graduate with internship experience building accessible web applications…"
        />
        <p className="mt-1 text-xs text-stone-400">
          {content.summary.length}/2000 · No first-person pronouns
        </p>
      </SectionCard>

      <SectionCard
        id="experience"
        title="Experience"
        description="Internships, part-time work, research, or anything with real responsibility."
      >
        <div className="space-y-4">
          {content.experience.map((entry, entryIndex) => (
            <div
              key={entry.id}
              className="rounded-xl border border-stone-200 bg-stone-50/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Role {entryIndex + 1}
                </p>
                <div className="flex items-center gap-1">
                  <AiButton onClick={() => onWriteBullets(entry.id)}>
                    Write bullets
                  </AiButton>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Remove this experience entry?")) {
                        onChange((current) => ({
                          ...current,
                          experience: current.experience.filter(
                            (item) => item.id !== entry.id,
                          ),
                        }));
                      }
                    }}
                    className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                    aria-label="Remove experience"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Job title</Label>
                  <Input
                    value={entry.title}
                    onChange={(event) =>
                      updateExperience(entry.id, { title: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Software Engineering Intern"
                  />
                </div>
                <div>
                  <Label>Company</Label>
                  <Input
                    value={entry.company}
                    onChange={(event) =>
                      updateExperience(entry.id, { company: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Northstar Labs"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={entry.location}
                    onChange={(event) =>
                      updateExperience(entry.id, { location: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Remote"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start</Label>
                    <Input
                      type="month"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateExperience(entry.id, { startDate: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input
                      type="month"
                      value={entry.current ? "" : entry.endDate ?? ""}
                      onChange={(event) =>
                        updateExperience(entry.id, {
                          endDate: event.target.value,
                          current: false,
                        })
                      }
                      disabled={entry.current}
                    />
                  </div>
                </div>
              </div>

              <label className="mt-3 flex items-center gap-2 text-sm text-stone-600">
                <input
                  type="checkbox"
                  checked={entry.current}
                  onChange={(event) =>
                    updateExperience(entry.id, {
                      current: event.target.checked,
                      endDate: event.target.checked ? null : entry.endDate,
                    })
                  }
                  className="h-4 w-4 rounded border-stone-300 text-[var(--accent)]"
                />
                I currently work here
              </label>

              <div className="mt-4 space-y-2">
                <Label>Bullets</Label>
                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start gap-2">
                    <span className="mt-2.5 w-4 flex-none text-center text-stone-400">
                      •
                    </span>
                    <Textarea
                      value={bullet}
                      onChange={(event) =>
                        updateBullet(entry.id, bulletIndex, event.target.value)
                      }
                      maxLength={500}
                      rows={2}
                      className="min-h-16"
                      placeholder="Built a dashboard in React that reduced support tickets by 18%."
                    />
                    <div className="flex flex-none gap-1">
                      <button
                        type="button"
                        onClick={() => onImprove(entry.id, bulletIndex, bullet)}
                        disabled={!bullet.trim()}
                        className="rounded-md p-2 text-stone-400 hover:bg-teal-50 hover:text-[var(--accent)] disabled:opacity-40"
                        aria-label="Improve bullet"
                        title="Improve with AI"
                      >
                        <WandSparkles className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBullet(entry.id, bulletIndex)}
                        className="rounded-md p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove bullet"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addBullet(entry.id)}
                  disabled={entry.bullets.length >= 10}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add bullet
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange((current) => ({
                ...current,
                experience: [...current.experience, createEmptyExperience()],
              }))
            }
            disabled={content.experience.length >= 20}
          >
            <Plus className="h-3.5 w-3.5" />
            Add experience
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        id="education"
        title="Education"
        description="Include your degree, expected graduation date, GPA if strong, and relevant coursework."
      >
        <div className="space-y-4">
          {content.education.map((entry, entryIndex) => (
            <div
              key={entry.id}
              className="rounded-xl border border-stone-200 bg-stone-50/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Education {entryIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove this education entry?")) {
                      onChange((current) => ({
                        ...current,
                        education: current.education.filter(
                          (item) => item.id !== entry.id,
                        ),
                      }));
                    }
                  }}
                  className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove education"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>School</Label>
                  <Input
                    value={entry.school}
                    onChange={(event) =>
                      updateEducation(entry.id, { school: event.target.value })
                    }
                    maxLength={200}
                    placeholder="University of Toronto"
                  />
                </div>
                <div>
                  <Label>Degree</Label>
                  <Input
                    value={entry.degree}
                    onChange={(event) =>
                      updateEducation(entry.id, { degree: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Bachelor of Science"
                  />
                </div>
                <div>
                  <Label>Major / field</Label>
                  <Input
                    value={entry.major}
                    onChange={(event) =>
                      updateEducation(entry.id, { major: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Computer Science"
                  />
                </div>
                <div>
                  <Label>Location</Label>
                  <Input
                    value={entry.location}
                    onChange={(event) =>
                      updateEducation(entry.id, { location: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Toronto, Canada"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start</Label>
                    <Input
                      type="month"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateEducation(entry.id, { startDate: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input
                      type="month"
                      value={entry.endDate}
                      onChange={(event) =>
                        updateEducation(entry.id, { endDate: event.target.value })
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>GPA (optional)</Label>
                  <Input
                    value={entry.gpa}
                    onChange={(event) =>
                      updateEducation(entry.id, { gpa: event.target.value })
                    }
                    maxLength={20}
                    placeholder="3.8/4.0"
                  />
                </div>
              </div>

              <div className="mt-3 space-y-3">
                <div>
                  <Label>Relevant coursework (optional)</Label>
                  <Textarea
                    value={entry.coursework}
                    onChange={(event) =>
                      updateEducation(entry.id, { coursework: event.target.value })
                    }
                    maxLength={1000}
                    rows={2}
                    placeholder="Data Structures, Algorithms, Databases"
                  />
                </div>
                <div>
                  <Label>Honors and activities (optional)</Label>
                  <Textarea
                    value={entry.honors}
                    onChange={(event) =>
                      updateEducation(entry.id, { honors: event.target.value })
                    }
                    maxLength={1000}
                    rows={2}
                    placeholder="Dean's List (2023, 2024)"
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange((current) => ({
                ...current,
                education: [...current.education, createEmptyEducation()],
              }))
            }
            disabled={content.education.length >= 10}
          >
            <Plus className="h-3.5 w-3.5" />
            Add education
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        id="projects"
        title="Projects"
        description="The strongest section for many new grads. Include what you built, the stack, and the outcome."
      >
        <div className="space-y-4">
          {content.projects.map((entry, entryIndex) => (
            <div
              key={entry.id}
              className="rounded-xl border border-stone-200 bg-stone-50/40 p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-medium uppercase tracking-wide text-stone-400">
                  Project {entryIndex + 1}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Remove this project?")) {
                      onChange((current) => ({
                        ...current,
                        projects: current.projects.filter(
                          (item) => item.id !== entry.id,
                        ),
                      }));
                    }
                  }}
                  className="rounded-md p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Remove project"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Project name</Label>
                  <Input
                    value={entry.name}
                    onChange={(event) =>
                      updateProject(entry.id, { name: event.target.value })
                    }
                    maxLength={200}
                    placeholder="Campus Ride Share"
                  />
                </div>
                <div>
                  <Label>Link (optional)</Label>
                  <Input
                    value={entry.link}
                    onChange={(event) =>
                      updateProject(entry.id, { link: event.target.value })
                    }
                    maxLength={500}
                    placeholder="github.com/you/project"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Start</Label>
                    <Input
                      type="month"
                      value={entry.startDate}
                      onChange={(event) =>
                        updateProject(entry.id, { startDate: event.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label>End</Label>
                    <Input
                      type="month"
                      value={entry.endDate}
                      onChange={(event) =>
                        updateProject(entry.id, { endDate: event.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <Label>Bullets</Label>
                {entry.bullets.map((bullet, bulletIndex) => (
                  <div key={bulletIndex} className="flex items-start gap-2">
                    <span className="mt-2.5 w-4 flex-none text-center text-stone-400">
                      •
                    </span>
                    <Textarea
                      value={bullet}
                      onChange={(event) =>
                        updateProjectBullet(entry.id, bulletIndex, event.target.value)
                      }
                      maxLength={500}
                      rows={2}
                      className="min-h-16"
                      placeholder="Built a Next.js and Postgres app that matched 300+ students for shared rides."
                    />
                    <button
                      type="button"
                      onClick={() => removeProjectBullet(entry.id, bulletIndex)}
                      className="mt-1 rounded-md p-2 text-stone-400 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove project bullet"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addProjectBullet(entry.id)}
                  disabled={entry.bullets.length >= 10}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add bullet
                </Button>
              </div>
            </div>
          ))}

          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              onChange((current) => ({
                ...current,
                projects: [...current.projects, createEmptyProject()],
              }))
            }
            disabled={content.projects.length >= 10}
          >
            <Plus className="h-3.5 w-3.5" />
            Add project
          </Button>
        </div>
      </SectionCard>

      <SectionCard
        id="skills"
        title="Skills"
        description="Comma-separated. Include languages, frameworks, tools, and relevant methods."
      >
        <Label htmlFor="skills-input">Skills</Label>
        <Textarea
          id="skills-input"
          value={content.skills}
          onChange={(event) =>
            onChange((current) => ({ ...current, skills: event.target.value }))
          }
          maxLength={1000}
          rows={3}
          placeholder="TypeScript, React, Next.js, Node.js, PostgreSQL, Git"
        />
        <p className="mt-1 text-xs text-stone-400">
          The score wants at least five comma-separated skills.
        </p>
      </SectionCard>
    </div>
  );
}
