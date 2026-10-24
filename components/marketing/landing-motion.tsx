"use client";

import { useEffect } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

/**
 * One small motion driver for the landing page. It adds the motion class only
 * after hydration, so the page remains fully readable without JavaScript.
 */
export function LandingMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = document.documentElement;
    root.classList.add("landing-motion");

    const revealables = Array.from(
      document.querySelectorAll<HTMLElement>("[data-reveal]"),
    );
    const revealObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -6% 0px" },
    );
    revealables.forEach((element) => revealObserver.observe(element));

    const floatCards = Array.from(
      document.querySelectorAll<HTMLElement>("[data-float]"),
    );
    const mobileQuery = window.matchMedia("(max-width: 760px)");

    let scheduled = false;

    const update = () => {
      scheduled = false;
      const viewportHeight = window.innerHeight;
      const mobile = mobileQuery.matches;

      for (const card of floatCards) {
        if (mobile) {
          card.style.setProperty("--float-x", "0px");
          card.style.setProperty("--float-y", "0px");
          card.style.setProperty("--float-rot", "0deg");
          card.style.setProperty("--float-opacity", "1");
          continue;
        }

        const rect = card.getBoundingClientRect();
        const progress = clamp(
          (viewportHeight * 0.98 - rect.top) / (viewportHeight * 0.72),
          0,
          1,
        );
        const eased = 1 - Math.pow(1 - progress, 2);
        card.style.setProperty("--float-x", `${(1 - eased) * 64}px`);
        card.style.setProperty("--float-y", `${(1 - eased) * 46}px`);
        card.style.setProperty("--float-rot", `${(1 - eased) * 2.8}deg`);
        card.style.setProperty(
          "--float-opacity",
          `${Math.min(1, progress * 1.7)}`,
        );
      }
    };

    const requestUpdate = () => {
      if (scheduled) return;
      scheduled = true;
      window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();

    return () => {
      revealObserver.disconnect();
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      root.classList.remove("landing-motion");
    };
  }, []);

  return null;
}
