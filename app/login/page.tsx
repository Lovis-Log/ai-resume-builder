import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Enter the Lume resume workspace.",
};

export default function LoginPage() {
  // Authentication is intentionally disabled for the local product demo.
  redirect("/dashboard");
}
