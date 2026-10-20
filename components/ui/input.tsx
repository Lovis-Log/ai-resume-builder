"use client";

import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 placeholder:text-stone-400 outline-none transition focus:border-[var(--accent)] focus:ring-2 focus:ring-teal-100",
        className,
      )}
      {...props}
    />
  );
}
