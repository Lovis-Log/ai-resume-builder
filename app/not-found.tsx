import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">
          This page does not exist.
        </h1>
        <p className="mt-3 text-stone-600">
          The link may be out of date, or the resume may belong to another account.
        </p>
        <Link href="/dashboard" className="mt-6 inline-block">
          <Button>Go to dashboard</Button>
        </Link>
      </div>
    </main>
  );
}
