"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Database,
  Download,
  FileJson,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { AppModal } from "@/components/app/app-modal";
import { AppTopbar } from "@/components/app/app-topbar";
import { useWorkspace } from "@/components/app/workspace-store";
import { useToast } from "@/components/ui/toast";
import { deleteAccount, signOut } from "@/app/actions/account";
import { downloadWorkspaceJson } from "@/lib/resume/export";
import { formatLongDate } from "@/lib/resume/format";

export function SettingsClient() {
  const { profile, resumes, updateProfile, liveStatus } = useWorkspace();
  const { toast } = useToast();
  const [name, setName] = useState(profile.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const dirty = name.trim() !== profile.name;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!name.trim()) {
      toast("Add your name first.", "error");
      return;
    }
    await updateProfile({ name: name.trim() });
    toast("Profile saved to Neon.", "success");
  }

  function exportAll() {
    downloadWorkspaceJson({ profile, resumes });
    toast("Your workspace was exported.", "success");
  }

  async function confirmDelete() {
    setDeleting(true);
    try {
      await deleteAccount();
    } catch {
      setDeleting(false);
      toast("We could not delete the account. Contact support.", "error");
    }
  }

  return (
    <div className="lume-page lume-settings-page">
      <AppTopbar />

      <main className="settings-main">
        <header className="settings-intro">
          <p className="app-eyebrow">
            <span aria-hidden="true" />
            Your space
          </p>
          <h1>
            A space that stays yours<span>.</span>
          </h1>
          <p>
            Your account, your data, and a plan that stays out of the way.
            Everything here lives in your Neon workspace.
          </p>
        </header>

        <div className="settings-layout">
          <aside className="settings-aside">
            <div className="settings-profile-card">
              <span className="settings-avatar">{profile.initials}</span>
              <h2>{profile.name}</h2>
              <p>{profile.email}</p>
              <span className="settings-plan-chip">
                <Sparkles size={12} aria-hidden="true" />
                {profile.plan === "pro" ? "Lume Pro" : "Lume Free"}
              </span>
              <div className="settings-profile-meta">
                <span>Member since</span>
                <strong>{formatLongDate(profile.memberSince)}</strong>
              </div>
              <Link href="/billing">
                Manage plan
                <ArrowRight size={13} aria-hidden="true" />
              </Link>
            </div>

            <nav className="settings-nav" aria-label="Settings sections">
              <a href="#profile">
                <UserRound size={14} aria-hidden="true" />
                Profile
              </a>
              <a href="#data">
                <Database size={14} aria-hidden="true" />
                Workspace data
              </a>
              <a href="#privacy">
                <ShieldCheck size={14} aria-hidden="true" />
                Privacy
              </a>
            </nav>
          </aside>

          <div className="settings-content">
            <section className="settings-section" id="profile">
              <div className="settings-section-head">
                <div>
                  <p className="app-eyebrow">Profile</p>
                  <h2>The name on the work.</h2>
                </div>
                <span className="settings-section-icon">
                  <UserRound size={17} aria-hidden="true" />
                </span>
              </div>
              <form className="settings-form" onSubmit={saveProfile}>
                <label className="app-field">
                  <span className="app-field-label">Full name</span>
                  <input
                    className="app-input"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                  />
                </label>
                <label className="app-field">
                  <span className="app-field-label">Email address</span>
                  <input
                    className="app-input"
                    type="email"
                    value={profile.email}
                    readOnly
                    aria-readonly="true"
                  />
                  <small className="app-field-hint">
                    Managed by your Google sign-in, so it cannot be edited here.
                  </small>
                </label>
                <div className="settings-form-foot">
                  <p>
                    This name appears in your workspace. Resume contact fields
                    stay as you wrote them.
                  </p>
                  <button
                    type="submit"
                    className="app-btn app-btn--primary"
                    disabled={!dirty}
                  >
                    <Check size={14} aria-hidden="true" />
                    Save changes
                  </button>
                </div>
              </form>
            </section>

            <section className="settings-section" id="data">
              <div className="settings-section-head">
                <div>
                  <p className="app-eyebrow">Workspace data</p>
                  <h2>Saved in Postgres, live in every tab.</h2>
                </div>
                <span className="settings-section-icon is-lavender">
                  <Database size={17} aria-hidden="true" />
                </span>
              </div>

              <div className="settings-data-facts">
                <div>
                  <span>{resumes.length}</span>
                  <p>Resumes in Neon</p>
                </div>
                <div>
                  <span>{profile.aiIncluded - profile.aiUsed}</span>
                  <p>AI actions remaining</p>
                </div>
                <div>
                  <span>{liveStatus === "live" ? "Live" : liveStatus === "polling" ? "Polling" : "Syncing"}</span>
                  <p>Realtime connection</p>
                </div>
              </div>

              <div className="settings-data-actions">
                <button
                  type="button"
                  className="settings-action"
                  onClick={exportAll}
                >
                  <span>
                    <FileJson size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Export workspace</strong>
                    <p>Download every resume and setting as editable JSON.</p>
                  </div>
                  <Download size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="settings-action"
                  onClick={() => setDeleteOpen(true)}
                >
                  <span className="is-rose">
                    <Trash2 size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Delete account</strong>
                    <p>
                      Remove your auth user, resumes, usage, and subscription.
                    </p>
                  </div>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>

              <form action={signOut} className="settings-signout-form">
                <button type="submit" className="app-btn app-btn--quiet">
                  <LogOut size={14} aria-hidden="true" />
                  Sign out
                </button>
              </form>
            </section>

            <section className="settings-section settings-privacy" id="privacy">
              <div className="settings-section-head">
                <div>
                  <p className="app-eyebrow">Privacy</p>
                  <h2>Quiet by default.</h2>
                </div>
                <span className="settings-section-icon is-mint">
                  <ShieldCheck size={17} aria-hidden="true" />
                </span>
              </div>
              <div className="settings-privacy-copy">
                <h3>AI is opt-in, and the database is yours.</h3>
                <p>
                  Resume content is stored in your Neon Postgres branch and
                  served through Neon Auth. When you use an AI action, the
                  relevant text is sent to DeepSeek through a Neon Function.
                  Nothing is sent until you accept the AI notice.
                </p>
                <Link href="/privacy" className="app-text-button">
                  Read the public privacy page
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </section>

            <p className="settings-footnote">
              Lume · Neon Postgres, Auth, Functions, Realtime · A4 PDF
            </p>
          </div>
        </div>
      </main>

      <AppModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        description="This removes your sign-in, resumes, usage history, and subscription. It cannot be undone."
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Keep my account
            </button>
            <button
              type="button"
              className="app-btn app-btn--danger"
              onClick={confirmDelete}
              disabled={deleting}
            >
              <Trash2 size={14} aria-hidden="true" />
              {deleting ? "Deleting…" : "Delete account"}
            </button>
          </>
        }
      >
        <div className="reset-demo-summary">
          <span>
            <Trash2 size={18} aria-hidden="true" />
          </span>
          <p>
            Export a workspace copy first if you want to keep the current pages.
          </p>
        </div>
      </AppModal>
    </div>
  );
}
