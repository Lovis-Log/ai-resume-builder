import type { Metadata } from "next";
import { TemplatesClient } from "@/components/templates/templates-client";

export const metadata: Metadata = {
  title: "Templates",
  description: "Choose a quiet, ATS-safe frame for your resume.",
};

export default function TemplatesPage() {
  return <TemplatesClient />;
}
