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

export default defineConfig({
  // Declared services: Postgres is implicit; Auth and Realtime are enabled on
  // every branch created from this config. AI calls go straight to DeepSeek.
  preview: {
    realtime: { allowedOrigins },
  },
  auth: true,
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
