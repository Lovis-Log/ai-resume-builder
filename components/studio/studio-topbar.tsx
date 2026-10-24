"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronRight,
  Download,
  LayoutTemplate,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { AppUserMenu } from "@/components/app/app-user-menu";
import { LumeLogo } from "@/components/brand/logo";
import type { SaveState } from "./studio-types";

export function StudioTopbar({
  title,
  saveState,
  score,
  onRename,
  onOpenDesign,
  onOpenScore,
  onExport,
}: {
  title: string;
  saveState: SaveState;
  score: number;
  onRename: (title: string) => void;
  onOpenDesign: () => void;
  onOpenScore: () => void;
  onExport: () => void;
}) {
  const [draft, setDraft] = useState(title);
  const inputRef = useRef<HTMLInputElement | null>(null);

  function commit() {
    const next = draft.trim();
    if (!next) {
      setDraft(title);
      return;
    }
    if (next === title) return;
    onRename(next);
  }

  return (
    <header className="studio-topbar">
      <div className="studio-brand-wrap">
        <Link href="/dashboard" className="studio-brand" aria-label="Back to workspace">
          <LumeLogo id="studio-topbar" />
        </Link>
        <span className="studio-topbar-separator" aria-hidden="true" />
      </div>

      <div className="studio-breadcrumb">
        <Link href="/dashboard" className="studio-breadcrumb-workspace">
          Workspace
        </Link>
        <ChevronRight
          size={13}
          className="studio-breadcrumb-chevron"
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          className="studio-title-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.currentTarget.blur();
            }
            if (event.key === "Escape") {
              setDraft(title);
              event.currentTarget.blur();
            }
          }}
          aria-label="Resume title"
          spellCheck={false}
        />
      </div>

      <div className="studio-top-actions">
        <span
          className={`studio-save-status${saveState === "saving" ? " is-saving" : ""}`}
          role="status"
          aria-live="polite"
        >
          {saveState === "saving" ? (
            <Loader2 size={12} className="is-spinning" aria-hidden="true" />
          ) : (
            <Check size={12} aria-hidden="true" />
          )}
          <span>
            {saveState === "saving" ? "Saving changes…" : "All changes saved"}
          </span>
        </span>

        <div className="studio-top-divider" aria-hidden="true" />

        <button
          type="button"
          className="studio-top-action"
          onClick={onOpenDesign}
          aria-label="Templates and design"
        >
          <LayoutTemplate size={16} aria-hidden="true" />
          <span>Templates</span>
        </button>

        <button
          type="button"
          className="studio-score-button"
          onClick={onOpenScore}
          aria-label={`Resume score ${score} out of 100`}
        >
          <ShieldCheck size={15} aria-hidden="true" />
          <span>{score}</span>
        </button>

        <button
          type="button"
          className="app-btn app-btn--primary studio-export-button"
          onClick={onExport}
          aria-label="Export resume"
        >
          <Download size={15} aria-hidden="true" />
          <span>Export PDF</span>
        </button>

        <div className="studio-top-divider" aria-hidden="true" />
        <AppUserMenu />
      </div>
    </header>
  );
}
