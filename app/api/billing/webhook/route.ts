import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { getBillingProvider } from "@/lib/billing";
import { db } from "@/lib/db";
import { webhookEvents } from "@/lib/db/schema";

export const maxDuration = 30;

export async function POST(request: Request) {
  const provider = getBillingProvider();

  if (provider.name === "manual" || !provider.enabled) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  try {
    const event = await provider.verifyWebhook(request);

    const [existing] = await db
      .select()
      .from(webhookEvents)
      .where(
        and(
          eq(webhookEvents.provider, event.provider),
          eq(webhookEvents.eventId, event.id),
        ),
      )
      .limit(1);

    if (existing?.processedAt) {
      return NextResponse.json({ ok: true, duplicate: true });
    }

    if (!existing) {
      await db.insert(webhookEvents).values({
        provider: event.provider,
        eventId: event.id,
        type: event.type,
        payload: event.payload,
      });
    }

    try {
      await provider.handleWebhook(event);
      await db
        .update(webhookEvents)
        .set({ processedAt: new Date(), error: null })
        .where(
          and(
            eq(webhookEvents.provider, event.provider),
            eq(webhookEvents.eventId, event.id),
          ),
        );
      return NextResponse.json({ ok: true });
    } catch (error) {
      await db
        .update(webhookEvents)
        .set({
          error: error instanceof Error ? error.message.slice(0, 1000) : "Unknown error",
        })
        .where(
          and(
            eq(webhookEvents.provider, event.provider),
            eq(webhookEvents.eventId, event.id),
          ),
        );
      throw error;
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[billing webhook]", error);
    }
    return NextResponse.json(
      { error: { code: "WEBHOOK_ERROR", message: "Webhook processing failed" } },
      { status: 500 },
    );
  }
}
