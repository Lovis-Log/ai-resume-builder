"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Database,
  Download,
  FileJson,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { AppModal } from "@/components/app/app-modal";
import { AppTopbar } from "@/components/app/app-topbar";
import { useDemoStore } from "@/components/app/demo-store";
import { useToast } from "@/components/ui/toast";
import { downloadWorkspaceJson } from "@/lib/demo/download";
import { formatLongDate, initialsFromName } from "@/lib/demo/format";

export function SettingsClient() {
  const { profile, resumes, updateProfile, resetDemo } = useDemoStore();
  const { toast } = useToast();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [resetOpen, setResetOpen] = useState(false);

  const dirty = name !== profile.name || email !== profile.email;

  function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      toast("Add a name and a valid email first.", "error");
      return;
    }
    updateProfile({
      name: name.trim(),
      firstName: name.trim().split(/\s+/)[0] ?? name.trim(),
      email: email.trim(),
      initials: initialsFromName(name.trim()),
    });
    toast("Profile details saved locally.", "success");
  }

  function exportAll() {
    downloadWorkspaceJson({
      version: 1,
      profile,
      resumes,
    });
    toast("Your local workspace was exported.", "success");
  }

  function resetWorkspace() {
    resetDemo();
    setResetOpen(false);
    setName("Alex Morgan");
    setEmail("alex.morgan@email.com");
    toast("The demo workspace is back to its original state.", "success");
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
            Small details, local data, and a plan that stays out of the way.
            This demo keeps everything in your browser.
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
                Local data
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
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                  />
                </label>
                <div className="settings-form-foot">
                  <p>
                    These details identify your local workspace. Resume contact
                    fields stay as you wrote them.
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
                  <p className="app-eyebrow">Local data</p>
                  <h2>Nothing leaves this browser.</h2>
                </div>
                <span className="settings-section-icon is-lavender">
                  <Database size={17} aria-hidden="true" />
                </span>
              </div>

              <div className="settings-data-facts">
                <div>
                  <span>{resumes.length}</span>
                  <p>Resumes saved locally</p>
                </div>
                <div>
                  <span>{profile.aiIncluded - profile.aiUsed}</span>
                  <p>AI actions remaining</p>
                </div>
                <div>
                  <span>0</span>
                  <p>Bytes sent to a server</p>
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
                  onClick={() => setResetOpen(true)}
                >
                  <span className="is-rose">
                    <RotateCcw size={16} aria-hidden="true" />
                  </span>
                  <div>
                    <strong>Reset the demo</strong>
                    <p>Restore the three sample resumes and clear local edits.</p>
                  </div>
                  <ArrowRight size={15} aria-hidden="true" />
                </button>
              </div>
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
                <h3>AI and tailoring are simulated here.</h3>
                <p>
                  No resume text, job description, or personal detail is sent to
                  an AI model or a backend. Suggestions are generated from local
                  fixtures, so failure and privacy flows can be explored without
                  risk.
                </p>
                <Link href="/privacy" className="app-text-button">
                  Read the public privacy page
                  <ArrowRight size={13} aria-hidden="true" />
                </Link>
              </div>
            </section>

            <p className="settings-footnote">
              Lume product demo · Local-first · A4 PDF
            </p>
          </div>
        </div>
      </main>

      <AppModal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Reset this demo?"
        description="Any local edits and imported demo data will be replaced with the original three sample resumes."
        width="sm"
        footer={
          <>
            <button
              type="button"
              className="app-btn app-btn--quiet"
              onClick={() => setResetOpen(false)}
            >
              Keep my work
            </button>
            <button
              type="button"
              className="app-btn app-btn--danger"
              onClick={resetWorkspace}
            >
              <RotateCcw size={14} aria-hidden="true" />
              Reset workspace
            </button>
          </>
        }
      >
        <div className="reset-demo-summary">
          <span>
            <RotateCcw size={18} aria-hidden="true" />
          </span>
          <p>
            This is local-only and immediate. Export a workspace copy first if
            you want to keep the current pages.
          </p>
        </div>
      </AppModal>
    </div>
  );
}
