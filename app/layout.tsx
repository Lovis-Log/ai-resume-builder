import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ToastProvider } from "@/components/ui/toast";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Resume Builder — AI resumes for new grads",
    template: "%s | Resume Builder",
  },
  description:
    "Build an ATS-safe, job-tailored resume with AI. Get a free resume score, live preview, and a clean one-click PDF.",
  applicationName: "Resume Builder",
  openGraph: {
    type: "website",
    siteName: "Resume Builder",
    title: "Resume Builder — AI resumes for new grads",
    description:
      "Build an ATS-safe, job-tailored resume with AI. Free score, live preview, one-click PDF.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Resume Builder — AI resumes for new grads",
    description:
      "Build an ATS-safe, job-tailored resume with AI. Free score, live preview, one-click PDF.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f5f4f0",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <ToastProvider>{children}</ToastProvider>
        <Analytics />
      </body>
    </html>
  );
}
