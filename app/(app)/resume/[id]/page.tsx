import { Suspense } from "react";
import type { Metadata } from "next";
import { LumeLogo } from "@/components/brand/logo";
import { StudioClient } from "@/components/studio/studio-client";

export const metadata: Metadata = {
  title: "Resume studio",
  description: "Shape and export your Lume resume.",
};

// AI actions call DeepSeek directly from this route. Leave room for the
// provider deadline plus the usage bookkeeping that follows it.
export const maxDuration = 60;

export default function ResumePage() {
  return (
    <Suspense fallback={<StudioShellFallback />}>
      <StudioClient />
    </Suspense>
  );
}

function StudioShellFallback() {
  return (
    <div className="studio-missing">
      <LumeLogo id="studio-shell-loading" />
      <span className="studio-missing-loader" />
    </div>
  );
}
