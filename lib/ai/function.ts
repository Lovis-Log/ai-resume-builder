import "server-only";
import { auth } from "@/lib/auth/server";
import { ProviderError } from "@/lib/errors";

function functionBaseUrl(): string {
  const url = process.env.NEON_FUNCTION_AI_BASE_URL;
  if (!url) {
    throw new ProviderError(
      "The AI Function is not deployed. Run `neon deploy` and pull the environment.",
    );
  }
  return url.replace(/\/$/, "");
}

export async function callAiFunction<T>(
  path: string,
  body: unknown,
): Promise<T> {
  const { data, error } = await auth.token();
  if (error || !data?.token) {
    throw new ProviderError("Could not authenticate the AI request. Sign in again.");
  }

  let response: Response;
  try {
    response = await fetch(`${functionBaseUrl()}${path}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${data.token}`,
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(45_000),
    });
  } catch {
    throw new ProviderError("The AI service could not be reached. Try again.");
  }

  if (!response.ok) {
    let message = `The AI service returned ${response.status}.`;
    try {
      const payload = (await response.json()) as { error?: unknown };
      if (typeof payload.error === "string") message = payload.error;
    } catch {
      // keep the status message
    }
    throw new ProviderError(message);
  }

  return (await response.json()) as T;
}
