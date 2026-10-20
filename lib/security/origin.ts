import { ForbiddenError } from "@/lib/errors";

function allowedOrigins(request: Request): string[] {
  const origins = new Set<string>();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (appUrl) {
    try {
      origins.add(new URL(appUrl).origin);
    } catch {
      // ignore invalid config
    }
  }
  try {
    origins.add(new URL(request.url).origin);
  } catch {
    // ignore invalid request URL
  }
  return [...origins];
}

export function assertSameOrigin(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
    throw new ForbiddenError("Cross-site request blocked");
  }

  const origin = request.headers.get("origin");
  if (origin && !allowedOrigins(request).includes(origin)) {
    throw new ForbiddenError("Cross-site request blocked");
  }
}
