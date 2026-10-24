import type { Metadata } from "next";
import { DashboardClient } from "@/components/dashboard/dashboard-client";

export const metadata: Metadata = {
  title: "Workspace",
  description: "Your Lume resume workspace.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
