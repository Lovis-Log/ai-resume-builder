"use client";

import {
  ArrowUpRight,
  Check,
  Download,
  FileJson,
  FileText,
  LockKeyhole,
  Printer,
} from "lucide-react";
import { AppModal } from "@/components/app/app-modal";
import { TemplateMini } from "@/components/app/atoms";
import { useToast } from "@/components/ui/toast";
import { downloadResumeJson } from "@/lib/demo/download";
import { fileStem } from "@/lib/demo/format";
import type { DemoResume } from "@/lib/demo/types";
import { TEMPLATES } from "@/lib/demo/types";

export function ExportDialog({
  open,
  resume,
  pageCount,
  onClose,
  onPrint,
}: {
  open: boolean;
  resume: DemoResume;
  pageCount: number;
  onClose: () => void;
  onPrint: () => void;
}) {
  const { toast } = useToast();
  const template = TEMPLATES.find((item) => item.id === resume.template);

  function exportJson() {
    downloadResumeJson(resume);
    toast("Editable JSON downloaded.", "success");
  }

  return (
    <AppModal
      open={open}
      onClose={onClose}
      title="Take this page with you."
      description="Everything here is generated in your browser. Choose a format that fits what's next."
      width="lg"
    >
      <div className="export-summary">
        <div className="export-summary-preview">
          <TemplateMini
            template={resume.template}
            accent={resume.accent}
          />
        </div>
        <div className="export-summary-copy">
          <span className="export-eyebrow">
            <Check size={12} aria-hidden="true" />
            ATS-safe · single column
          </span>
          <h3>{resume.title}</h3>
          <p>
            {resume.targetRole || "Untitled role"} · {template?.name ?? "Modern"}
          </p>
          <div className="export-specs">
            <span>A4 · 210 × 297 mm</span>
            <span>
              {pageCount} page{pageCount === 1 ? "" : "s"}
            </span>
            <span>Selectable text</span>
          </div>
        </div>
      </div>

      <div className="export-options">
        <button
          type="button"
          className="export-option export-option--primary"
          onClick={onPrint}
        >
          <span className="export-option-icon">
            <Printer size={19} aria-hidden="true" />
          </span>
          <span className="export-option-copy">
            <span>
              PDF
              <i>Recommended</i>
            </span>
            <strong>Print or save as PDF</strong>
            <small>
              Opens your browser&apos;s print dialog. Choose “Save as PDF” for a
              clean A4 file.
            </small>
          </span>
          <span className="export-option-action">
            <Download size={16} aria-hidden="true" />
          </span>
        </button>

        <button
          type="button"
          className="export-option"
          onClick={exportJson}
        >
          <span className="export-option-icon">
            <FileJson size={19} aria-hidden="true" />
          </span>
          <span className="export-option-copy">
            <span>JSON</span>
            <strong>Download editable copy</strong>
            <small>
              Keep the full structure. Useful for backups or moving the content
              elsewhere.
            </small>
          </span>
          <span className="export-option-action">
            <Download size={16} aria-hidden="true" />
          </span>
        </button>
      </div>

      <div className="export-file-row">
        <FileText size={14} aria-hidden="true" />
        <span>{fileStem(resume.title)}.pdf</span>
        <ArrowUpRight size={12} aria-hidden="true" />
      </div>

      <div className="export-privacy">
        <LockKeyhole size={14} aria-hidden="true" />
        <span>
          No upload, no account, no hidden copy. The page is rendered from your
          local browser data.
        </span>
      </div>
    </AppModal>
  );
}
