import type { ReactNode } from "react";
import { Monitor } from "lucide-react";

export function DesktopGate({ children }: { children: ReactNode }) {
  return (
    <>
      <div className="hidden lg:block">{children}</div>
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-16 lg:hidden">
        <div className="max-w-md text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)]">
            <Monitor className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold text-stone-900">
            The editor works best on a desktop.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            Open this page on a laptop or desktop computer to edit your resume,
            review the live preview, and download the PDF. Your data is waiting
            for you there.
          </p>
        </div>
      </div>
    </>
  );
}
