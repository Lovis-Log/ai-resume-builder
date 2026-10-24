"use client";

import {
  ArrowUpRight,
  Check,
  Download,
  FileJson,
  ShieldCheck,
} from "lucide-react";
import { TemplateMini } from "@/components/app/atoms";
import {
  ACCENTS,
  TEMPLATES,
  type DemoResume,
  type Density,
  type TemplateId,
} from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./panel-header";

const DENSITIES: { id: Density; label: string }[] = [
  { id: "compact", label: "Compact" },
  { id: "comfortable", label: "Comfortable" },
  { id: "airy", label: "Airy" },
];

export function DesignPanel({
  resume,
  active,
  onUpdate,
  onExportJson,
}: {
  resume: DemoResume;
  active: boolean;
  onUpdate: (updater: (resume: DemoResume) => DemoResume) => void;
  onExportJson: () => void;
}) {
  function setTemplate(template: TemplateId) {
    onUpdate((current) => ({ ...current, template }));
  }

  function setAccent(accent: string) {
    onUpdate((current) => ({ ...current, accent }));
  }

  function setDensity(density: Density) {
    onUpdate((current) => ({ ...current, density }));
  }

  return (
    <section className="studio-panel design-panel" hidden={!active}>
      <div className="studio-panel-scroll">
        <PanelHeader
          eyebrow="Make it yours"
          title="Find your style."
          description="A beautiful frame for a great story. Your content stays intact as you explore."
        />

        <div className="studio-field-group">
          <div className="studio-field-group-head">
            <span>Template</span>
            <small>03 curated styles</small>
          </div>
          <div className="template-picker">
            {TEMPLATES.map((template) => {
              const selected = resume.template === template.id;
              return (
                <button
                  type="button"
                  key={template.id}
                  className={cn(
                    "template-picker-card",
                    selected && "is-selected",
                  )}
                  onClick={() => setTemplate(template.id)}
                  aria-pressed={selected}
                >
                  <TemplateMini
                    template={template.id}
                    accent={resume.accent}
                  />
                  <span>{template.name}</span>
                  {selected ? (
                    <i aria-hidden="true">
                      <Check size={10} />
                    </i>
                  ) : null}
                </button>
              );
            })}
          </div>
          <p className="design-template-note">
            Every template is single-column and ATS-safe. Only the mood changes.
          </p>
        </div>

        <div className="studio-field-group">
          <div className="studio-field-group-head">
            <span>Accent color</span>
            <small>{ACCENTS.find((accent) => accent.value === resume.accent)?.name ?? "Custom"}</small>
          </div>
          <div className="design-swatches" role="group" aria-label="Accent color">
            {ACCENTS.map((accent) => {
              const selected = resume.accent === accent.value;
              return (
                <button
                  key={accent.value}
                  type="button"
                  className={cn("design-swatch", selected && "is-selected")}
                  style={{ "--swatch": accent.value } as React.CSSProperties}
                  onClick={() => setAccent(accent.value)}
                  aria-label={`Use ${accent.name}`}
                  aria-pressed={selected}
                  title={accent.name}
                >
                  {selected ? <Check size={12} aria-hidden="true" /> : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="studio-field-group">
          <div className="studio-field-group-head">
            <span>Page spacing</span>
            <small>Adjust content density</small>
          </div>
          <div className="design-segmented" role="group" aria-label="Page density">
            {DENSITIES.map((density) => (
              <button
                key={density.id}
                type="button"
                className={resume.density === density.id ? "is-selected" : ""}
                onClick={() => setDensity(density.id)}
                aria-pressed={resume.density === density.id}
              >
                {density.label}
              </button>
            ))}
          </div>
        </div>

        <div className="studio-field-group">
          <div className="studio-field-group-head">
            <span>Document format</span>
            <small>Export ready</small>
          </div>
          <div className="design-document-row">
            <span>Paper size</span>
            <strong>A4 — 210 × 297 mm</strong>
          </div>
          <div className="design-document-row">
            <span>Structure</span>
            <strong>Single column</strong>
          </div>
          <div className="design-document-badge">
            <ShieldCheck size={16} aria-hidden="true" />
            <span>
              <strong>ATS-safe by design</strong>
              No tables, icons, photos, or hidden columns.
            </span>
          </div>
        </div>

        <div className="design-note-card">
          <span>
            <SparkIcon />
          </span>
          <p>
            Beautiful is good. Readable is better. Lume&apos;s templates
            prioritize legible typography and a clear document structure.
          </p>
        </div>

        <div className="design-actions">
          <button type="button" className="app-btn app-btn--soft" onClick={onExportJson}>
            <FileJson size={15} aria-hidden="true" />
            Download editable JSON
          </button>
          <span>
            <Download size={13} aria-hidden="true" />
            PDF uses your browser&apos;s print dialog.
            <ArrowUpRight size={12} aria-hidden="true" />
          </span>
        </div>
      </div>
    </section>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      width="16"
      height="16"
      aria-hidden="true"
    >
      <path d="M12 3c.6 4.7 3.3 7.4 8 8-4.7.6-7.4 3.3-8 8-.6-4.7-3.3-7.4-8-8 4.7-.6 7.4-3.3 8-8Z" />
    </svg>
  );
}
