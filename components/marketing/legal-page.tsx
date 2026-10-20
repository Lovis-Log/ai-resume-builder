import Link from "next/link";
import type { ReactNode } from "react";

export function LegalPage({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <header className="border-b border-[var(--border)] bg-white/80">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            Resume Builder
          </Link>
          <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">
            Back to home
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="text-sm font-medium text-[var(--accent)]">Legal</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight text-stone-900">
          {title}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-stone-600">
          {description}
        </p>
        <p className="mt-2 text-xs text-stone-400">
          Last updated: October 20, 2026
        </p>
        <div className="mt-8 space-y-6 text-sm leading-relaxed text-stone-700">
          {children}
        </div>
        <div className="mt-10 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900">
          This is a plain-language template provided for product development. It
          is not legal advice. Have a qualified lawyer review it for your
          jurisdiction and business structure before launch.
        </div>
      </main>
      <footer className="border-t border-[var(--border)] py-8">
        <div className="mx-auto flex max-w-3xl flex-wrap gap-5 px-6 text-xs text-stone-500">
          <Link href="/privacy" className="hover:text-stone-900">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-stone-900">
            Terms
          </Link>
          <a href="mailto:support@resumebuilder.app" className="hover:text-stone-900">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
