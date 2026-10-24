import Link from "next/link";
import { LumeLogo } from "@/components/brand/logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <LumeLogo
            tone="white"
            id="footer"
            className="footer-brand-row"
          />
          <p>
            AI drafts. Human judgment. One clean PDF. Built for early-career
            candidates who would rather apply than fiddle with margins.
          </p>
        </div>

        <nav className="footer-column" aria-label="Product">
          <h2>Product</h2>
          <a href="#how">How it works</a>
          <a href="#score">Resume score</a>
          <a href="#pricing">Pricing</a>
          <a href="#faq">FAQ</a>
        </nav>

        <nav className="footer-column" aria-label="Account">
          <h2>Account</h2>
          <Link href="/login">Start free</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/billing">Billing</Link>
          <Link href="/settings">Settings</Link>
        </nav>

        <nav className="footer-column" aria-label="Legal">
          <h2>Legal</h2>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <a href="mailto:support@lume.app">Support</a>
        </nav>
      </div>

      <div className="container footer-bottom">
        <p>© 2026 Lume. All rights reserved.</p>
        <p className="footer-disclaimer">
          AI processing is provided by DeepSeek after you opt in. Once checkout is
          connected, the billing provider is the merchant of record. This site is
          not affiliated with any applicant tracking system.
        </p>
      </div>
    </footer>
  );
}
