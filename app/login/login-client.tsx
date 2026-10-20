"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M21.35 12.22c0-.73-.07-1.43-.2-2.1H12v3.98h5.24a4.48 4.48 0 0 1-1.94 2.94v2.44h3.14c1.84-1.69 2.91-4.18 2.91-7.26Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.44c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.52A9.74 9.74 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.84A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.84V7.64H3.3A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.52Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.13c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.36 9.36 0 0 0 12 2.25a9.74 9.74 0 0 0-8.7 5.39l3.24 2.52C7.31 7.85 9.46 6.13 12 6.13Z"
      />
    </svg>
  );
}

export function LoginClient() {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function signIn() {
    startTransition(async () => {
      setError(null);
      const { error: signInError } = await authClient.signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/dashboard`,
      });
      if (signInError) {
        setError(signInError.message ?? "Could not start Google sign-in.");
      }
    });
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-between bg-[var(--accent)] px-8 py-10 text-white lg:px-16 lg:py-14">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          Resume Builder
        </Link>
        <div className="max-w-xl py-16">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-teal-100">
            Built for new grads
          </p>
          <h1 className="mt-4 text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
            A resume that gets past the bots.
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-teal-50">
            Start with your experience. Add AI writing when you need it, tailor
            to a job description, check the score, and download a clean PDF.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-teal-50">
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" />
              Single-column, ATS-safe template
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" />
              Free resume score, no AI required
            </li>
            <li className="flex items-center gap-3">
              <ShieldCheck className="h-4 w-4" />
              No credit card to start
            </li>
          </ul>
        </div>
        <p className="text-xs text-teal-100/80">
          Early access · English · A4 PDF
        </p>
      </section>

      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-semibold text-stone-900">Sign in</h2>
          <p className="mt-2 text-sm text-stone-500">
            Use your Google account to continue. One account, one resume library.
          </p>

          <Button
            className="mt-8 w-full"
            size="lg"
            onClick={signIn}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <GoogleMark />
            )}
            Continue with Google
            {!pending ? <ArrowRight className="ml-auto h-4 w-4" /> : null}
          </Button>

          {error ? (
            <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          ) : null}

          <p className="mt-6 text-xs leading-relaxed text-stone-500">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              Privacy Policy
            </Link>
            . AI features send resume text to DeepSeek only after you opt in.
          </p>
        </div>
      </section>
    </main>
  );
}
