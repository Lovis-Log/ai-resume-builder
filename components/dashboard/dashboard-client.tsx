"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  LayoutTemplate,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Target,
  Trash2,
} from "lucide-react";
import { AppTopbar } from "@/components/app/app-topbar";
import { AppModal } from "@/components/app/app-modal";
import { ScorePill, ScoreRing } from "@/components/app/atoms";
import { useDemoStore } from "@/components/app/demo-store";
import { useToast } from "@/components/ui/toast";
import { computeDemoScore } from "@/lib/demo/score";
import { formatUpdated, splitSkills } from "@/lib/demo/format";
import { CreateResumeDialog } from "@/components/dashboard/create-resume-dialog";
import {
  TEMPLATES,
  type DemoResume,
} from "@/lib/demo/types";
import { cn } from "@/lib/utils";
import { ResumeDocument } from "@/components/studio/resume-document";

function greeting(name: string) {
  return name.split(" ")[0] || "there";
}

function DashboardPreview({ resume }: { resume: DemoResume }) {
  return (
    <div className="dash-paper-frame" aria-hidden="true">
      <span className="dash-paper-glow" />
      <div className="dash-paper-holder">
        <ResumeDocument resume={resume} ariaHidden />
      </div>
    </div>
  );
}

function ResumeCard({
  resume,
  featured,
  menuOpen,
  onMenuToggle,
  onRename,
  onDuplicate,
  onDelete,
  onTailor,
}: {
  resume: DemoResume;
  featured?: boolean;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onRename: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onTailor: () => void;
}) {
  const score = computeDemoScore(resume.content, 1);
  const skillCount = splitSkills(resume.content.skills).length;
  const template = TEMPLATES.find((item) => item.id === resume.template);

  return (
    <article
      className={cn(
        "resume-card",
        featured && "resume-card--featured",
        menuOpen && "has-menu-open",
      )}
    >
      <Link
        href={`/resume/${resume.id}`}
        className="resume-card-hit"
        aria-label={`Open ${resume.title}`}
      />
      <DashboardPreview resume={resume} />

      <div className="resume-card-content">
        <div className="resume-card-topline">
          <span className="resume-card-label">
            {featured ? "Currently shaping" : template?.tone ?? "Draft"}
          </span>
          {resume.lastTailoredFor ? (
            <span className="resume-card-tailored">
              <Target size={12} aria-hidden="true" />
              {resume.lastTailoredFor.company}
            </span>
          ) : null}
        </div>
        <h3>{resume.title}</h3>
        <p className="resume-card-role">
          {resume.targetRole}
          <span aria-hidden="true">·</span>
          {skillCount} skills
        </p>

        <div className="resume-card-foot">
          <div className="resume-card-meta">
            <ScorePill score={score.score} />
            <span>Edited {formatUpdated(resume.updatedAt)}</span>
          </div>
          <span className="resume-card-open">
            Open
            <ArrowRight size={14} aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="resume-card-actions">
        <button
          type="button"
          className={cn("resume-menu-trigger", menuOpen && "is-open")}
          onClick={onMenuToggle}
          aria-label={`Actions for ${resume.title}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal size={18} aria-hidden="true" />
        </button>
        {menuOpen ? (
          <div className="resume-card-menu" role="menu">
            <button type="button" role="menuitem" onClick={onRename}>
              <Pencil size={14} aria-hidden="true" />
              Rename
            </button>
            <button type="button" role="menuitem" onClick={onDuplicate}>
              <Copy size={14} aria-hidden="true" />
              Duplicate
            </button>
            <button type="button" role="menuitem" onClick={onTailor}>
              <Target size={14} aria-hidden="true" />
              Tailor to a role
            </button>
            <button
              type="button"
              role="menuitem"
              className="is-danger"
              onClick={onDelete}
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

export function DashboardClient() {
  const router = useRouter();
  const {
    profile,
    resumes,
    deleteResume,
    duplicateResume,
    updateResume,
  } = useDemoStore();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<DemoResume | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DemoResume | null>(null);
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  useEffect(() => {
    if (!menuId) return;
    const close = (event: PointerEvent) => {
      if (!(event.target as Element).closest(".resume-card-actions")) {
        setMenuId(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuId(null);
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuId]);

  const sorted = useMemo(
    () =>
      [...resumes].sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      ),
    [resumes],
  );

  const scores = useMemo(
    () =>
      new Map(
        sorted.map((resume) => [
          resume.id,
          computeDemoScore(resume.content, 1),
        ]),
      ),
    [sorted],
  );

  const filtered = useMemo(() => {
    if (!deferredQuery) return sorted;
    return sorted.filter((resume) =>
      [resume.title, resume.targetRole, resume.content.contact.fullName]
        .join(" ")
        .toLowerCase()
        .includes(deferredQuery),
    );
  }, [sorted, deferredQuery]);

  const averageScore = sorted.length
    ? Math.round(
        sorted.reduce(
          (total, resume) => total + (scores.get(resume.id)?.score ?? 0),
          0,
        ) / sorted.length,
      )
    : 0;
  const actionsLeft = Math.max(0, profile.aiIncluded - profile.aiUsed);
  const leadResume = sorted[0] ?? null;
  const bestResume = sorted.reduce<DemoResume | null>((best, candidate) => {
    if (!best) return candidate;
    return (scores.get(candidate.id)?.score ?? 0) >
      (scores.get(best.id)?.score ?? 0)
      ? candidate
      : best;
  }, null);
  const leadScore = bestResume ? scores.get(bestResume.id) : null;
  const linearResume = sorted.find(
    (resume) => resume.lastTailoredFor?.company === "Linear",
  );
  const featured = filtered[0] ?? null;
  const rest = filtered.slice(1);

  const openRename = useCallback((resume: DemoResume) => {
    setMenuId(null);
    setRenameTarget(resume);
    setRenameValue(resume.title);
  }, []);

  function submitRename(event: FormEvent) {
    event.preventDefault();
    if (!renameTarget) return;
    const title = renameValue.trim();
    if (!title) {
      toast("A resume name can’t be empty.", "error");
      return;
    }
    updateResume(renameTarget.id, (resume) => ({ ...resume, title }));
    setRenameTarget(null);
    toast("Resume renamed.", "success");
  }

  function confirmDelete() {
    if (!deleteTarget) return;
    deleteResume(deleteTarget.id);
    setDeleteTarget(null);
    toast("Resume removed from this demo.", "success");
  }

  function handleDuplicate(resume: DemoResume) {
    setMenuId(null);
    const duplicate = duplicateResume(resume.id);
    if (duplicate) {
      toast("A copy is ready on your desk.", "success");
    }
  }

  return (
    <div className="lume-page lume-dashboard">
      <AppTopbar />

      <main className="dash-main">
        <section className="dash-intro">
          <div className="dash-intro-copy">
            <p className="app-eyebrow">
              <span aria-hidden="true" />
              Your personal workspace
            </p>
            <h1>
              Good things take shape here<span>.</span>
            </h1>
            <p className="dash-subtitle">
              Welcome back, {greeting(profile.name)}. Continue a draft, shape it
              around a role, or begin with a clean page.
            </p>
          </div>
          <button
            type="button"
            className="app-btn app-btn--primary app-btn--lg dash-new-button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={17} aria-hidden="true" />
            New resume
          </button>
        </section>

        <section className="workspace-metrics" aria-label="Workspace overview">
          <div className="workspace-metric">
            <span className="workspace-metric-label">Resumes in motion</span>
            <strong>{String(resumes.length).padStart(2, "0")}</strong>
          </div>
          <div className="workspace-metric workspace-metric--score">
            <span className="workspace-metric-label">Average score</span>
            <strong>
              {averageScore}
              <small>/100</small>
            </strong>
          </div>
          <div className="workspace-metric">
            <span className="workspace-metric-label">AI actions left</span>
            <strong>
              {actionsLeft}
              <small>of {profile.aiIncluded}</small>
            </strong>
          </div>
          <div className="workspace-status">
            <span className="workspace-status-dot" aria-hidden="true" />
            <span>
              Saved on this device
              <small>Local demo · no account needed</small>
            </span>
          </div>
        </section>

        <div className="dash-grid">
          <section className="resume-library" aria-labelledby="resume-library-title">
            <div className="resume-library-head">
              <div>
                <h2 id="resume-library-title">Your resumes</h2>
                <p>
                  {resumes.length > 0
                    ? "Your latest work, kept in one quiet place."
                    : "A blank page is a good place to start."}
                </p>
              </div>
              {resumes.length > 0 ? (
                <div className="resume-search">
                  <Search size={15} aria-hidden="true" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Find a resume"
                    aria-label="Search resumes"
                  />
                </div>
              ) : null}
            </div>

            {resumes.length === 0 ? (
              <div className="dash-empty">
                <span className="dash-empty-mark">
                  <FileText size={24} aria-hidden="true" />
                </span>
                <p className="app-eyebrow">A fresh page</p>
                <h2>Begin with the work you are proud of.</h2>
                <p>
                  Add a role, a project, and a few lines about what changed
                  because you were there. Lume takes care of the page.
                </p>
                <button
                  type="button"
                  className="app-btn app-btn--primary"
                  onClick={() => setCreateOpen(true)}
                >
                  <Plus size={16} aria-hidden="true" />
                  Create your first resume
                </button>
              </div>
            ) : filtered.length === 0 ? (
              <div className="dash-no-results">
                <Search size={22} aria-hidden="true" />
                <h2>No resume matches “{query}”.</h2>
                <p>Try the role, company, or name instead.</p>
                <button
                  type="button"
                  className="app-text-button"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </button>
              </div>
            ) : (
              <div className="resume-grid">
                {featured ? (
                  <ResumeCard
                    key={featured.id}
                    resume={featured}
                    featured
                    menuOpen={menuId === featured.id}
                    onMenuToggle={() =>
                      setMenuId((current) =>
                        current === featured.id ? null : featured.id,
                      )
                    }
                    onRename={() => openRename(featured)}
                    onDuplicate={() => handleDuplicate(featured)}
                    onDelete={() => {
                      setMenuId(null);
                      setDeleteTarget(featured);
                    }}
                    onTailor={() => {
                      setMenuId(null);
                      router.push(`/resume/${featured.id}#tailor`);
                    }}
                  />
                ) : null}

                {rest.map((resume) => (
                  <ResumeCard
                    key={resume.id}
                    resume={resume}
                    menuOpen={menuId === resume.id}
                    onMenuToggle={() =>
                      setMenuId((current) =>
                        current === resume.id ? null : resume.id,
                      )
                    }
                    onRename={() => openRename(resume)}
                    onDuplicate={() => handleDuplicate(resume)}
                    onDelete={() => {
                      setMenuId(null);
                      setDeleteTarget(resume);
                    }}
                    onTailor={() => {
                      setMenuId(null);
                      router.push(`/resume/${resume.id}#tailor`);
                    }}
                  />
                ))}

                <button
                  type="button"
                  className="resume-card resume-card--new"
                  onClick={() => setCreateOpen(true)}
                >
                  <span className="resume-new-art" aria-hidden="true">
                    <span className="resume-new-sheet">
                      <span />
                      <span />
                      <span />
                    </span>
                    <span className="resume-new-plus">
                      <Plus size={22} />
                    </span>
                  </span>
                  <span className="resume-new-copy">
                    <strong>Start another page</strong>
                    <span>Choose a template and make it yours.</span>
                  </span>
                  <span className="resume-new-arrow" aria-hidden="true">
                    <ArrowUpRight size={17} />
                  </span>
                </button>
              </div>
            )}
          </section>

          <aside className="dash-aside" aria-label="Suggestions and plan">
            <article className="next-move-card">
              <span className="next-move-orbit next-move-orbit--one" aria-hidden="true" />
              <span className="next-move-orbit next-move-orbit--two" aria-hidden="true" />
              <span className="next-move-icon">
                <Sparkles size={17} aria-hidden="true" />
              </span>
              <p className="app-eyebrow app-eyebrow--light">Lume suggests</p>
              <h2>Make one page fit one role.</h2>
              <p>
                {leadResume
                  ? "A tailored summary and three sharper bullets can make a strong resume feel written for the job."
                  : "When you are ready, paste a job description and see how close your page already is."}
              </p>
              {leadResume ? (
                <Link
                  href={`/resume/${leadResume.id}#tailor`}
                  className="next-move-action"
                >
                  Tailor this resume
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              ) : (
                <button
                  type="button"
                  className="next-move-action"
                  onClick={() => setCreateOpen(true)}
                >
                  Create a resume
                  <ArrowUpRight size={15} aria-hidden="true" />
                </button>
              )}
              <div className="next-move-foot">
                <Target size={13} aria-hidden="true" />
                1 analysis + 1 rewrite · 2 actions
              </div>
            </article>

            {bestResume && leadScore ? (
              <article className="readiness-card">
                <div className="readiness-head">
                  <div>
                    <p className="app-eyebrow">Closest to ready</p>
                    <h2>{bestResume.targetRole}</h2>
                    <p>{bestResume.title}</p>
                  </div>
                  <ScoreRing score={leadScore.score} size={62} strokeWidth={5} />
                </div>
                <div className="readiness-bar" aria-hidden="true">
                  <span style={{ width: `${leadScore.score}%` }} />
                </div>
                <p className="readiness-status">
                  <Check size={13} aria-hidden="true" />
                  {leadScore.label} · {leadScore.passed} of {leadScore.total}{" "}
                  checks pass
                </p>
                <Link
                  href={`/resume/${bestResume.id}#score`}
                  className="readiness-link"
                >
                  Review the score
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </article>
            ) : null}

            {linearResume ? (
              <article className="tailored-card">
                <span className="tailored-card-icon">
                  <Target size={16} aria-hidden="true" />
                </span>
                <div>
                  <span className="tailored-card-label">Recently tailored</span>
                  <h2>Product Designer at Linear</h2>
                  <p>
                    From {formatUpdated(linearResume.updatedAt)} ·{" "}
                    {linearResume.lastTailoredFor?.role}
                  </p>
                </div>
                <Link
                  href={`/resume/${linearResume.id}`}
                  aria-label="Open the Linear tailored resume"
                >
                  <ArrowUpRight size={16} aria-hidden="true" />
                </Link>
              </article>
            ) : null}

            <article className="plan-mini-card">
              <div className="plan-mini-top">
                <span>
                  <Sparkles size={14} aria-hidden="true" />
                  {profile.plan === "pro" ? "Pro plan" : "Free plan"}
                </span>
                <span>{actionsLeft} left</span>
              </div>
              <div className="plan-mini-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${Math.min(
                      100,
                      (profile.aiUsed / profile.aiIncluded) * 100,
                    )}%`,
                  }}
                />
              </div>
              <p>
                {profile.aiUsed} of {profile.aiIncluded} AI actions used this
                month.
              </p>
              <Link href="/billing">
                Manage plan <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </article>

            <div className="demo-note">
              <LayoutTemplate size={15} aria-hidden="true" />
              <p>
                This is a local product demo. AI and billing are simulated;
                resumes stay in your browser.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {createOpen ? (
        <CreateResumeDialog open onClose={() => setCreateOpen(false)} />
      ) : null}

      <AppModal
        open={Boolean(renameTarget)}
        onClose={() => setRenameTarget(null)}
        title="Rename this page"
        description="Use the role or company you are targeting. You can change it again later."
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setRenameTarget(null)}
            >
              Cancel
            </button>
            <button
              type="submit"
              form="rename-resume-form"
              className="app-btn app-btn--primary"
            >
              Save name
            </button>
          </>
        }
      >
        <form id="rename-resume-form" onSubmit={submitRename}>
          <label className="app-field-label" htmlFor="rename-resume">
            Resume name
          </label>
          <input
            id="rename-resume"
            className="app-input"
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            maxLength={100}
            autoFocus
          />
        </form>
      </AppModal>

      <AppModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Let this page go?"
        description="It will be removed from your local workspace. This cannot be undone."
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setDeleteTarget(null)}
            >
              Keep it
            </button>
            <button
              type="button"
              className="app-btn app-btn--danger"
              onClick={confirmDelete}
            >
              <Trash2 size={15} aria-hidden="true" />
              Delete resume
            </button>
          </>
        }
      >
        <div className="delete-resume-summary">
          <FileText size={17} aria-hidden="true" />
          <div>
            <strong>{deleteTarget?.title}</strong>
            <span>{deleteTarget?.targetRole}</span>
          </div>
        </div>
      </AppModal>
    </div>
  );
}
