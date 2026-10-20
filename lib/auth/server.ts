import { createNeonAuth } from "@neondatabase/auth/next/server";

const baseUrl =
  process.env.NEON_AUTH_BASE_URL ?? "http://localhost:3000/api/auth";
const cookieSecret =
  process.env.NEON_AUTH_COOKIE_SECRET ??
  "local-development-cookie-secret-change-me-32";

export const auth = createNeonAuth({
  baseUrl,
  cookies: {
    secret: cookieSecret,
  },
  logLevel: process.env.NODE_ENV === "production" ? "warn" : "info",
});
