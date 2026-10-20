import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type { ResumeContent } from "../resume/schema";

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  aiConsentAt: timestamp("ai_consent_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resumes = pgTable(
  "resumes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: jsonb("content").$type<ResumeContent>().notNull(),
    version: integer("version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("resumes_user_updated_idx").on(table.userId, table.updatedAt),
  ],
);

export const usageEvents = pgTable(
  "usage_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    resumeId: uuid("resume_id").references(() => resumes.id, { onDelete: "set null" }),
    kind: text("kind").notNull(),
    status: text("status").notNull().default("pending"),
    idempotencyKey: text("idempotency_key").notNull(),
    model: text("model"),
    inputTokens: integer("input_tokens"),
    outputTokens: integer("output_tokens"),
    costUsd: numeric("cost_usd", { precision: 10, scale: 6 }),
    billingPeriodStart: timestamp("billing_period_start", { withTimezone: true }),
    providerReportedAt: timestamp("provider_reported_at", { withTimezone: true }),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("usage_events_user_idempotency_idx").on(
      table.userId,
      table.idempotencyKey,
    ),
    index("usage_events_user_created_idx").on(table.userId, table.createdAt),
    index("usage_events_user_period_idx").on(table.userId, table.billingPeriodStart),
    check(
      "usage_events_kind_check",
      sql`${table.kind} in ('ai_summary','ai_bullets','ai_improve','ai_keywords','ai_tailor','pdf_download')`,
    ),
    check(
      "usage_events_status_check",
      sql`${table.status} in ('pending','succeeded','failed')`,
    ),
  ],
);

export const tailoringRuns = pgTable(
  "tailoring_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    resumeId: uuid("resume_id")
      .notNull()
      .references(() => resumes.id, { onDelete: "cascade" }),
    jobDescription: text("job_description").notNull(),
    keywords: jsonb("keywords").notNull().default([]),
    missingKeywords: jsonb("missing_keywords").notNull().default([]),
    suggestions: jsonb("suggestions"),
    status: text("status").notNull().default("keywords_ready"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("tailoring_runs_resume_created_idx").on(table.resumeId, table.createdAt),
    check(
      "tailoring_runs_status_check",
      sql`${table.status} in ('keywords_ready','tailored','applied','discarded')`,
    ),
  ],
);

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    provider: text("provider").notNull().default("manual"),
    customerId: text("customer_id"),
    subscriptionId: text("subscription_id"),
    status: text("status").notNull().default("inactive"),
    plan: text("plan").notNull().default("free"),
    currentPeriodStart: timestamp("current_period_start", { withTimezone: true }),
    currentPeriodEnd: timestamp("current_period_end", { withTimezone: true }),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("subscriptions_user_idx").on(table.userId),
    index("subscriptions_provider_sub_idx").on(table.provider, table.subscriptionId),
  ],
);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true }),
    error: text("error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("webhook_events_provider_event_idx").on(table.provider, table.eventId),
  ],
);

export const usageOutbox = pgTable(
  "usage_outbox",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    usageEventId: uuid("usage_event_id")
      .notNull()
      .references(() => usageEvents.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    payload: jsonb("payload").notNull(),
    attempts: integer("attempts").notNull().default(0),
    nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    lastError: text("last_error"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("usage_outbox_pending_idx").on(table.sentAt, table.nextAttemptAt),
  ],
);

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

export type ProfileRow = typeof profiles.$inferSelect;
export type ResumeRow = typeof resumes.$inferSelect;
export type UsageEventRow = typeof usageEvents.$inferSelect;
export type TailoringRunRow = typeof tailoringRuns.$inferSelect;
export type SubscriptionRow = typeof subscriptions.$inferSelect;
