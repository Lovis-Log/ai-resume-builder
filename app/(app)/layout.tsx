import type { ReactNode } from "react";
import { DemoStoreProvider } from "@/components/app/demo-store";
import "@/app/studio.css";

export const metadata = {
  robots: { index: false, follow: false },
};

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lume-app">
      <DemoStoreProvider>{children}</DemoStoreProvider>
    </div>
  );
}
