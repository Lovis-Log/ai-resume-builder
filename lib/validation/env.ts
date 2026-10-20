import { z } from "zod";

const optionalUrl = z.string().url().optional();
const optionalString = z.string().optional();

export const envSchema = z.object({
  DATABASE_URL: optionalUrl,
  DATABASE_URL_UNPOOLED: optionalUrl,
  NEON_AUTH_BASE_URL: optionalUrl,
  NEON_AUTH_COOKIE_SECRET: z.string().min(32).optional(),
  DEEPSEEK_API_KEY: optionalString,
  DEEPSEEK_MODEL: z.string().default("deepseek-flash"),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  BILLING_PROVIDER: z.enum(["manual", "creem", "dodo"]).default("manual"),
  BILLING_WEBHOOK_SECRET: optionalString,
  CREEM_API_KEY: optionalString,
  CREEM_WEBHOOK_SECRET: optionalString,
  E2E_TEST_MODE: z.string().optional(),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);

export function requireServerEnv(key: keyof AppEnv): string {
  const value = env[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Missing required environment variable: ${String(key)}`);
  }
  return value;
}
