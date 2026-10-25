/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import OpenAI from "openai";
import { ProviderError } from "@/lib/errors";
import { estimateCost } from "./usage";

const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-flash";
const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";
const DEFAULT_TIMEOUT_MS = 40_000;

let client: OpenAI | null = null;
let clientKey: string | null = null;

export function isAiConfigured(): boolean {
  return Boolean(process.env.DEEPSEEK_API_KEY);
}

function getClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new ProviderError("AI is not configured. Add DEEPSEEK_API_KEY.");
  }
  if (!client || clientKey !== apiKey) {
    client = new OpenAI({
      apiKey,
      baseURL: BASE_URL,
      timeout: DEFAULT_TIMEOUT_MS,
      maxRetries: 0,
    });
    clientKey = apiKey;
  }
  return client;
}

export type JsonSchema = Record<string, unknown>;

export type AiJsonResult<T> = {
  data: T;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
};

export type GenerateJsonInput = {
  system: string;
  user: string;
  jsonSchema: JsonSchema;
  maxTokens: number;
  temperature?: number;
  timeoutMs?: number;
};

/**
 * Calls DeepSeek's OpenAI-compatible Chat Completions endpoint directly.
 *
 * DeepSeek enables JSON output through `response_format: { type: "json_object" }`
 * and asks for the word "json" plus an example of the shape in the prompt. The
 * prompts in ./prompts.ts do both; the schema is appended here as extra guidance.
 */
export async function generateJson<T>(
  input: GenerateJsonInput,
): Promise<AiJsonResult<T>> {
  const openai = getClient();
  const model = DEFAULT_MODEL;
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  let response: any;
  try {
    response = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: input.system },
        {
          role: "user",
          content: `${input.user}

Return only valid JSON matching this JSON Schema:
${JSON.stringify(input.jsonSchema)}`,
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: input.maxTokens,
      temperature: input.temperature,
      // DeepSeek turns thinking on by default. Resume drafting is faster and
      // cheaper without it. Unlike the Python SDK, the JS SDK sends unknown
      // top-level fields as-is, so this belongs in the body, not extra_body.
      thinking: { type: "disabled" },
      timeout: timeoutMs,
    } as any);
  } catch (error) {
    throw new ProviderError(providerErrorMessage(error));
  }

  const text: string = response.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) {
    throw new ProviderError("The AI returned an empty response. Try again.");
  }

  const usage = response.usage ?? {};
  const inputTokens = Number(usage.prompt_tokens ?? 0);
  const outputTokens = Number(usage.completion_tokens ?? 0);

  return {
    data: parseJson<T>(text),
    model,
    inputTokens,
    outputTokens,
    costUsd: estimateCost(model, inputTokens, outputTokens),
  };
}

function providerErrorMessage(error: unknown): string {
  if (process.env.NODE_ENV === "production") {
    return "The AI provider is unavailable. Try again.";
  }
  const message = error instanceof Error ? error.message : "unknown error";
  return `AI request failed: ${message}`;
}

export function parseJson<T>(raw: string): T {
  const trimmed = raw
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  try {
    return JSON.parse(trimmed) as T;
  } catch {
    const start = trimmed.indexOf("{");
    const end = trimmed.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(trimmed.slice(start, end + 1)) as T;
      } catch {
        // fall through
      }
    }
    throw new ProviderError("The AI returned invalid JSON. Try again.");
  }
}
