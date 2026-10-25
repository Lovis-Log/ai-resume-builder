import { defineConfig } from "@neon/config/v1";

const allowedOrigins = Array.from(
  new Set(
    [
      "http://localhost:3000",
      "http://localhost:3001",
      process.env.NEXT_PUBLIC_APP_URL,
    ].filter((origin): origin is string => Boolean(origin)),
  ),
);

const aiEnv: Record<string, string> = {};
if (process.env.DEEPSEEK_API_KEY) {
  aiEnv.DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
}
if (process.env.DEEPSEEK_MODEL) {
  aiEnv.DEEPSEEK_MODEL = process.env.DEEPSEEK_MODEL;
}
if (process.env.DEEPSEEK_BASE_URL) {
  aiEnv.DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL;
}

export default defineConfig({
  // Declared services: Postgres is implicit; Auth, Functions, and Realtime are
  // enabled on every branch created from this config.
  preview: {
    realtime: { allowedOrigins },
  },
  auth: true,
  functions: {
    ai: {
      name: "Lume AI",
      source: "./functions/api.ts",
      ...(Object.keys(aiEnv).length > 0 ? { env: aiEnv } : {}),
    },
  },
  // Branch policy: per-branch tuning
  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return { ttl: "7d" };
    }
    return {};
  },
});
