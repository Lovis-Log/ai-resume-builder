import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { UnauthorizedError } from "@/lib/errors";
import { auth } from "./server";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

function toCurrentUser(user: {
  id: string;
  email: string;
  name: string;
  image?: string | null;
}): CurrentUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image ?? null,
  };
}

/**
 * Cached per browser session. Use inside a <Suspense> boundary.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  "use cache: private";

  const { data, error } = await auth.getSession();
  if (error || !data?.user) return null;
  return toCurrentUser(data.user);
}

/**
 * Request-time authentication for Server Actions and route handlers.
 * Never trust the proxy alone.
 */
export async function requireUser(options?: { fresh?: boolean }): Promise<CurrentUser> {
  const result = options?.fresh
    ? await auth.getSession({ query: { disableCookieCache: "true" } })
    : await auth.getSession();

  if (result.error || !result.data?.user) {
    redirect("/login");
  }

  return toCurrentUser(result.data.user);
}

/**
 * Page-level authentication. Forces the segment into request-time rendering so
 * Neon Auth's cookie reads never run during prerendering.
 */
export async function requireUserForPage(options?: {
  fresh?: boolean;
}): Promise<CurrentUser> {
  await connection();
  return requireUser(options);
}

export async function requireUserForApi(options?: {
  fresh?: boolean;
}): Promise<CurrentUser> {
  const result = options?.fresh
    ? await auth.getSession({ query: { disableCookieCache: "true" } })
    : await auth.getSession();

  if (result.error || !result.data?.user) {
    throw new UnauthorizedError();
  }

  return toCurrentUser(result.data.user);
}
