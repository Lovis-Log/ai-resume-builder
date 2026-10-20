import { z } from "zod";

export const summaryResultSchema = z.object({
  summary: z.string().min(20).max(2000),
});

export const bulletsResultSchema = z.object({
  bullets: z.array(z.string().min(10).max(500)).min(3).max(5),
});

export const improveResultSchema = z.object({
  bullet: z.string().min(10).max(500),
});

export const keywordsResultSchema = z.object({
  keywords: z
    .array(
      z.object({
        term: z.string().min(1).max(80),
        importance: z.enum(["high", "medium", "low"]),
        evidenceQuote: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(10),
});

export const tailorResultSchema = z.object({
  summary: z.object({
    suggested: z.string().min(20).max(2000),
    sourceQuotes: z.array(z.string().min(1).max(500)).max(5),
  }),
  bullets: z
    .array(
      z.object({
        id: z.string().min(1).max(100),
        suggested: z.string().min(10).max(500),
        sourceQuotes: z.array(z.string().min(1).max(500)).max(5),
      }),
    )
    .min(1)
    .max(3),
});

export type SummaryResult = z.infer<typeof summaryResultSchema>;
export type BulletsResult = z.infer<typeof bulletsResultSchema>;
export type ImproveResult = z.infer<typeof improveResultSchema>;
export type KeywordsResult = z.infer<typeof keywordsResultSchema>;
export type TailorResult = z.infer<typeof tailorResultSchema>;

const summaryJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary"],
  properties: {
    summary: { type: "string" },
  },
} as const;

const bulletsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["bullets"],
  properties: {
    bullets: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
  },
} as const;

const improveJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["bullet"],
  properties: {
    bullet: { type: "string" },
  },
} as const;

const keywordsJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["keywords"],
  properties: {
    keywords: {
      type: "array",
      minItems: 1,
      maxItems: 10,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["term", "importance", "evidenceQuote"],
        properties: {
          term: { type: "string" },
          importance: { type: "string", enum: ["high", "medium", "low"] },
          evidenceQuote: { type: "string" },
        },
      },
    },
  },
} as const;

const tailorJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "bullets"],
  properties: {
    summary: {
      type: "object",
      additionalProperties: false,
      required: ["suggested", "sourceQuotes"],
      properties: {
        suggested: { type: "string" },
        sourceQuotes: { type: "array", items: { type: "string" }, maxItems: 5 },
      },
    },
    bullets: {
      type: "array",
      minItems: 1,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "suggested", "sourceQuotes"],
        properties: {
          id: { type: "string" },
          suggested: { type: "string" },
          sourceQuotes: { type: "array", items: { type: "string" }, maxItems: 5 },
        },
      },
    },
  },
} as const;

export const jsonSchemas = {
  summary: summaryJsonSchema as unknown as Record<string, unknown>,
  bullets: bulletsJsonSchema as unknown as Record<string, unknown>,
  improve: improveJsonSchema as unknown as Record<string, unknown>,
  keywords: keywordsJsonSchema as unknown as Record<string, unknown>,
  tailor: tailorJsonSchema as unknown as Record<string, unknown>,
};
