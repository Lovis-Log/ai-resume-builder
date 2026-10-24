"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  FileText,
  Minus,
  Plus,
} from "lucide-react";
import type { DemoResume } from "@/lib/demo/types";
import { ResumeDocument } from "./resume-document";
import type { StudioSection } from "./studio-types";

const A4_HEIGHT = 1123;
const A4_WIDTH = 794;

export function PreviewPanel({
  resume,
  pageCount,
  zoom,
  onZoomChange,
  onPageCountChange,
  onEditSection,
}: {
  resume: DemoResume;
  pageCount: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onPageCountChange: (pages: number) => void;
  onEditSection: (section: StudioSection) => void;
}) {
  const sheetRef = useRef<HTMLElement | null>(null);
  const [documentHeight, setDocumentHeight] = useState(A4_HEIGHT);

  useEffect(() => {
    const element = sheetRef.current;
    if (!element) return;

    const measure = () => {
      const height = element.scrollHeight;
      setDocumentHeight(height);
      const pages = Math.max(1, Math.ceil((height - 12) / A4_HEIGHT));
      onPageCountChange(pages);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [onPageCountChange, resume.template, resume.density]);

  function changeZoom(delta: number) {
    const next = Math.round((zoom + delta) * 100) / 100;
    onZoomChange(Math.min(1.1, Math.max(0.5, next)));
  }

  return (
    <section className="studio-preview-panel" aria-label="Live resume preview">
      <div className="preview-toolbar">
        <div className="preview-status">
          <span className="preview-live-dot" aria-hidden="true" />
          <span>Live preview</span>
          <i aria-hidden="true" />
          <span className="preview-format">A4 document</span>
        </div>
        <div className="preview-toolbar-right">
          <span className="preview-page-label">
            <FileText size={13} aria-hidden="true" />
            Page 1 of {pageCount}
          </span>
          <div className="preview-zoom" aria-label="Preview zoom">
            <button
              type="button"
              onClick={() => changeZoom(-0.05)}
              aria-label="Zoom out"
              disabled={zoom <= 0.5}
            >
              <Minus size={13} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="preview-zoom-value"
              onClick={() => onZoomChange(0.72)}
              title="Reset zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              type="button"
              onClick={() => changeZoom(0.05)}
              aria-label="Zoom in"
              disabled={zoom >= 1.1}
            >
              <Plus size={13} aria-hidden="true" />
            </button>
          </div>
          <span className="preview-doc-menu" aria-hidden="true">
            <ChevronDown size={13} />
          </span>
        </div>
      </div>

      <div className="preview-scroll">
        <div
          className="preview-stage"
          style={{
            width: `${A4_WIDTH * zoom}px`,
            height: `${documentHeight * zoom}px`,
          }}
        >
          <div
            className="preview-stage-sheet"
            style={{ transform: `scale(${zoom})` }}
          >
            <ResumeDocument
              key={`${resume.template}-${resume.density}`}
              ref={sheetRef}
              resume={resume}
              onSectionClick={onEditSection}
            />
          </div>
        </div>
        {pageCount > 1 ? (
          <span
            className="preview-page-break"
            style={{ top: `${A4_HEIGHT * zoom + 24}px` }}
            aria-hidden="true"
          >
            Page break
          </span>
        ) : null}
      </div>

      <div className="preview-footer">
        <span>
          <Check size={13} aria-hidden="true" />
          Your edits appear here automatically
        </span>
        <span>Click any section to edit</span>
      </div>
    </section>
  );
}
