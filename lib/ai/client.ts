/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";
import OpenAI from "openai";
import { ProviderError } from "@/lib/errors";
import { estimateCost } from "./usage";

const DEFAULT_MODEL = process.env.DEEPSEEK_MODEL ?? "deepseek-flash";
const BASE_URL = process.env.DEEPSEEK_BASE_URL ?? "https://api.deepseek.com";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new ProviderError("AI is not configured. Add DEEPSEEK_API_KEY.");
  }
  if (!client) {
    client = new OpenAI({
      apiKey,
      baseURL: BASE_URL,
      timeout: 60_000,
      maxRetries: 0,
    });
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

export async function generateJson<T>(
  input: GenerateJsonInput,
): Promise<AiJsonResult<T>> {
  const openai = getClient();
  const model = DEFAULT_MODEL;
  const timeoutMs = input.timeoutMs ?? 60_000;

  try {
    const response: any = await openai.responses.create({
      model,
      input: [
        { role: "system", content: input.system },
        { role: "user", content: input.user },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "result",
          schema: input.jsonSchema,
        },
      },
      max_output_tokens: input.maxTokens,
      temperature: input.temperature,
      extra_body: { thinking: { type: "disabled" } },
      timeout: timeoutMs,
    } as any);

    const text = extractResponsesText(response);
    const usage = extractResponsesUsage(response);
    return {
      data: parseJson<T>(text),
      model,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      costUsd: estimateCost(model, usage.inputTokens, usage.outputTokens),
    };
  } catch {
    try {
      const response: any = await openai.chat.completions.create({
        model,
        messages: [
          { role: "system", content: input.system },
          {
            role: "user",
            content: `${input.user}\n\nReturn only valid JSON matching this schema:\n${JSON.stringify(input.jsonSchema)}`,
          },
        ],
        response_format: { type: "json_object" },
        max_tokens: input.maxTokens,
        temperature: input.temperature,
        extra_body: { thinking: { type: "disabled" } },
        timeout: timeoutMs,
      } as any);

      const text = response.choices?.[0]?.message?.content ?? "";
      const usage = response.usage ?? {};
      const inputTokens = Number(usage.prompt_tokens ?? usage.input_tokens ?? 0);
      const outputTokens = Number(
        usage.completion_tokens ?? usage.output_tokens ?? 0,
      );

      return {
        data: parseJson<T>(text),
        model,
        inputTokens,
        outputTokens,
        costUsd: estimateCost(model, inputTokens, outputTokens),
      };
    } catch (fallbackError) {
      const message =
        fallbackError instanceof Error ? fallbackError.message : "AI request failed";
      throw new ProviderError(
        process.env.NODE_ENV === "production"
          ? "The AI provider is unavailable. Try again."
          : `AI request failed: ${message}`,
      );
    }
  }
}

function extractResponsesText(response: any): string {
  if (typeof response?.output_text === "string" && response.output_text.length > 0) {
    return response.output_text;
  }

  const output = Array.isArray(response?.output) ? response.output : [];
  const chunks: string[] = [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string") chunks.push(part.text);
    }
  }
  return chunks.join("");
}

function extractResponsesUsage(response: any): {
  inputTokens: number;
  outputTokens: number;
} {
  const usage = response?.usage ?? {};
  return {
    inputTokens: Number(usage.input_tokens ?? usage.prompt_tokens ?? 0),
    outputTokens: Number(usage.output_tokens ?? usage.completion_tokens ?? 0),
  };
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
