"use client";

import { useTransition } from "react";
import Link from "next/link";
import { ChevronDown, LogOut, Settings, CreditCard } from "lucide-react";
import Image from "next/image";
import { signOut } from "@/app/actions/account";

export function UserMenu({
  name,
  email,
  image,
}: {
  name: string;
  email: string;
  image: string | null;
}) {
  const [pending, startTransition] = useTransition();
  const initial = (name || email || "?").trim().charAt(0).toUpperCase();

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-[var(--border)] bg-white py-1 pl-1 pr-3 text-sm text-stone-700 hover:bg-stone-50">
        {image ? (
          <Image
            src={image}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-full"
          />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">
            {initial}
          </span>
        )}
        <span className="max-w-32 truncate">{name || email}</span>
        <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-[var(--border)] bg-white p-1 shadow-lg">
        <div className="px-3 py-2">
          <p className="truncate text-sm font-medium text-stone-900">
            {name || "Account"}
          </p>
          <p className="truncate text-xs text-stone-500">{email}</p>
        </div>
        <Link
          href="/settings"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        <Link
          href="/billing"
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-100"
        >
          <CreditCard className="h-4 w-4" />
          Billing
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => signOut())}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-stone-700 hover:bg-stone-100 disabled:opacity-50"
        >
          <LogOut className="h-4 w-4" />
          {pending ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </details>
  );
}
