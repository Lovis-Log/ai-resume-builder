"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Sparkles,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { deleteAccount, signOut } from "@/app/actions/account";
import { AiConsentDialog } from "@/components/ai/ai-dialogs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { formatShortDate } from "@/lib/utils";

export function SettingsClient({
  name,
  email,
  aiConsentAt,
}: {
  name: string;
  email: string;
  aiConsentAt: string | null;
}) {
  const router = useRouter();
  const [consentOpen, setConsentOpen] = useState(false);
  const [consented, setConsented] = useState(Boolean(aiConsentAt));
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (confirm !== "DELETE") return;

    startTransition(async () => {
      setError(null);
      try {
        await deleteAccount();
        router.replace("/");
        router.refresh();
      } catch (deleteError) {
        setError(
          deleteError instanceof Error
            ? deleteError.message
            : "Could not delete the account.",
        );
      }
    });
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <p className="mt-5 text-sm font-medium text-[var(--accent)]">Account</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight text-stone-900">
        Settings
      </h1>

      <Card className="mt-6 p-6">
        <h2 className="text-lg font-semibold text-stone-900">Profile</h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-stone-500">Name</dt>
            <dd className="font-medium text-stone-900">{name || "—"}</dd>
          </div>
          <div className="flex items-center justify-between gap-4">
            <dt className="text-stone-500">Email</dt>
            <dd className="font-medium text-stone-900">{email}</dd>
          </div>
        </dl>
        <div className="mt-5 flex gap-2">
          <Button
            variant="secondary"
            onClick={() => startTransition(() => signOut())}
            disabled={pending}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </Button>
        </div>
      </Card>

      <Card className="mt-4 p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-semibold text-stone-900">
              <Sparkles className="h-4 w-4 text-[var(--accent)]" />
              AI data processing
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-stone-600">
              AI writing and job tailoring send resume text and job descriptions
              to DeepSeek. The free score, editor, and PDF export do not.
            </p>
          </div>
          <Badge variant={consented ? "success" : "neutral"}>
            {consented ? "Enabled" : "Off"}
          </Badge>
        </div>

        {consented ? (
          <p className="mt-4 flex items-center gap-2 text-sm text-stone-600">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            Consent recorded {aiConsentAt ? `on ${formatShortDate(aiConsentAt)}` : "just now"}.
            You can withdraw it by deleting your account or contacting support.
          </p>
        ) : (
          <Button className="mt-4" onClick={() => setConsentOpen(true)}>
            Review and enable AI
          </Button>
        )}
      </Card>

      <Card className="mt-4 border-red-200 p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-red-800">
          <TriangleAlert className="h-4 w-4" />
          Delete account
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-stone-600">
          This permanently deletes your account, resumes, tailoring history, and
          usage records. If a subscription is active, cancel it first or it may
          continue to bill. This cannot be undone.
        </p>
        <Button
          variant="danger"
          className="mt-4"
          onClick={() => {
            setConfirm("");
            setError(null);
            setDeleteOpen(true);
          }}
        >
          <Trash2 className="h-4 w-4" />
          Delete my account
        </Button>
      </Card>

      <p className="mt-6 text-xs text-stone-500">
        Read the{" "}
        <Link href="/privacy" className="underline underline-offset-2">
          Privacy Policy
        </Link>{" "}
        and{" "}
        <Link href="/terms" className="underline underline-offset-2">
          Terms of Service
        </Link>
        .
      </p>

      {consentOpen ? (
        <AiConsentDialog
          open
          onClose={() => setConsentOpen(false)}
          onAccepted={() => {
            setConsented(true);
            setConsentOpen(false);
          }}
        />
      ) : null}

      <Modal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Delete your account?"
        description="This removes your resumes and cannot be undone."
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeleteOpen(false)}
              disabled={pending}
            >
              Keep my account
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={confirm !== "DELETE" || pending}
            >
              {pending ? "Deleting…" : "Delete permanently"}
            </Button>
          </>
        }
      >
        <Label htmlFor="delete-confirm">
          Type <span className="font-mono font-semibold">DELETE</span> to confirm
        </Label>
        <Input
          id="delete-confirm"
          value={confirm}
          onChange={(event) => setConfirm(event.target.value)}
          placeholder="DELETE"
          autoComplete="off"
        />
        {error ? (
          <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
      </Modal>
    </main>
  );
}
