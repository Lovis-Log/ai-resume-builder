export class AiRequestError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "AiRequestError";
    this.status = status;
    this.code = code;
  }
}

export async function postAi<T>(
  url: string,
  body: Record<string, unknown>,
): Promise<T & { usage?: { remaining: number; limit: number } }> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new AiRequestError(
      payload?.error?.message ?? "The AI request failed. Try again.",
      response.status,
      payload?.error?.code,
    );
  }

  return payload as T & { usage?: { remaining: number; limit: number } };
}
