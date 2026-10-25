import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { generateJson } from "@/lib/ai/client";

const originalKey = process.env.DEEPSEEK_API_KEY;

beforeEach(() => {
  process.env.DEEPSEEK_API_KEY = "test-key";
});

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalKey === undefined) {
    delete process.env.DEEPSEEK_API_KEY;
  } else {
    process.env.DEEPSEEK_API_KEY = originalKey;
  }
});

describe("generateJson", () => {
  it("posts to DeepSeek's chat completions endpoint with JSON output", async () => {
    const fetchMock = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            id: "chatcmpl-test",
            object: "chat.completion",
            created: 1,
            model: "deepseek-flash",
            choices: [
              {
                index: 0,
                message: {
                  role: "assistant",
                  content: '{"summary":"A grounded summary."}',
                },
                finish_reason: "stop",
              },
            ],
            usage: {
              prompt_tokens: 12,
              completion_tokens: 8,
              total_tokens: 20,
            },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateJson<{ summary: string }>({
      system: "You write resumes. Return valid JSON.",
      user: "Write a summary.",
      jsonSchema: { type: "object" },
      maxTokens: 100,
      temperature: 0.5,
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as unknown as [
      RequestInfo | URL,
      RequestInit,
    ];
    expect(String(url)).toBe("https://api.deepseek.com/chat/completions");

    const headers = new Headers(init?.headers);
    expect(headers.get("authorization")).toBe("Bearer test-key");

    const body = JSON.parse(String(init?.body));
    expect(body.model).toBe("deepseek-flash");
    expect(body.response_format).toEqual({ type: "json_object" });
    expect(body.thinking).toEqual({ type: "disabled" });
    expect(body.messages?.[0]?.role).toBe("system");
    expect(body.messages?.[1]?.content).toContain("JSON Schema");

    expect(result.data.summary).toBe("A grounded summary.");
    expect(result.inputTokens).toBe(12);
    expect(result.outputTokens).toBe(8);
    expect(result.costUsd).toBeGreaterThan(0);
  });
});
