"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  Layers,
  Type,
} from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { useWorkspace } from "@/components/app/workspace-store";
import { CreateResumeDialog } from "@/components/dashboard/create-resume-dialog";
import { ResumeDocument } from "@/components/studio/resume-document";
import { SAMPLE_RESUME_CONTENT } from "@/lib/resume/defaults";
import {
  TEMPLATES,
  type ResumeRecord,
  type TemplateId,
} from "@/lib/resume/types";

const PREVIEW_RESUME: ResumeRecord = {
  id: "template-preview",
  title: "Template preview",
  targetRole: "Product Designer",
  template: "modern",
  accent: "#416af5",
  density: "comfortable",
  content: SAMPLE_RESUME_CONTENT,
  version: 0,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const FACTS = [
  {
    icon: Layers,
    title: "Still one column",
    copy: "No sidebars or parsing traps. The page reads top to bottom, every time.",
  },
  {
    icon: Type,
    title: "One type family, well set",
    copy: "Readable sizes, generous spacing, and a clear hierarchy for a quick scan.",
  },
  {
    icon: Check,
    title: "Selectable, exportable",
    copy: "Real text, A4 sizing, and a clean print path. Nothing flattening into an image.",
  },
];

export function TemplatesClient() {
  const { resumes } = useWorkspace();
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<TemplateId>("modern");
  const source = resumes[0] ?? PREVIEW_RESUME;

  function choose(template: TemplateId) {
    setSelected(template);
    setCreateOpen(true);
  }

  return (
    <div className="lume-page lume-templates-page">
      <AppTopbar />
      <main className="templates-main">
        <div className="templates-intro">
          <Link href="/dashboard" className="template-back-link">
            <ArrowLeft size={14} aria-hidden="true" />
            Workspace
          </Link>
          <p className="app-eyebrow">
            <span aria-hidden="true" />
            The page, your way
          </p>
          <h1>
            Three quiet frames<span>.</span>
          </h1>
          <p>
            The template should disappear behind your work. Choose a tone for
            the page; your words stay exactly where you put them.
          </p>
        </div>

        <div className="template-gallery">
          {TEMPLATES.map((template, index) => {
            const sample = source
              ? {
                  ...source,
                  template: template.id,
                  accent:
                    template.id === "classic"
                      ? "#313e55"
                      : template.id === "editorial"
                        ? "#916af7"
                        : "#416af5",
                  density:
                    template.id === "editorial"
                      ? ("airy" as const)
                      : template.id === "classic"
                        ? ("compact" as const)
                        : ("comfortable" as const),
                }
              : null;

            return (
              <article
                className="template-gallery-card"
                key={template.id}
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="template-gallery-stage">
                  <span className="template-gallery-glow" aria-hidden="true" />
                  {sample ? (
                    <div className="template-gallery-page" aria-hidden="true">
                      <ResumeDocument resume={sample} ariaHidden />
                    </div>
                  ) : null}
                </div>
                <div className="template-gallery-copy">
                  <div>
                    <span className="template-gallery-index">
                      0{index + 1} · {template.tone}
                    </span>
                    <h2>{template.name}</h2>
                    <p>{template.description}</p>
                  </div>
                  <button
                    type="button"
                    className="template-use-button"
                    onClick={() => choose(template.id)}
                  >
                    Use {template.name}
                    <ArrowUpRight size={15} aria-hidden="true" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

        <section className="template-facts" aria-label="Template standards">
          <div className="template-facts-head">
            <p className="app-eyebrow">The constant</p>
            <h2>Different mood. Same honest page.</h2>
          </div>
          <div className="template-fact-grid">
            {FACTS.map((fact) => {
              const Icon = fact.icon;
              return (
                <div className="template-fact" key={fact.title}>
                  <span>
                    <Icon size={17} aria-hidden="true" />
                  </span>
                  <h3>{fact.title}</h3>
                  <p>{fact.copy}</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {createOpen ? (
        <CreateResumeDialog
          open
          onClose={() => setCreateOpen(false)}
          initialTemplate={selected}
        />
      ) : null}
    </div>
  );
}
