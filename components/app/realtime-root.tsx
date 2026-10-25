"use client";

import { useState, type ReactNode } from "react";
import { createRealtimeClient } from "@neon/realtime/client";
import { RealtimeProvider } from "@neon/realtime-react";

export function RealtimeRoot({ children }: { children: ReactNode }) {
  const [client] = useState(() =>
    createRealtimeClient({
      url: process.env.NEXT_PUBLIC_NEON_REALTIME_URL ?? "wss://invalid.local",
    }),
  );

  return <RealtimeProvider client={client}>{children}</RealtimeProvider>;
}
