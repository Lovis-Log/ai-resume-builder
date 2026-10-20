import Link from "next/link";
import { connection } from "next/server";
import { getCurrentUser } from "@/lib/auth/dal";
import { UserMenu } from "./user-menu";

export async function AppHeader() {
  await connection();
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-white/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold tracking-tight">
            Resume Builder
          </Link>
          <nav className="hidden items-center gap-5 text-sm text-stone-600 md:flex">
            <Link href="/dashboard" className="hover:text-stone-900">
              Dashboard
            </Link>
            <Link href="/billing" className="hover:text-stone-900">
              Billing
            </Link>
            <Link href="/settings" className="hover:text-stone-900">
              Settings
            </Link>
          </nav>
        </div>
        <UserMenu name={user.name} email={user.email} image={user.image} />
      </div>
    </header>
  );
}
