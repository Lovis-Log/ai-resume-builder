"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LumeLogo } from "@/components/brand/logo";
import { AppUserMenu } from "./app-user-menu";
import { useDemoStore } from "./demo-store";

const links = [
  { href: "/dashboard", label: "Workspace" },
  { href: "/templates", label: "Templates" },
  { href: "/billing", label: "Billing" },
];

export function AppTopbar() {
  const pathname = usePathname();
  const { profile } = useDemoStore();
  const available = Math.max(0, profile.aiIncluded - profile.aiUsed);

  return (
    <header className="app-topbar">
      <div className="app-topbar-inner">
        <Link href="/dashboard" className="app-brand" aria-label="Lume workspace">
          <LumeLogo id="app-topbar" />
        </Link>

        <span className="app-topbar-divider" aria-hidden="true" />

        <nav className="app-nav" aria-label="Workspace">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href === "/dashboard" && pathname.startsWith("/resume/"));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={active ? "is-active" : undefined}
                aria-current={active ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="app-topbar-actions">
          <Link href="/billing" className="app-usage-pill">
            <span className="app-usage-dot" aria-hidden="true" />
            {available} AI actions left
          </Link>
          <span className="app-topbar-rule" aria-hidden="true" />
          <AppUserMenu />
        </div>
      </div>
    </header>
  );
}
