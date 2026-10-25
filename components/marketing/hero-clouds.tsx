"use client";

import { useEffect, useRef } from "react";
import { LumeSky } from "@/components/marketing/lume-sky";

/**
 * Atmosphere layers for the marketing hero. The clouds drift on long CSS loops;
 * a small pointer listener adds parallax so the sky responds to the visitor
 * without turning the page into a motion demo.
 */
export function HeroClouds() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const stage = ref.current;
    const hero = stage?.closest<HTMLElement>(".hero");
    if (!stage || !hero) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;

    const setSky = (x: number, y: number) => {
      stage.style.setProperty("--sky-x", `${x.toFixed(2)}px`);
      stage.style.setProperty("--sky-y", `${y.toFixed(2)}px`);
    };

    const onPointerMove = (event: PointerEvent) => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const x = (event.clientX / window.innerWidth - 0.5) * -30;
        const y = (event.clientY / window.innerHeight - 0.5) * -16;
        setSky(x, y);
      });
    };

    const onPointerLeave = () => setSky(0, 0);

    hero.addEventListener("pointermove", onPointerMove, { passive: true });
    hero.addEventListener("pointerleave", onPointerLeave);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      hero.removeEventListener("pointermove", onPointerMove);
      hero.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return <LumeSky variant="hero" stageRef={ref} />;
}
