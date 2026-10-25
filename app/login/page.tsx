import type { Metadata } from "next";
import { LoginClient } from "./login-client";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Enter the Lume resume workspace.",
};

export default function LoginPage() {
  return <LoginClient />;
}
