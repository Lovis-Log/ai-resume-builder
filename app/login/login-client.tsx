"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { authClient } from "@/lib/auth/client";
import { LumeLogo } from "@/components/brand/logo";
import { LumeSky } from "@/components/marketing/lume-sky";

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
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
    <main className="login-page">
      <section className="login-story" aria-label="About Lume">
        <LumeSky variant="login" />
        <div className="login-story-inner">
          <Link className="login-brand" href="/" aria-label="Lume home">
            <LumeLogo tone="white" id="login" />
          </Link>

          <div className="login-story-copy">
            <p className="login-eyebrow">Built for new grads</p>
            <h1>
              Built to be read.
              <span>Written to be remembered.</span>
            </h1>
            <p className="login-lede">
              Start with your experience. Add AI writing when you need it,
              tailor to a job description, check the score, and download a
              clean PDF.
            </p>
            <ul className="login-perks">
              <li>
                <ShieldCheck aria-hidden="true" />
                Single-column, ATS-safe template
              </li>
              <li>
                <ShieldCheck aria-hidden="true" />
                Free resume score, no AI required
              </li>
              <li>
                <ShieldCheck aria-hidden="true" />
                No credit card to start
              </li>
            </ul>
          </div>

          <p className="login-story-foot">Early access · English · A4 PDF</p>
        </div>
      </section>

      <section className="login-panel" aria-label="Sign in">
        <div className="login-card">
          <h2>Sign in</h2>
          <p className="login-card-lede">
            Use your Google account to continue. One account, one resume
            library.
          </p>

          <button
            type="button"
            className="login-google"
            onClick={signIn}
            disabled={pending}
            aria-busy={pending}
          >
            {pending ? (
              <Loader2 className="login-spinner" aria-hidden="true" />
            ) : (
              <span className="login-google-icon">
                <GoogleMark />
              </span>
            )}
            <span className="login-google-label">
              {pending ? "Connecting to Google…" : "Continue with Google"}
            </span>
            {pending ? null : (
              <ArrowRight className="login-google-arrow" aria-hidden="true" />
            )}
          </button>

          {error ? (
            <p className="login-error" role="alert">
              {error}
            </p>
          ) : null}

          <p className="login-legal">
            By continuing, you agree to our{" "}
            <Link href="/terms">Terms</Link> and{" "}
            <Link href="/privacy">Privacy Policy</Link>. AI features send resume
            text to DeepSeek only after you opt in.
          </p>
        </div>
      </section>
    </main>
  );
}
