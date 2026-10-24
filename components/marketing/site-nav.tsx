"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LumeLogo } from "@/components/brand/logo";

const NAV_LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#template", label: "Templates" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 72);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;

    const onMove = (event: PointerEvent) => {
      if (raf) return;
      const { clientX, clientY } = event;
      raf = window.requestAnimationFrame(() => {
        const rect = nav.getBoundingClientRect();
        const x = clamp(((clientX - rect.left) / rect.width) * 100, 0, 100);
        const y = clamp(((clientY - rect.top) / rect.height) * 100, 0, 100);
        nav.style.setProperty("--glass-x", `${x}%`);
        nav.style.setProperty("--glass-y", `${y}%`);
        raf = 0;
      });
    };

    const onLeave = () => {
      if (raf) window.cancelAnimationFrame(raf);
      raf = 0;
      nav.style.setProperty("--glass-x", "50%");
      nav.style.setProperty("--glass-y", "0%");
    };

    nav.addEventListener("pointermove", onMove);
    nav.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) window.cancelAnimationFrame(raf);
      nav.removeEventListener("pointermove", onMove);
      nav.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <header className={`site-nav${scrolled ? " is-scrolled" : ""}`}>
      <div className="site-nav-inner" ref={navRef}>
        <span className="glass-specular" aria-hidden="true" />
        <span className="glass-microtexture" aria-hidden="true" />

        <a href="#top" className="site-brand" aria-label="Lume home">
          <LumeLogo id="nav" />
        </a>

        <nav className="site-nav-links" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav-right">
          <Link href="/login" className="nav-signin">
            Sign in
          </Link>
          <Link href="/login" className="nav-cta">
            Start building
            <ArrowUpRight className="nav-cta-icon" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
