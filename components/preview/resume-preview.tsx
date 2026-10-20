"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { formatDateRange, splitSkills } from "@/lib/resume/format";
import type { ResumeContent } from "@/lib/resume/schema";
import { cn } from "@/lib/utils";

const A4_HEIGHT_PX = 1123;

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="resume-section">
      <h2 className="resume-section-title">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ bullets }: { bullets: string[] }) {
  const filled = bullets.map((bullet) => bullet.trim()).filter(Boolean);
  if (filled.length === 0) return null;

  return (
    <div>
      {filled.map((bullet, index) => (
        <div key={index} className="resume-bullet">
          <span className="resume-bullet-mark">•</span>
          <span>{bullet}</span>
        </div>
      ))}
    </div>
  );
}

export function ResumePreview({
  content,
  onPageCountChange,
  className,
}: {
  content: ResumeContent;
  onPageCountChange?: (pages: number) => void;
  className?: string;
}) {
  const sheetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!sheetRef.current || !onPageCountChange) return;

    const element = sheetRef.current;
    const measure = () => {
      const height = element.scrollHeight;
      const pages = Math.max(1, Math.ceil(height / A4_HEIGHT_PX));
      onPageCountChange(pages);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [onPageCountChange]);

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
      entry.major.trim() ||
      entry.coursework.trim() ||
      entry.honors.trim(),
  );
  const projects = content.projects.filter(
    (entry) =>
      entry.name.trim() ||
      entry.link.trim() ||
      entry.bullets.some((bullet) => bullet.trim()),
  );
  const skills = splitSkills(content.skills);
  const contactLine = [
    content.contact.email,
    content.contact.phone,
    content.contact.location,
  ]
    .map((value) => value.trim())
    .filter(Boolean)
    .join(" | ");

  return (
    <article
      ref={sheetRef}
      className={cn("resume-sheet", className)}
      aria-label="Resume preview"
    >
      <h1
        className={cn(
          "resume-name",
          !content.contact.fullName.trim() && "opacity-35",
        )}
      >
        {content.contact.fullName.trim() || "Your Name"}
      </h1>
      {contactLine ? (
        <p className="resume-contact">{contactLine}</p>
      ) : (
        <p className="resume-contact opacity-35">
          email | phone | location
        </p>
      )}

      {content.summary.trim() ? (
        <Section title="Summary">
          <p>{content.summary.trim()}</p>
        </Section>
      ) : null}

      {experience.length > 0 ? (
        <Section title="Experience">
          {experience.map((entry) => {
            const dates = formatDateRange(
              entry.startDate,
              entry.endDate,
              entry.current,
            );
            return (
              <div key={entry.id} className="resume-entry">
                <p className="resume-entry-title">
                  {[entry.title.trim(), entry.company.trim(), dates]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                {entry.location.trim() ? (
                  <p className="resume-meta">{entry.location.trim()}</p>
                ) : null}
                <Bullets bullets={entry.bullets} />
              </div>
            );
          })}
        </Section>
      ) : null}

      {education.length > 0 ? (
        <Section title="Education">
          {education.map((entry) => {
            const dates = formatDateRange(entry.startDate, entry.endDate, false);
            return (
              <div key={entry.id} className="resume-entry">
                <p className="resume-entry-title">
                  {[entry.degree.trim(), entry.major.trim(), entry.school.trim(), dates]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                {entry.location.trim() ? (
                  <p className="resume-meta">{entry.location.trim()}</p>
                ) : null}
                {entry.gpa.trim() ? (
                  <p className="resume-meta">GPA: {entry.gpa.trim()}</p>
                ) : null}
                {entry.coursework.trim() ? (
                  <p>Coursework: {entry.coursework.trim()}</p>
                ) : null}
                {entry.honors.trim() ? (
                  <p>Honors: {entry.honors.trim()}</p>
                ) : null}
              </div>
            );
          })}
        </Section>
      ) : null}

      {projects.length > 0 ? (
        <Section title="Projects">
          {projects.map((entry) => {
            const dates = formatDateRange(entry.startDate, entry.endDate, false);
            return (
              <div key={entry.id} className="resume-entry">
                <p className="resume-entry-title">
                  {[entry.name.trim(), entry.link.trim(), dates]
                    .filter(Boolean)
                    .join(" | ")}
                </p>
                <Bullets bullets={entry.bullets} />
              </div>
            );
          })}
        </Section>
      ) : null}

      {skills.length > 0 ? (
        <Section title="Skills">
          <p>{skills.join(", ")}</p>
        </Section>
      ) : null}
    </article>
  );
}
