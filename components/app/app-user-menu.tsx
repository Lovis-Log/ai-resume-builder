"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Settings,
  Sparkles,
} from "lucide-react";
import { signOut } from "@/app/actions/account";
import { useWorkspace } from "./workspace-store";

export function AppUserMenu() {
  const { profile } = useWorkspace();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="app-user" ref={menuRef}>
      <button
        type="button"
        className={`app-user-trigger${open ? " is-open" : ""}`}
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Open account menu"
      >
        <span className="app-avatar">{profile.initials}</span>
        <span className="app-user-name">{profile.firstName}</span>
        <ChevronDown size={14} aria-hidden="true" />
      </button>

      {open ? (
        <div className="app-user-popover" role="menu">
          <div className="app-user-card">
            <span className="app-avatar app-avatar--lg">{profile.initials}</span>
            <div className="app-user-card-copy">
              <strong>{profile.name}</strong>
              <span>{profile.email}</span>
            </div>
            <span className="app-plan-pill">
              <Sparkles size={11} aria-hidden="true" />
              {profile.plan === "pro" ? "Pro" : "Free"}
            </span>
          </div>

          <div className="app-user-popover-group">
            <Link href="/dashboard" role="menuitem" onClick={() => setOpen(false)}>
              <LayoutDashboard size={15} aria-hidden="true" />
              Workspace
            </Link>
            <Link href="/templates" role="menuitem" onClick={() => setOpen(false)}>
              <LayoutTemplate size={15} aria-hidden="true" />
              Templates
            </Link>
            <Link href="/billing" role="menuitem" onClick={() => setOpen(false)}>
              <CreditCard size={15} aria-hidden="true" />
              Plan & billing
              <span className="app-menu-meta">
                {profile.plan === "pro" ? "Pro" : "Free"}
              </span>
            </Link>
            <Link href="/settings" role="menuitem" onClick={() => setOpen(false)}>
              <Settings size={15} aria-hidden="true" />
              Settings
            </Link>
          </div>

          <div className="app-user-popover-group">
            <div className="app-user-usage">
              <span>
                <Check size={12} aria-hidden="true" />
                {profile.aiIncluded - profile.aiUsed} AI actions left
              </span>
              <Link href="/billing" onClick={() => setOpen(false)}>
                View plan <ArrowUpRight size={12} aria-hidden="true" />
              </Link>
            </div>
            <form action={signOut}>
              <button type="submit" role="menuitem">
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
