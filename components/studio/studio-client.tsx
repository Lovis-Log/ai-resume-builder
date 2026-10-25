"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Eye,
  Keyboard,
  Pencil,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { AppModal } from "@/components/app/app-modal";
import { useWorkspace } from "@/components/app/workspace-store";
import { LumeLogo } from "@/components/brand/logo";
import { useToast } from "@/components/ui/toast";
import { computeResumeScore } from "@/lib/score/studio";
import type { WorkspaceTool } from "@/lib/resume/types";
import { AiPanel } from "./ai-panel";
import { DesignPanel } from "./design-panel";
import { ExportDialog } from "./export-dialog";
import { PreviewPanel } from "./preview-panel";
import { ResumeDocument } from "./resume-document";
import { ScorePanel } from "./score-panel";
import { StudioTopbar } from "./studio-topbar";
import {
  STUDIO_TOOLS,
  type AiPanelFocus,
  type StudioSection,
} from "./studio-types";
import { TailorPanel } from "./tailor-panel";
import { ToolRail } from "./tool-rail";
import { WritePanel } from "./write-panel";

const INITIAL_SECTIONS: StudioSection[] = [
  "personal",
  "summary",
  "experience",
];

export function StudioClient() {
  const params = useParams<{ id: string }>();
  const resumeId = typeof params.id === "string" ? params.id : params.id?.[0];
  const { getResume, hydrated, updateResume, saveStateFor } = useWorkspace();
  const { toast } = useToast();
  const resume = resumeId ? getResume(resumeId) : undefined;

  const [tool, setTool] = useState<WorkspaceTool>("write");
  const [mobilePreview, setMobilePreview] = useState(false);
  const [zoom, setZoom] = useState(0.72);
  const [pageCount, setPageCount] = useState(1);
  const [openSections, setOpenSections] = useState<Set<StudioSection>>(
    () => new Set(INITIAL_SECTIONS),
  );
  const [aiFocus, setAiFocus] = useState<AiPanelFocus>(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    const width = window.innerWidth;
    const initialZoom =
      width <= 480
        ? 0.42
        : width <= 760
          ? 0.5
          : width <= 980
            ? 0.6
            : width <= 1180
              ? 0.64
              : 0.72;
    const timer = window.setTimeout(() => setZoom(initialZoom), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "") as WorkspaceTool;
    if (!STUDIO_TOOLS.some((item) => item.id === hash)) return;
    const timer = window.setTimeout(() => setTool(hash), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpenSections(new Set(INITIAL_SECTIONS));
      setAiFocus(null);
      setMobilePreview(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [resumeId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        toast("Changes save automatically to your Neon workspace.", "success");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toast]);

  const score = useMemo(
    () => (resume ? computeResumeScore(resume.content, pageCount) : null),
    [resume, pageCount],
  );

  const updateCurrent = useCallback(
    (updater: Parameters<typeof updateResume>[1]) => {
      if (!resumeId) return;
      updateResume(resumeId, updater);
    },
    [resumeId, updateResume],
  );

  const setHash = useCallback((nextTool: WorkspaceTool) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.hash = nextTool === "write" ? "" : nextTool;
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);

  const selectTool = useCallback(
    (nextTool: WorkspaceTool) => {
      setTool(nextTool);
      setMobilePreview(false);
      if (nextTool === "ai") setAiFocus(null);
      setHash(nextTool);
      if (window.innerWidth <= 980) {
        window.scrollTo({ top: 0 });
      }
    },
    [setHash],
  );

  const focusSection = useCallback((section: StudioSection) => {
    setTool("write");
    setMobilePreview(false);
    setOpenSections((current) => {
      const next = new Set(current);
      next.add(section);
      return next;
    });
    setHash("write");

    window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-section="${section}"]`,
      );
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => {
        const field = target?.querySelector<HTMLElement>(
          "input:not([disabled]), textarea, select",
        );
        field?.focus({ preventScroll: true });
      }, 360);
    }, 100);
  }, [setHash]);

  const openAiSummary = useCallback(() => {
    setAiFocus({ kind: "summary", nonce: Date.now() });
    setTool("ai");
    setMobilePreview(false);
    setHash("ai");
  }, [setHash]);

  const improveBullet = useCallback(
    (experienceId: string, bulletIndex: number) => {
      setAiFocus({
        kind: "bullet",
        experienceId,
        bulletIndex,
        nonce: Date.now(),
      });
      setTool("ai");
      setMobilePreview(false);
      setHash("ai");
    },
    [setHash],
  );

  const handlePageCount = useCallback((pages: number) => {
    setPageCount((current) => (current === pages ? current : pages));
  }, []);

  function rename(nextTitle: string) {
    updateCurrent((current) => ({ ...current, title: nextTitle }));
    toast("Resume name updated.", "success");
  }

  function printResume() {
    if (!resume) return;
    setExportOpen(false);
    const previousTitle = document.title;
    const printTitle = `${resume.content.contact.fullName || resume.title} — Resume`;
    const restoreTitle = () => {
      document.title = previousTitle;
    };

    window.addEventListener("afterprint", restoreTitle, { once: true });
    window.setTimeout(() => {
      document.title = printTitle;
      window.print();
    }, 220);
  }

  if (!resume) {
    if (!hydrated) {
      return (
        <div className="studio-missing">
          <LumeLogo id="studio-loading" />
          <span className="studio-missing-loader" />
        </div>
      );
    }

    return (
      <div className="studio-missing">
        <LumeLogo id="studio-missing" />
        <p className="app-eyebrow">A missing page</p>
        <h1>This resume isn&apos;t in your workspace.</h1>
        <p>
          It may have been deleted, or the link may belong to a different
          account. Your other pages are waiting.
        </p>
        <Link href="/dashboard" className="app-btn app-btn--primary">
          <ArrowLeft size={15} aria-hidden="true" />
          Back to the workspace
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        className={`studio-shell${mobilePreview ? " is-mobile-preview" : ""}`}
      >
        <StudioTopbar
          key={resume.id}
          title={resume.title}
          saveState={resume ? saveStateFor(resume.id) : "saved"}
          score={score?.score ?? 0}
          onRename={rename}
          onOpenDesign={() => selectTool("design")}
          onOpenScore={() => selectTool("score")}
          onExport={() => setExportOpen(true)}
        />

        <div className="studio-workspace">
          <ToolRail
            activeTool={tool}
            onSelectTool={selectTool}
            onOpenHelp={() => setHelpOpen(true)}
          />

          <div className="studio-editor-column">
            <WritePanel
              resume={resume}
              active={tool === "write"}
              pageCount={pageCount}
              openSections={openSections}
              onToggleSection={(section) => {
                setOpenSections((current) => {
                  const next = new Set(current);
                  if (next.has(section)) next.delete(section);
                  else next.add(section);
                  return next;
                });
              }}
              onEnsureSection={(section) => {
                setOpenSections((current) => {
                  if (current.has(section)) return current;
                  const next = new Set(current);
                  next.add(section);
                  return next;
                });
              }}
              onUpdate={updateCurrent}
              onOpenAISummary={openAiSummary}
              onImproveBullet={improveBullet}
            />

            <DesignPanel
              resume={resume}
              active={tool === "design"}
              onUpdate={updateCurrent}
              onExportJson={() => {
                import("@/lib/resume/export").then(({ downloadResumeJson }) => {
                  downloadResumeJson(resume);
                  toast("Editable JSON downloaded.", "success");
                });
              }}
            />

            <AiPanel
              resume={resume}
              active={tool === "ai"}
              focus={aiFocus}
              onUpdate={updateCurrent}
              onGoWrite={() => focusSection("summary")}
            />

            <TailorPanel resume={resume} active={tool === "tailor"} />

            <ScorePanel
              resume={resume}
              active={tool === "score"}
              pageCount={pageCount}
              onFix={focusSection}
              onPreview={() => {
                setMobilePreview(true);
                toast("Your live preview is open.", "info");
              }}
            />
          </div>

          <PreviewPanel
            resume={resume}
            pageCount={pageCount}
            zoom={zoom}
            onZoomChange={setZoom}
            onPageCountChange={handlePageCount}
            onEditSection={focusSection}
          />
        </div>

        <div className="studio-mobile-switch" role="group" aria-label="Mobile view">
          <button
            type="button"
            className={!mobilePreview ? "is-active" : ""}
            onClick={() => setMobilePreview(false)}
            aria-pressed={!mobilePreview}
          >
            <Pencil size={14} aria-hidden="true" />
            Edit
          </button>
          <button
            type="button"
            className={mobilePreview ? "is-active" : ""}
            onClick={() => setMobilePreview(true)}
            aria-pressed={mobilePreview}
          >
            <Eye size={14} aria-hidden="true" />
            Preview
          </button>
        </div>
      </div>

      <div className="lume-print-root" aria-hidden="true">
        <ResumeDocument resume={resume} />
      </div>

      <ExportDialog
        open={exportOpen}
        resume={resume}
        pageCount={pageCount}
        onClose={() => setExportOpen(false)}
        onPrint={printResume}
      />

      <AppModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="A few quiet shortcuts."
        description="Your resume is stored in Neon and synced live across your tabs."
        width="md"
        footer={
          <button
            type="button"
            className="app-btn app-btn--primary"
            onClick={() => setHelpOpen(false)}
          >
            Back to the page
          </button>
        }
      >
        <div className="help-list">
          <div className="help-item">
            <span>
              <Sparkles size={16} aria-hidden="true" />
            </span>
            <div>
              <h3>AI is opt-in</h3>
              <p>
                Drafts and tailoring call DeepSeek directly after you accept the
                AI notice.
              </p>
            </div>
          </div>
          <div className="help-item">
            <span>
              <Check size={16} aria-hidden="true" />
            </span>
            <div>
              <h3>Everything saves automatically</h3>
              <p>
                Resumes live in Neon Postgres and update live in other tabs.
                Export JSON from Settings whenever you like.
              </p>
            </div>
          </div>
          <div className="help-item">
            <span>
              <Pencil size={16} aria-hidden="true" />
            </span>
            <div>
              <h3>The page is also a navigation surface</h3>
              <p>
                Click any section in the live preview to jump back to its
                fields.
              </p>
            </div>
          </div>
          <div className="help-item">
            <span>
              <WandSparkles size={16} aria-hidden="true" />
            </span>
            <div>
              <h3>PDF uses your browser</h3>
              <p>
                Export opens the print dialog. Choose “Save as PDF” for an A4
                document with selectable text.
              </p>
            </div>
          </div>
          <div className="help-shortcuts">
            <Keyboard size={15} aria-hidden="true" />
            <span>
              <kbd>⌘</kbd>/<kbd>Ctrl</kbd> + <kbd>S</kbd> to confirm the
              current save state
            </span>
          </div>
        </div>
      </AppModal>
    </>
  );
}
