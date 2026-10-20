"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-[var(--accent)]">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-stone-900">
          We could not load this page.
        </h1>
        <p className="mt-3 text-stone-600">
          Your work is saved. Try again, or return to the dashboard.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button onClick={() => retry()}>Try again</Button>
          <Button variant="secondary" onClick={() => router.push("/dashboard")}>
            Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
